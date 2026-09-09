---
title: 'HTML5 语义化与文档结构 [P4-P5]'
level: 'junior'
tags: ['HTML5', '语义化', 'SEO', '无障碍']
difficulty: 'medium'
updated: '2026-09-10'
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
