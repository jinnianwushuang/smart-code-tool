use regex::Regex;
use std::collections::HashSet;

/// Vue 模板全能提取器 - Rust 实现
/// 字段结构与 Vue 组件及 Python 版本保持高度一致
pub struct TemplateExtractor {
    pub mustache_props: Vec<String>,
    pub mustache_methods: Vec<String>,
    pub event_functions: Vec<String>,
    pub colon_props: Vec<String>,

    // 预编译正则以提高性能
    re_mustache: Regex,
    re_event: Regex,
    re_colon: Regex,
}

impl TemplateExtractor {
    pub fn new() -> Self {
        Self {
            mustache_props: Vec::new(),
            mustache_methods: Vec::new(),
            event_functions: Vec::new(),
            colon_props: Vec::new(),
            re_mustache: Regex::new(r"\{\{(.*?)\}\}").unwrap(),
            re_event: Regex::new(r#"@([\w-]+)((?:\.[\w-]+)*)\s*=\s*["']([^"']+)["']"#).unwrap(),
            re_colon: Regex::new(r#":([\w.-]+)="([^"]+)""#).unwrap(),
        }
    }

    fn extract_base_variable(&self, expression: &str) -> String {
        expression.trim()
            .split('.')
            .next()
            .unwrap_or("")
            .split('[')
            .next()
            .unwrap_or("")
            .to_string()
    }

    fn parse_vue_handler(&self, expression: &str) -> Option<String> {
        let content = expression.trim();
        let forbidden = ['=', '+', '-', '*', '/', '&', '|', '!', '>'];
        if content.is_empty() || content.contains(|c| forbidden.contains(&c)) {
            return None;
        }

        // 提取首个合法标识符
        content.split(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')
            .next()
            .map(|s| s.to_string())
    }

    pub fn process_all(&mut self, raw_template: &str) {
        self.reset_result();
        if raw_template.is_empty() { return; }

        // 1. Mustache
        let mut m_props = HashSet::new();
        let mut m_methods = HashSet::new();
        for cap in self.re_mustache.captures_iter(raw_template) {
            let inner = cap[1].trim();
            if inner.contains('(') {
                if let Some(name) = inner.split('(').next() {
                    m_methods.insert(name.trim().to_string());
                }
            } else {
                let base = self.extract_base_variable(inner);
                if !base.is_empty() { m_props.insert(base); }
            }
        }
        self.mustache_props = m_props.into_iter().collect();
        self.mustache_methods = m_methods.into_iter().collect();

        // 2. Events
        let mut e_funcs = HashSet::new();
        for cap in self.re_event.captures_iter(raw_template) {
            if let Some(func) = self.parse_vue_handler(&cap[3]) {
                e_funcs.insert(func);
            }
        }
        self.event_functions = e_funcs.into_iter().collect();

        // 3. Colon Props
        let mut c_props = HashSet::new();
        for cap in self.re_colon.captures_iter(raw_template) {
            let base = self.extract_base_variable(&cap[2]);
            if !base.is_empty() { c_props.insert(base); }
        }
        self.colon_props = c_props.into_iter().collect();
    }

    pub fn reset_result(&mut self) {
        self.mustache_props.clear();
        self.mustache_methods.clear();
        self.event_functions.clear();
        self.colon_props.clear();
    }
}
