---
title: '浏览器存储全景 [P4-P5]'
level: 'junior'
tags: ['localStorage', 'sessionStorage', 'Cookie', 'IndexedDB', 'Cache API', '存储']
difficulty: 'medium'
updated: '2026-09-16'
target: 'P4-P5 初级工程师'
---

# 浏览器存储全景 [P4-P5]

> 浏览器提供了从简单键值到完整数据库的多层次存储能力。理解每种存储的定位、容量、生命周期和适用场景，是前端工程师的基本功。

## 核心概念（What）

### 六大存储机制总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        浏览器存储全景图                                      │
│                                                                             │
│   简单键值存储                  结构化存储              网络层缓存            │
│   ┌──────────────┐             ┌──────────────┐       ┌──────────────┐     │
│   │ Web Storage  │             │  IndexedDB   │       │  Cache API   │     │
│   │ • localStorage│            │  (浏览器内   │       │  (Service    │     │
│   │ • sessionSto.│             │   数据库)     │       │   Worker     │     │
│   └──────────────┘             └──────────────┘       │   专用)      │     │
│                                                        └──────────────┘     │
│   ┌──────────────┐             ┌──────────────┐                            │
│   │   Cookie     │             │   Web SQL    │                            │
│   │  (HTTP 协议  │             │  (已废弃，   │                            │
│   │   级存储)    │             │   仅了解)     │                            │
│   └──────────────┘             └──────────────┘                            │
│                                                                             │
│   容量：4KB ← 5MB ← 50MB+ ← 无上限（按百分比）                              │
│   复杂度：低 ←────── 中 ←────── 高                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 全维度对比

| 维度           | localStorage     | sessionStorage | Cookie             | IndexedDB             | Cache API             |
| -------------- | ---------------- | -------------- | ------------------ | --------------------- | --------------------- |
| **容量**       | ~5MB             | ~5MB           | ~4KB               | 50MB+（可达磁盘 10%） | 按站点配额            |
| **生命周期**   | 永久（手动清除） | 标签页关闭即失 | 设定过期时间       | 永久（手动清除）      | 永久（手动清除）      |
| **随请求发送** | 否               | 否             | 是（每个请求都带） | 否                    | 否                    |
| **跨标签页**   | 同源共享         | 不共享         | 同源共享           | 同源共享              | 同源共享              |
| **数据格式**   | 字符串           | 字符串         | 字符串             | 结构化数据（类 JSON） | Request/Response 对象 |
| **API 复杂度** | 极低             | 极低           | 低（手动解析）     | 高（异步 + 事务）     | 中（异步）            |
| **索引/查询**  | 不支持           | 不支持         | 不支持             | 支持（键 + 索引）     | 不支持（URL 匹配）    |
| **事务支持**   | 否               | 否             | 否                 | 是（原子事务）        | 否                    |
| **Web Worker** | 不支持           | 不支持         | 不支持             | 支持                  | 支持                  |
| **同源策略**   | 是               | 是             | 是                 | 是                    | 是                    |

### 选择决策树

```
需要存什么数据？
│
├── 简单配置 / 用户偏好（主题、语言）
│   └── localStorage
│
├── 临时数据（仅当前标签页使用）
│   └── sessionStorage
│
├── 需要随 HTTP 请求自动发送的数据（认证 Token）
│   └── Cookie（httpOnly + secure + SameSite）
│
├── 大量结构化数据（离线文档、聊天记录、图片缓存）
│   └── IndexedDB
│
├── 网络请求缓存（API 响应、静态资源离线可用）
│   └── Cache API（配合 Service Worker）
│
└── 不确定
    └── 数据量小且不需要随请求发送 → localStorage
    └── 数据量大或需要查询 → IndexedDB
```

---

## 一、Web Storage

### 1.1 localStorage

