---
title: 'HTML5 语义化与文档结构 [P4-P5]'
level: 'junior'
tags: ['HTML5', '语义化', 'SEO', '无障碍']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# HTML5 语义化与文档结构 [P4-P5]

> 语义化 HTML 是前端开发的基本功。使用正确的标签表达内容含义，有助于 SEO、无障碍访问和代码可维护性。

## 核心概念（What）

### 什么是语义化？

```
语义化 = 用正确的标签表达内容的含义

反例（无语义）：
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">
    <div class="title">标题</div>
  </div>
</div>

正例（语义化）：
<header>
  <nav>...</nav>
</header>
<main>
  <article>
    <h1>标题</h1>
  </article>
</main>
```

### 常用语义标签

```html
<!-- 页面结构标签 -->
<header>
  <!-- 页头：Logo、导航 -->
  <nav>
    <!-- 导航区域 -->
    <main>
      <!-- 页面主体内容（唯一） -->
      <article>
        <!-- 独立内容块（文章、帖子） -->
        <section>
          <!-- 主题性内容分组 -->
          <aside>
            <!-- 侧边栏、辅助内容 -->
            <footer>
              <!-- 页脚：版权、链接 -->

              <!-- 文本语义标签 -->
              <figure>
                <!-- 图片/图表 + 说明 -->
                <figcaption>
                  <!-- 图片说明文字 -->
                  <mark>
                    <!-- 高亮文本 -->
                    <time>
                      <!-- 时间日期 -->
                      <details>
                        <!-- 可折叠内容 -->
                        <summary>
                          <!-- 折叠标题 -->

                          <!-- 完整页面结构 -->
                          <body>
                            <header>
                              <h1>网站标题</h1>
                              <nav>
                                <ul>
                                  <li><a href="/">首页</a></li>
                                  <li><a href="/about">关于</a></li>
                                </ul>
                              </nav>
                            </header>

                            <main>
                              <article>
                                <h2>文章标题</h2>
                                <time datetime="2026-09-10">2026年9月10日</time>
                                <section>
                                  <h3>章节一</h3>
                                  <p>内容...</p>
                                </section>
                                <figure>
                                  <img src="chart.png" alt="数据图表" />
                                  <figcaption>图1：月度数据</figcaption>
                                </figure>
                              </article>

                              <aside>
                                <h3>相关链接</h3>
                                <ul>
                                  ...
                                </ul>
                              </aside>
                            </main>

                            <footer>
                              <p>&copy; 2026 公司名称</p>
                            </footer>
                          </body>
                        </summary>
                      </details></time
                    ></mark
                  >
                </figcaption>
              </figure>
            </footer>
          </aside>
        </section>
      </article>
    </main>
  </nav>
</header>
```

---

## 底层原理（Why）

### HTML 语义化与文档对象模型底层

```
HTML 语义化的底层原理：

  1. DOM 树的构建过程：
     ├── 1. 解析 HTML：字节流 → 字符流 → Token
     ├── 2. 构建 DOM 树：Token → 节点对象
     │   ├── 每个 HTML 标签对应一个 Element 节点
     │   ├── 文本内容对应 Text 节点
     │   └── 节点之间形成父子/兄弟关系
     └── 3. 语义化标签的作用：
         ├── 对浏览器：提供结构信息（辅助解析）
         ├── 对搜索引擎：理解页面内容结构
         └── 对开发者：提高代码可读性

  2. 语义化标签的分类与用途：
     ├── 结构性标签：
     │   ├── <header>：页眉（通常包含 logo、导航）
     │   ├── <nav>：导航链接集合
     │   ├── <main>：页面主要内容（唯一）
     │   ├── <article>：独立内容（可复用）
     │   ├── <section>：主题性内容分组
     │   └── <footer>：页脚
     ├── 文本级标签：
     │   ├── <h1>-<h6>：标题层级（影响 SEO）
     │   ├── <p>：段落
     │   ├── <ul>/<ol>：列表
     │   └── <blockquote>：引用
     └── 内联标签：
         ├── <strong>：重要文本（加粗）
         ├── <em>：强调文本（斜体）
         └── <a>：超链接

  3. 无障碍访问（A11y）的底层支持：
     ├── 屏幕阅读器依赖 DOM 结构理解页面
     ├── 语义化标签提供隐含的 ARIA 角色：
     │   ├── <nav> → role="navigation"
     │   ├── <main> → role="main"
     │   └── <button> → role="button"
     └── 非语义化标签（<div>/<span>）没有隐含角色
         └── 需要手动添加 aria-* 属性

  4. SEO 与语义化的关系：
     ├── 搜索引擎爬虫解析 DOM 树
     ├── 标题标签（<h1>）权重最高
     ├── 语义化结构帮助爬虫理解内容层次
     └── <meta> 标签提供页面元数据（描述、关键词）
```

---

## 常见面试题

### Q1: 为什么要使用语义化标签？

**答**：

- SEO：搜索引擎能更好理解页面结构
- 无障碍：屏幕阅读器能正确朗读内容
- 可维护性：代码可读性更好
- 样式分离：标签本身表达结构，CSS 负责样式

### Q2: `<div>` 和 `<section>` 的区别？

**答**：

- `<div>`：无语义容器，纯粹用于样式/脚本
- `<section>`：有语义的内容分组，表示一个主题区块
- 规则：如果一个区块有标题（h1-h6），用 `<section>`；否则用 `<div>`

### Q3: `<article>` 和 `<section>` 的区别？

**答**：

- `<article>`：独立的、可复用的内容（博客文章、新闻、评论）
- `<section>`：主题性分组（章节、标签页内容）
- `<article>` 内可以有多个 `<section>`，反之亦然

---

## 延伸练习

1. 将一个纯 `<div>` 布局的页面改为语义化标签
2. 使用 `<details>/<summary>` 实现折叠面板（不用 JS）
3. 用 WAVE 工具检测页面的无障碍性

---

## 参考资料

- [MDN HTML 语义元素](https://developer.mozilla.org/zh-CN/docs/Glossary/Semantics)
- [HTML5 语义化指南](https://www.w3schools.com/html/html5_semantic_elements.asp)
