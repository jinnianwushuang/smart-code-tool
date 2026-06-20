# 正则表达式速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: 所有开发人员

---

## 📑 目录

- [一、基础语法](#一基础语法)
- [二、字符类](#二字符类)
- [三、量词](#三量词)
- [四、分组与引用](#四分组与引用)
- [五、断言](#五断言)
- [六、标志](#六标志)
- [七、常用示例](#七常用示例)
- [八、性能优化建议](#八性能优化建议)
- [九、VSCode 前端代码检查常用正则](#九vscode-前端代码检查常用正则)
- [十、在线工具推荐](#十在线工具推荐)
- [十一、VSCode 正则搜索快捷键](#十一vscode-正则搜索快捷键)

---

## 一、基础语法

### 1.1 基本匹配

```javascript
// 直接匹配
/abc/.test('abc') // true

// 转义特殊字符
/a\.b/.test('a.b') // true
/a\\b/.test('a\\b') // true
```

### 1.2 字符集

```javascript
// 匹配任意一个字符
/[abc]/.test('a') // true
/[abc]/.test('d') // false

// 范围
/[a-z]/.test('m') // true
/[0-9]/.test('5') // true
```

---

## 二、字符类

### 2.1 预定义字符类

| 符号 | 含义                 | 等价于           |
| ---- | -------------------- | ---------------- |
| `.`  | 任意字符（除换行符） | -                |
| `\d` | 数字                 | `[0-9]`          |
| `\D` | 非数字               | `[^0-9]`         |
| `\w` | 单词字符             | `[a-zA-Z0-9_]`   |
| `\W` | 非单词字符           | `[^a-zA-Z0-9_]`  |
| `\s` | 空白字符             | `[\t\n\r\f\v ]`  |
| `\S` | 非空白字符           | `[^\t\n\r\f\v ]` |

```javascript
/\d/.test('5') // true
/\w/.test('a') // true
/\s/.test(' ') // true
```

### 2.2 自定义字符类

```javascript
// 元音字母
/[aeiou]/i.test('A') // true

// 排除字符类
/[^0-9]/.test('a') // true

// 包含连字符
/[a-z\-]/.test('-') // true
```

---

## 三、量词

### 3.1 基本量词

| 符号    | 含义        | 示例                              |
| ------- | ----------- | --------------------------------- |
| `*`     | 0 次或多次  | `ab*c` 匹配 "ac", "abc", "abbc"   |
| `+`     | 1 次或多次  | `ab+c` 匹配 "abc", "abbc"         |
| `?`     | 0 次或 1 次 | `ab?c` 匹配 "ac", "abc"           |
| `{n}`   | 恰好 n 次   | `a{3}` 匹配 "aaa"                 |
| `{n,}`  | 至少 n 次   | `a{2,}` 匹配 "aa", "aaa"          |
| `{n,m}` | n 到 m 次   | `a{2,4}` 匹配 "aa", "aaa", "aaaa" |

```javascript
/\d{3}/.test('123') // true
/\d{3,}/.test('12345') // true
/\d{2,4}/.test('123') // true
```

### 3.2 贪婪与惰性

```javascript
// 贪婪匹配（默认）
/<.*>/.exec('<div><span></span></div>') // ['<div><span></span></div>']

// 惰性匹配（加 ?）
/<.*?>/.exec('<div><span></span></div>') // ['<div>']
```

---

## 四、分组与引用

### 4.1 捕获组

```javascript
// 基本分组
/(\d{4})-(\d{2})-(\d{2})/.exec('2024-01-15')
// ['2024-01-15', '2024', '01', '15']

// 命名捕获组
/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/.exec('2024-01-15')
// groups: { year: '2024', month: '01', day: '15' }
```

### 4.2 非捕获组

```javascript
// 不捕获，仅分组
;/(?:https?):\/\/(.+)/.exec('https://example.com')
// ['https://example.com', 'example.com']
```

### 4.3 反向引用

```javascript
// 匹配重复的单词
/\b(\w+)\s+\1\b/.test('hello hello') // true

// 匹配成对的标签
/<([a-z]+)>.*<\/\1>/.test('<div>content</div>') // true
```

---

## 五、断言

### 5.1 边界断言

| 符号 | 含义       |
| ---- | ---------- |
| `^`  | 字符串开头 |
| `$`  | 字符串结尾 |
| `\b` | 单词边界   |
| `\B` | 非单词边界 |

```javascript
/^Hello/.test('Hello World') // true
/World$/.test('Hello World') // true
/\bword\b/.test('a word here') // true
```

### 5.2 lookahead（先行断言）

```javascript
// 正向前瞻：后面跟着
/\d+(?=px)/.exec('100px') // ['100']

// 负向前瞻：后面不跟着
/\d+(?!px)/.exec('100em') // ['100']
```

### 5.3 lookbehind（后行断言）

```javascript
// 正向后顾：前面是
/(?<=\$)\d+/.exec('$100') // ['100']

// 负向后顾：前面不是
/(?<!\$)\d+/.exec('€100') // ['100']
```

---

## 六、标志

### 6.1 常用标志

| 标志 | 含义                          |
| ---- | ----------------------------- |
| `g`  | 全局匹配                      |
| `i`  | 忽略大小写                    |
| `m`  | 多行模式                      |
| `s`  | dotAll 模式（`.` 匹配换行符） |
| `u`  | Unicode 模式                  |
| `y`  | 粘性匹配                      |

```javascript
// 全局匹配
'aaa'.match(/a/g) // ['a', 'a', 'a']

// 忽略大小写
/abc/i.test('ABC') // true

// 多行模式
/^Line/m.test('First\nLine') // true
```

### 6.2 组合使用

```javascript
// 全局 + 忽略大小写
'Hello HELLO hello'.match(/hello/gi)
// ['Hello', 'HELLO', 'hello']
```

---

## 七、常用示例

### 7.1 邮箱验证

```javascript
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

emailRegex.test('user@example.com') // true
emailRegex.test('invalid@') // false
```

### 7.2 URL 验证

```javascript
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

urlRegex.test('https://example.com') // true
urlRegex.test('ftp://example.com') // false
```

### 7.3 手机号验证（中国）

```javascript
const phoneRegex = /^1[3-9]\d{9}$/

phoneRegex.test('13812345678') // true
phoneRegex.test('12345678901') // false
```

### 7.4 身份证验证（中国）

```javascript
const idCardRegex = /^\d{17}[\dXx]$/

idCardRegex.test('110101199001011234') // true
idCardRegex.test('11010119900101123X') // true
```

### 7.5 提取 HTML 标签内容

```javascript
const html = '<div class="test">Hello World</div>'
const match = /<div[^>]*>(.*?)<\/div>/.exec(html)
console.log(match[1]) // 'Hello World'
```

### 7.6 替换文本

```javascript
// 移除多余空格
'  Hello   World  '.replace(/\s+/g, ' ').trim()
// 'Hello World'

// 格式化日期
'2024/01/15'.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3')
// '2024-01-15'
```

### 7.7 密码强度验证

```javascript
// 至少 8 位，包含大小写字母和数字
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

passwordRegex.test('Password123') // true
passwordRegex.test('password') // false
```

### 7.8 IPv4 地址验证

```javascript
const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/

ipv4Regex.test('192.168.1.1') // true
ipv4Regex.test('256.1.1.1') // true (需要额外验证范围)
```

### 7.9 JSON 键值对提取

```javascript
const json = '{"name": "John", "age": 30}'
const matches = json.match(/"(\w+)":\s*"?([^",}]+)"?/g)
// ['"name": "John"', '"age": 30']
```

### 7.10 CSS 颜色值匹配

```javascript
// Hex 颜色
const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

hexColor.test('#FFF') // true
hexColor.test('#FF0000') // true

// RGB 颜色
const rgbColor = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/

rgbColor.test('rgb(255, 0, 0)') // true
```

---

## 八、性能优化建议

### 8.1 避免灾难性回溯

```javascript
// ❌ 糟糕：可能导致灾难性回溯
/(a+)+b/.test('aaaaaaaaaaaaaaaaaaaaaab')

// ✅ 改进：使用原子组或简化
/a+b/.test('aaaaaaaaaaaaaaaaaaaaaab')
```

### 8.2 使用具体字符类

```javascript
// ❌ 较慢
/.*\.txt$/

// ✅ 更快
/[^.]*\.txt$/
```

### 8.3 锚定模式

```javascript
// ❌ 从头开始搜索
/\d+/

// ✅ 如果知道位置，使用锚点
/^\d+$/
```

---

## 九、VSCode 前端代码检查常用正则

### 9.1 查找未使用的变量

```regex
// 查找声明但未使用的变量（需要配合 ESLint）
\b(const|let|var)\s+(\w+)\s*=
```

**VSCode 搜索技巧**：

- 使用 `Ctrl+Shift+F` 打开全局搜索
- 启用正则表达式模式（点击 `.*` 图标）
- 在文件中搜索特定模式

### 9.2 查找 console.log

```regex
// 查找所有 console.log
console\.log\(.*?\)

// 查找 console 的其他方法
console\.(log|warn|error|info|debug|trace)\(

// 查找带字符串的 console.log
console\.log\(['"`]([^'"]+)['"`]
```

**用途**：上线前清理调试代码

### 9.3 查找 TODO/FIXME 注释

```regex
// 查找 TODO 注释
\/\/\s*TODO[:\s]*(.*)

// 查找 FIXME 注释
\/\/\s*FIXME[:\s]*(.*)

// 查找 HACK 注释
\/\/\s*HACK[:\s]*(.*)

// 查找所有特殊注释
\/\/\s*(TODO|FIXME|HACK|NOTE|BUG)[:\s]*(.*)
```

**用途**：代码审查时快速定位待处理问题

### 9.4 查找硬编码的值

```regex
// 查找硬编码的数字（可能是魔法数字）
\b(?!0|1|2\b)\d{2,}\b

// 查找硬编码的颜色值
#[0-9A-Fa-f]{6}\b
#[0-9A-Fa-f]{3}\b

// 查找硬编码的 URL
https?:\/\/[^\s'"]+

// 查找硬编码的路径
['"](?:\/[^'"]*)+['"]
```

**用途**：代码规范化检查

### 9.5 查找重复的代码模式

```regex
// 查找重复的 import 语句
import\s+.*?from\s+['"](.+?)['"]

// 查找空的 catch 块
catch\s*\([^)]*\)\s*\{\s*\}

// 查找空的函数
function\s+\w+\s*\([^)]*\)\s*\{\s*\}
\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\}

// 查找未使用的导入
import\s+(?!.*?from)\w+
```

### 9.6 Vue 相关检查

```regex
// 查找未使用的组件注册
components:\s*\{[^}]*\}

// 查找 v-if 和 v-show 同时使用
v-if=["'][^"']*["'].*v-show=["'][^"']*["']

// 查找缺少 key 的 v-for
v-for=["'][^"']*["'](?!.*key=)

// 查找内联样式
:style=["'][^"']*["']
style=["'][^"']*["']

// 查找直接操作 DOM
document\.(getElementById|querySelector|querySelectorAll)
this\.\$refs\.\w+
```

**用途**：Vue 最佳实践检查

### 9.7 React 相关检查

```regex
// 查找未使用的 state
this\.state\s*=\s*\{[^}]*\}

// 查找直接在 render 中定义的函数
render\(\)\s*\{[^}]*const\s+\w+\s*=\s*\([^)]*\)\s*=>

// 查找缺少 key 的列表渲染
\.map\(([^)]+)\)\s*=>\s*(?!.*key=)

// 查找直接使用 index 作为 key
key={index}
key={i}

// 查找 dangerouslySetInnerHTML
dangerouslySetInnerHTML
```

**用途**：React 最佳实践检查

### 9.8 CSS/SCSS 检查

```regex
// 查找 !important
!important

// 查找过长的选择器
(?:[^,{]+,){4,}[^,{]+\{

// 查找嵌套过深的规则
(?:\s*[^{]+\{){4,}

// 查找硬编码的像素值
\b\d+px\b

// 查找重复的属性
(\w[\w-]*):[^;]+;[^}]*\1:
```

**用途**：CSS 代码质量检查

### 9.9 TypeScript 检查

```regex
// 查找 any 类型
:\s*any\b

// 查找非空断言
!\.

// 查找类型断言（建议使用 as 语法）
<[^>]+>\w+

// 查找未使用的类型导入
import\s+type\s+\w+

// 查找 @ts-ignore 注释
\/\/\s*@ts-ignore
\/\/\s*@ts-nocheck
```

**用途**：TypeScript 严格模式检查

### 9.10 性能相关检查

```regex
// 查找可能的内存泄漏（未清理的定时器）
setInterval\(
setTimeout\(

// 查找大型对象字面量
\{[^}]{500,}\}

// 查找深层嵌套的对象访问
\w+(?:\.\w+){5,}

// 查找同步 XMLHttpRequest
new\s+XMLHttpRequest\(

// 查找 document.write
document\.write\(
```

**用途**：性能优化提示

### 9.11 安全性检查

```regex
// 查找 eval 使用
eval\(

// 查找 innerHTML 赋值
\.innerHTML\s*=

// 查找潜在的 XSS
v-html=
dangerouslySetInnerHTML

// 查找不安全的协议
javascript:
data:

// 查找硬编码的密钥/密码
(password|secret|key|token)\s*[:=]\s*['"][^'"]+['"]
```

**用途**：安全漏洞扫描

### 9.12 VSCode 搜索高级技巧

#### 排除文件/文件夹

在 VSCode 搜索框中，可以使用 `files to exclude` 字段：

```
// 排除 node_modules 和 dist
node_modules,dist,build,.git

// 排除测试文件
*.test.*,*.spec.*,__tests__
```

#### 多文件替换

```regex
// 查找并替换 console.log 为注释
查找: console\.log\((.*?)\)
替换: // console.log($1)

// 查找并移除 debugger
查找: debugger;
替换: (留空)

// 批量修改 import 路径
查找: from ['"]@\/components\/(.+?)['"]
替换: from '@/ui/components/$1'
```

#### 使用捕获组进行复杂替换

```regex
// 将 var 改为 const/let
查找: \bvar\s+(\w+)
替换: const $1  (或 let $1)

// 统一引号风格（单引号改双引号）
查找: '([^']*)'
替换: "$1"

// 添加分号
查找: ([^;{])\s*$
替换: $1;
```

### 9.13 实用组合示例

```regex
// 查找所有异步函数但没有 await
async\s+function\s+\w+\([^)]*\)\s*\{(?:(?!await).)*\}

// 查找 Promise 但没有 .catch()
new\s+Promise\([^)]*\)(?!.*\.catch)

// 查找未处理的 fetch
fetch\([^)]*\)(?!.*\.then|.*\.catch|.*await)

// 查找可能的竞态条件
useEffect\([^)]*\[\]\)(?!.*cleanup|.*return)

// 查找未优化的图片（没有 width/height）
<img(?:(?!width|height).)*>
```

---

## 十、在线工具推荐

- [Regex101](https://regex101.com/) - 在线测试和调试
- [RegExr](https://regexr.com/) - 可视化正则表达式
- [Debuggex](https://www.debuggex.com/) - 图形化正则表达式
- [RegexBuddy](https://www.regexbuddy.com/) - 正则表达式学习工具

---

## 十一、VSCode 正则搜索快捷键

| 快捷键         | 功能               |
| -------------- | ------------------ |
| `Ctrl+F`       | 当前文件搜索       |
| `Ctrl+H`       | 当前文件替换       |
| `Ctrl+Shift+F` | 全局搜索           |
| `Ctrl+Shift+H` | 全局替换           |
| `Alt+R`        | 切换正则表达式模式 |
| `Alt+C`        | 切换大小写敏感     |
| `Alt+W`        | 切换全字匹配       |

**提示**：在搜索框中点击 `.*` 图标即可启用正则表达式模式。

---

**最佳实践建议**：

1. **代码审查时**：使用 TODO/FIXME 正则快速定位待处理问题
2. **上线前检查**：使用 console.log 和 debugger 正则清理调试代码
3. **性能优化**：定期使用性能相关正则扫描代码库
4. **安全检查**：使用安全性正则发现潜在漏洞
5. **代码规范**：团队统一使用相同的正则规则进行代码检查

**注意**：正则表达式虽然强大，但过度复杂的正则可能难以维护。在可能的情况下，考虑使用更简单的字符串方法、专门的解析库或 ESLint/Prettier 等工具。
