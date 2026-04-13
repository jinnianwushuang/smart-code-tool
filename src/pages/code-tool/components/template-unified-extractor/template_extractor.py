import re
from typing import List, Set, Optional

class TemplateExtractor:
    """
    Vue 模板全能提取器 - Python 实现
    保持与 template-unified-extractor.vue 逻辑一致
    """

    MUSTACHE_REGEX = r'\{\{(.*?)\}\}'
    VUE_EVENT_REGEX = r'@([\w-]+)((?:\.[\w-]+)*)\s*=\s*["\']([^"\']+)["\']'
    COLON_PROP_REGEX = r':([\w.-]+)="([^"]+)"'

    def __init__(self):
        self.mustache_props: List[str] = []
        self.mustache_methods: List[str] = []
        self.event_functions: List[str] = []
        self.colon_props: List[str] = []

    def _extract_base_variable(self, expression: str) -> str:
        # 模拟 project-common.js 中的 extract_base_variable
        # 提取基础变量名 (例如: item.name -> item)
        content = expression.strip()
        return content.split('.')[0].split('[')[0].strip()

    def _parse_vue_handler(self, expression: str) -> Optional[str]:
        content = expression.strip()
        # 排除复杂表达式
        if not content or any(op in content for op in "=+-*/&|!>"):
            return None
        # 提取函数名
        match = re.match(r'^([a-zA-Z_$][\w$]*)', content)
        return match.group(1) if match else None

    def process_all(self, raw_template: str):
        if not raw_template:
            self.reset_result()
            return

        # 1. 提取 Mustache {{ }}
        m_props: Set[str] = set()
        m_methods: Set[str] = set()
        for match in re.finditer(self.MUSTACHE_REGEX, raw_template):
            inner = match.group(1).strip()
            if '(' in inner:
                func_name = inner.split('(')[0].strip()
                if func_name:
                    m_methods.add(func_name)
            else:
                base_prop = self._extract_base_variable(inner)
                if base_prop:
                    m_props.add(base_prop)

        self.mustache_props = sorted(list(m_props))
        self.mustache_methods = sorted(list(m_methods))

        # 2. 提取事件 @
        e_funcs: Set[str] = set()
        for match in re.finditer(self.VUE_EVENT_REGEX, raw_template):
            func_name = self._parse_vue_handler(match.group(3))
            if func_name:
                e_funcs.add(func_name)
        self.event_functions = sorted(list(e_funcs))

        # 3. 提取绑定属性 :
        c_props: Set[str] = set()
        for match in re.finditer(self.COLON_PROP_REGEX, raw_template):
            attr_val = match.group(2).strip()
            if attr_val:
                base_val = self._extract_base_variable(attr_val)
                c_props.add(base_val)
        self.colon_props = sorted(list(c_props))

    def reset_result(self):
        self.mustache_props = []
        self.mustache_methods = []
        self.event_functions = []
        self.colon_props = []

    def get_summary(self):
        return {
            "interpolation_count": len(self.mustache_props) + len(self.mustache_methods),
            "event_count": len(self.event_functions),
            "prop_count": len(self.colon_props)
        }