```javascript
// 存储（只能存字符串）
localStorage.setItem('theme', 'dark')
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }))

// 读取
const theme = localStorage.getItem('theme') // 'dark'
const user = JSON.parse(localStorage.getItem('user'))

// 删除
localStorage.removeItem('theme')

// 清空
localStorage.clear()

// 遍历所有键
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  console.log(key, localStorage.getItem(key))
}

// 注意：
// • 只能存字符串，存对象需要 JSON.stringify / JSON.parse
// • 同步 API，大量读写会阻塞主线程
// • 存储满时会抛出 QuotaExceededError
```

### 1.2 sessionStorage

```javascript
// API 与 localStorage 完全一致
sessionStorage.setItem('temp', 'data')
const temp = sessionStorage.getItem('temp')
sessionStorage.removeItem('temp')

// 关键区别：
// • 关闭标签页后数据消失
// • 即使打开同一个网站的另一个标签页，数据也不共享
// • 通过 window.open 或 <a target="_blank"> 打开的新标签页会复制一份
```

### 1.3 storage 事件（跨标签页通信）

```javascript
// 当 localStorage 在「其他标签页」被修改时，当前标签页会触发 storage 事件
window.addEventListener('storage', (event) => {
  console.log('修改的键:', event.key)
  console.log('旧值:', event.oldValue)
  console.log('新值:', event.newValue)
  console.log('修改来源:', event.url)
})

// 实用场景：多标签页状态同步（主题切换、登录状态）
```

---

## 二、Cookie

### 2.1 基本操作

```javascript
// 设置 Cookie
document.cookie = 'name=Alice; max-age=86400; path=/'
document.cookie = 'theme=dark; expires=Fri, 31 Dec 2026 23:59:59 GMT'

// 读取所有 Cookie
document.cookie // "name=Alice; theme=dark"

// 删除（设置过期时间为过去）
document.cookie = 'name=; max-age=0'

// 封装：读取指定 Cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}
```

### 2.2 Cookie 属性详解

```
Set-Cookie: id=a3fWa; Max-Age=86400; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Strict

├── Max-Age=秒数       有效期（优先级高于 Expires）
├── Expires=日期        过期日期（GMT 格式，旧标准）
├── Domain=xxx.com     有效域名（含子域名）
├── Path=/             有效路径
├── Secure             仅 HTTPS 发送
├── HttpOnly           JS 无法访问（document.cookie 看不到），防 XSS
└── SameSite           跨站请求限制
    ├── Strict         完全不允许跨站携带
    ├── Lax            顶级导航（地址栏输入/链接点击）允许（默认值）
    └── None           允许所有跨站（必须配合 Secure）
```

### 2.3 Cookie 的安全实践

```javascript
// ❌ 反模式：JS 设置敏感 Cookie
document.cookie = 'token=abc123; path=/' // 无 httpOnly，XSS 可窃取

// ✅ 正确：敏感 Cookie 由后端通过 Set-Cookie 响应头设置
// HTTP 响应头：
// Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict; Path=/
```

---

## 三、IndexedDB

IndexedDB 是浏览器内置的 **NoSQL 数据库**，适合存储大量结构化数据。

### 3.1 核心概念

```
┌─────────────────────────────────────────────────────────────────┐
│                    IndexedDB 结构                                │
│                                                                  │
│   Database（数据库）                                              │
│   └── Object Store（对象仓库，类似"表"）                          │
│       ├── 存储任意结构化数据（对象、数组、Blob、File 等）         │
│       ├── 每条记录有唯一的 Key                                    │
│       └── 可创建 Index（索引，加速查询）                          │
│                                                                  │
│   特征：                                                         │
│   • 异步 API（不阻塞主线程）                                      │
│   • 事务支持（原子操作）                                          │
│   • 支持 Web Worker 中使用                                       │
│   • 容量远超 Web Storage（通常 50MB+）                            │
│   • 同源策略限制                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 基本操作

```javascript
// 1. 打开/创建数据库
const request = indexedDB.open('myApp', 1)

