---
title: 'DOM 操作与事件处理 [P4-P5]'
level: 'junior'
tags: ['JavaScript', 'DOM', '事件', '事件委托', '事件冒泡']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# DOM 操作与事件处理 [P4-P5]

> DOM 是浏览器提供的编程接口，通过 JS 操作 DOM 实现页面动态更新。事件处理是用户交互的基础。

## 核心概念（What）

### 获取元素

```javascript
// 推荐方式
const el = document.querySelector('.box') // 第一个匹配元素
const els = document.querySelectorAll('.box') // 所有匹配元素（NodeList）

// 旧方式
const byId = document.getElementById('app')
const byClass = document.getElementsByClassName('box') // HTMLCollection
const byTag = document.getElementsByTagName('div') // HTMLCollection

// NodeList vs HTMLCollection
// NodeList：支持 forEach，静态（获取后不更新）
// HTMLCollection：不支持 forEach，实时（DOM 变化会更新）
```

### 操作元素

```javascript
const el = document.querySelector('.box')

// 内容
el.textContent = '纯文本' // 安全（不解析 HTML）
el.innerHTML = '<b>HTML</b>' // 解析 HTML（注意 XSS！）

// 属性
el.getAttribute('href')
el.setAttribute('href', '/new')
el.removeAttribute('href')
el.hasAttribute('href')

// class 操作
el.classList.add('active')
el.classList.remove('active')
el.classList.toggle('active') // 切换
el.classList.contains('active') // 检查

// 样式
el.style.color = 'red'
el.style.backgroundColor = '#fff'
el.style.cssText = 'color: red; font-size: 16px;'

// dataset（data-* 属性）
// HTML: <div data-user-id="123" data-role="admin">
el.dataset.userId // '123'
el.dataset.role // 'admin'
el.dataset.userId = '456' // 修改
```

### 创建和插入元素

```javascript
// 创建元素
const div = document.createElement('div')
div.textContent = '新元素'
div.classList.add('card')

// 插入元素
document.body.appendChild(div) // 末尾追加
parent.insertBefore(div, referenceNode) // 指定位置前

// 现代 API（推荐）
parent.append(div) // 末尾（支持多个/文本）
parent.prepend(div) // 开头
parent.before(div) // 元素前面
parent.after(div) // 元素后面
div.remove() // 移除自身

// 克隆
const clone = div.cloneNode(true) // true = 深克隆（含子元素）
```

### 事件处理

```javascript
const button = document.querySelector('.btn')

// 添加事件监听
button.addEventListener('click', (event) => {
  console.log('Clicked!', event.target)
})

// 移除事件监听
const handler = () => console.log('clicked')
button.addEventListener('click', handler)
button.removeEventListener('click', handler)

// 常用事件
// click, dblclick, mouseenter, mouseleave
// keydown, keyup, keypress
// focus, blur, input, change
// submit, reset
// scroll, resize, load

// 事件对象
button.addEventListener('click', (e) => {
  e.target // 触发事件的元素
  e.currentTarget // 绑定事件的元素（= this）
  e.preventDefault() // 阻止默认行为
  e.stopPropagation() // 阻止冒泡
})

// 键盘事件
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    /* 回车 */
  }
  if (e.key === 'Escape') {
    /* ESC */
  }
  if (e.ctrlKey && e.key === 's') {
    /* Ctrl+S */
  }
})
```

### 事件冒泡与委托

```javascript
// 事件冒泡：事件从目标元素向上传播到 document
// <ul>
//   <li>Item 1</li>
//   <li>Item 2</li>
//   <li>Item 3</li>
// </ul>

// 事件委托：在父元素上监听，利用冒泡处理子元素事件
const list = document.querySelector('ul')

list.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Clicked:', e.target.textContent)
  }
})

// 优势：
// ├── 只需一个事件监听器（而非每个 li 一个）
// ├── 动态添加的 li 自动生效
// └── 内存占用更少
```

---

## 常见面试题

### Q1: `textContent` 和 `innerHTML` 的区别？

**答**：

- `textContent`：设置纯文本，不解析 HTML（安全）
- `innerHTML`：解析 HTML 字符串（有 XSS 风险）
- 推荐用 `textContent`，需要 HTML 时用框架（如 Vue 的 `v-html`）

### Q2: 什么是事件委托？为什么用它？

**答**：

- 在父元素上监听事件，利用冒泡处理子元素
- 优势：减少事件监听器数量、动态元素自动生效、节省内存

### Q3: `e.target` 和 `e.currentTarget` 的区别？

**答**：

- `e.target`：实际触发事件的元素（点击的那个）
- `e.currentTarget`：绑定事件监听器的元素
- 事件委托中，`target` 是子元素，`currentTarget` 是父元素

---

## 延伸练习

1. 用 JS 动态创建一个列表（5 个 li 元素）
2. 实现事件委托：点击 li 时高亮当前项
3. 用 `addEventListener` 实现键盘快捷键（Ctrl+S 阻止保存）

---

## 参考资料

- [MDN DOM 操作](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
- [事件冒泡与委托](https://javascript.info/event-delegation)