// 首次创建或版本号变化时触发
request.onupgradeneeded = (event) => {
  const db = event.target.result
  // 创建对象仓库（类似"建表"）
  const store = db.createObjectStore('users', { keyPath: 'id' })
  // 创建索引
  store.createIndex('name', 'name', { unique: false })
}

// 打开成功
request.onsuccess = (event) => {
  const db = event.target.result

  // 2. 写入数据（事务 → 对象仓库 → 操作）
  const tx = db.transaction('users', 'readwrite')
  const store = tx.objectStore('users')
  store.put({ id: 1, name: 'Alice', age: 25 })
  store.put({ id: 2, name: 'Bob', age: 30 })

  // 3. 读取数据
  const getReq = store.get(1)
  getReq.onsuccess = () => console.log(getReq.result) // { id: 1, name: 'Alice', age: 25 }

  // 4. 通过索引查询
  const nameIndex = store.index('name')
  const findReq = nameIndex.get('Bob')
  findReq.onsuccess = () => console.log(findReq.result) // { id: 2, name: 'Bob', age: 30 }

  // 5. 删除数据
  store.delete(1)
}

request.onerror = (event) => console.error('数据库错误:', event.target.error)
```

### 3.3 实际使用建议

```javascript
// 原生 IndexedDB API 较复杂，实际项目推荐使用封装库：
//
// • idb（轻量，Promise 化）     — npm install idb
// • Dexie.js（功能丰富，类 SQL） — npm install dexie
//
// idb 示例：
import { openDB } from 'idb'

const db = await openDB('myApp', 1, {
  upgrade(db) {
    db.createObjectStore('users', { keyPath: 'id' })
  },
})

await db.put('users', { id: 1, name: 'Alice' })
const user = await db.get('users', 1)
```

---

## 四、Cache API

Cache API 是配合 Service Worker 使用的缓存机制，主要用于存储网络请求的 Response 对象。

### 4.1 基本操作

```javascript
// 1. 打开缓存
const cache = await caches.open('app-v1')

// 2. 缓存请求响应
const response = await fetch('/api/data')
await cache.put('/api/data', response)

// 3. 从缓存读取
const cachedResponse = await cache.match('/api/data')

// 4. 缓存多个请求
const urls = ['/style.css', '/script.js', '/logo.png']
await cache.addAll(urls)

// 5. 删除缓存
await cache.delete('/api/data')

// 6. 列出所有缓存
const cacheNames = await caches.keys() // ['app-v1']
```

### 4.2 典型用途

```
Cache API 主要用于 PWA（渐进式 Web 应用）的离线缓存策略：

Service Worker 拦截请求
    │
    ├── 缓存优先：先查 Cache API，命中则返回，未命中再 fetch
    │   └── 适合：静态资源、不常变化的 API
    │
    ├── 网络优先：先 fetch，失败则从 Cache API 返回兜底
    │   └── 适合：需要最新数据但也要离线可用
    │
    └── 缓存 + 网络：先返回缓存（快速），后台 fetch 更新缓存
        └── 适合：列表页、图片
```

---

## 五、Web SQL（已废弃，仅了解）

```javascript
// ⚠️ Web SQL 已于 2010 年废弃，不在 W3C 标准中
// 仅部分旧浏览器支持，新项目中不应使用
// 如需关系型数据库能力，使用 IndexedDB 或 sql.js（SQLite 的 WASM 编译版）

// 历史 API（了解即可）：
// const db = openDatabase('myDB', '1.0', 'My Database', 5 * 1024 * 1024);
// db.transaction(tx => {
//   tx.executeSql('CREATE TABLE IF NOT EXISTS users (id, name)');
//   tx.executeSql('INSERT INTO users VALUES (?, ?)', [1, 'Alice']);
// });
```

---

## 六、各存储机制的生命周期与安全边界

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        生命周期对比                                          │
│                                                                             │
│   浏览器关闭后仍保留：                                                        │
│   ├── localStorage    ✓（除非用户手动清除）                                  │
│   ├── Cookie（设了过期时间）  ✓                                              │
│   ├── IndexedDB       ✓（除非用户手动清除）                                  │
│   └── Cache API       ✓（除非用户手动清除或 Service Worker 更新）            │
│                                                                             │
│   浏览器关闭后丢失：                                                          │
│   ├── sessionStorage  ✓（标签页关闭即失）                                    │
│   └── Cookie（未设过期时间）  ✓（会话级 Cookie）                              │
│                                                                             │
│   用户可手动清除的方式：                                                      │
│   ├── DevTools → Application → Storage → Clear site data                    │
│   ├── 浏览器设置 → 清除浏览数据                                              │
│   ├── 无痕/隐私模式关闭时自动清除所有存储                                    │
│   └── 卸载浏览器时全部清除                                                  │
│                                                                             │
│   安全边界：                                                                  │
│   ├── 同源策略：协议 + 域名 + 端口 必须完全一致                              │
│   ├── Cookie 的 Domain/Path 可进一步限定作用域                               │
│   ├── httpOnly Cookie 对 JS 不可见（防 XSS）                                │
│   └── 第三方 Cookie 正被浏览器逐步限制/废弃                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 常见面试题

### Q1: localStorage、sessionStorage、Cookie 的区别？

**答**：

| 维度       | localStorage | sessionStorage | Cookie       |
| ---------- | ------------ | -------------- | ------------ |
| 容量       | ~5MB         | ~5MB           | ~4KB         |
| 生命周期   | 永久         | 标签页关闭即失 | 可设过期时间 |
| 随请求发送 | 否           | 否             | 是           |
| 跨标签页   | 共享         | 不共享         | 共享         |
| 数据格式   | 字符串       | 字符串         | 字符串       |

### Q2: localStorage 能存对象吗？

**答**：不能直接存。需要 `JSON.stringify()` 转字符串存储，读取时 `JSON.parse()` 转回对象。注意 `undefined`、`Function`、`Symbol` 在序列化时会丢失。

### Q3: Cookie 的 httpOnly 和 Secure 有什么区别？

**答**：

- **httpOnly**：JS 无法通过 `document.cookie` 访问，防止 XSS 攻击窃取 Cookie
- **Secure**：只在 HTTPS 连接下发送，防止中间人窃听

### Q4: IndexedDB 和 localStorage 怎么选？

**答**：

- 数据量小（< 5MB）、结构简单 → localStorage
- 数据量大、需要索引查询、需要事务 → IndexedDB
- localStorage 是同步 API 会阻塞主线程，IndexedDB 是异步的不阻塞

### Q5: 关闭浏览器后哪些数据会丢失？

**答**：sessionStorage 一定丢失。Cookie 如果没设过期时间（会话级）也会丢失。localStorage 和 IndexedDB 不会丢失。

### Q6: Cache API 和 localStorage 有什么区别？

**答**：

- localStorage 存的是字符串键值对，开发者手动管理
- Cache API 存的是 Request/Response 对象，主要配合 Service Worker 做离线缓存
- Cache API 通常不直接由开发者读写，而是由 Service Worker 的 fetch 事件自动管理

---

## 延伸练习

1. 用 localStorage 保存用户主题偏好，在多个标签页间通过 `storage` 事件同步
2. 在 DevTools → Application 面板中查看和编辑各种存储数据
3. 用 `document.cookie` 设置一个带 `Path` 和 `Max-Age` 的 Cookie
4. 用原生 IndexedDB API 创建一个简单的通讯录（增删改查）
5. 使用 `idb` 库重写第 4 题，对比代码量差异

---

## 参考资料

- [Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)
- [Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)
- [IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [Cache API](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache)
- [SameSite Cookie 详解](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
