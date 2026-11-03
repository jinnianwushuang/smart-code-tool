---
title: 'JSBridge 与原生通信原理 [P7-P8]'
level: 'advanced'
tags: ['JSBridge', 'WebView', 'React Native', 'JSI', 'Expo', '跨语言桥接', 'Platform Channel']
difficulty: 'hard'
target: '高级/架构师（P7-P8）'
---

# JSBridge 与原生通信原理 [P7-P8]

> JS 运行在受限的沙箱里，无法直接调用摄像头、蓝牙、支付、系统弹窗等原生能力。JSBridge 就是打通「JS 运行时」与「原生运行时」这两个隔离世界的一套通信协议与胶水层。本文从最底层的通信实现模式讲起，逐层拆解 WebView 桥接、React Native 新旧架构、Expo Modules、Flutter Platform Channel，理解「开发语言 + 胶水层」是如何协同的。

## 核心概念（What）

### 一句话定义

**JSBridge = 跨运行时的方法调用协议 + 回调映射机制 + 序列化约定。**

它解决的核心矛盾是：

```
┌────────────────────────────┐         ┌────────────────────────────┐
│      JS 运行时（沙箱）       │         │      原生运行时（系统）      │
│  单线程 / 无系统调用权限     │  ←桥→   │  多线程 / 完整系统 API 权限  │
│  V8 / JSC / Hermes          │         │  JVM / ART / Cocoa / Rust   │
└────────────────────────────┘         └────────────────────────────┘
        两个隔离的世界，内存不共享、线程模型不同、语言不同
```

JS 与原生之间**没有共享内存**（JSI 之前），只能靠「消息传递」通信。所有 JSBridge 方案的本质，都是在回答三个问题：

1. **怎么把消息从 A 传到 B？**（通信信道）
2. **怎么让调用方拿到返回值/结果？**（回调机制）
3. **数据用什么格式编码？**（序列化协议）

### 桥接的四个层次

| 层次   | 职责                        | 典型代表                            |
| ------ | --------------------------- | ----------------------------------- |
| 信道层 | 物理上把消息送到对端        | URL Scheme 拦截、注入对象、JSI      |
| 协议层 | 约定消息格式（方法名/参数） | `{ handlerName, data, callbackId }` |
| 回调层 | 关联异步请求与响应          | callbackId ↔ 回调函数映射表         |
| 语义层 | 面向业务的 API 封装         | `bridge.call('scanQR', {...})`      |

---

## 底层原理（Why）

### 一、WebView 场景下的四种通信实现模式

H5 与原生（Hybrid App）的桥接，历史上有四种主流实现，理解它们的差异是理解一切跨语言桥接的基础。

#### 模式 1：URL Scheme 拦截（最经典）

JS 发起一个「假请求」，原生拦截 URL 变化，从中解析出方法名和参数。

```javascript
// JS 侧：通过 iframe / location 触发一个自定义协议 URL
function callNative(handlerName, data) {
  const callbackId = 'cb_' + Date.now() + '_' + idx++
  callbacks[callbackId] = data.callback
  const message = { handlerName, data: data.params, callbackId }
  // 编码进 URL
  const url = 'jsbridge://invoke?payload=' + encodeURIComponent(JSON.stringify(message))
  const iframe = document.createElement('iframe')
  iframe.src = url
  document.body.appendChild(iframe)
  setTimeout(() => iframe.remove(), 0)
}

// 原生回调 JS：直接执行一段 JS 字符串
function handleNativeResponse(callbackId, result) {
  const cb = callbacks[callbackId]
  cb && cb(result)
  delete callbacks[callbackId]
}
```

```java
// Android：拦截 URL
webView.setWebViewClient(new WebViewClient() {
  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    if (url.startsWith("jsbridge://")) {
      String payload = Uri.parse(url).getQueryParameter("payload");
      dispatch(urlDecode(payload)); // 解析 JSON → 找 handler → 执行
      return true; // 拦截，不让 WebView 真正加载
    }
    return super.shouldOverrideUrlLoading(view, url);
  }
});
```

```swift
// iOS（WKWebView）：用 WKURLSchemeHandler 或 decidePolicyFor 拦截
func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
             decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
  if let url = action.request.url, url.scheme == "jsbridge" {
    dispatch(url)
    decisionHandler(.cancel)
    return
  }
  decisionHandler(.allow)
}
```

- **优点**：兼容性极好，几乎所有 WebView 都支持。
- **缺点**：URL 长度有限制；高频调用时 iframe 创建开销大；无法同步返回。

#### 模式 2：注入原生对象（现代主流）

原生把一个对象直接注入到 JS 的 `window` 上，JS 像调用普通方法一样调用它。

```java
// Android：addJavascriptInterface
public class NativeBridge {
  @JavascriptInterface // 必须加注解（Android 4.2+ 安全要求）
  public String invoke(String messageJson) {
    return dispatch(messageJson); // 可以同步返回值！
  }
}
webView.addJavascriptInterface(new NativeBridge(), "AndroidBridge");
```

```javascript
// JS 侧：直接调用注入的对象
const result = window.AndroidBridge.invoke(JSON.stringify(message))
```

```swift
// iOS：WKScriptMessageHandler
// JS 通过 window.webkit.messageHandlers.<name>.postMessage(data) 调用
userContentController.add(self, name: "iOSBridge")

func userContentController(_ ucc: WKUserContentController,
                           didReceive message: WKScriptMessage) {
  let body = message.body // JS 传来的数据（自动反序列化）
  dispatch(body)
}
```

```javascript
// JS 侧（iOS）
window.webkit.messageHandlers.iOSBridge.postMessage(message)
```

- **优点**：调用直观、性能好、Android 侧可同步返回。
- **缺点**：iOS 的 `postMessage` 是单向的（无返回值），Native → JS 需靠 `evaluateJavaScript`；`addJavascriptInterface` 有历史安全漏洞（4.2 以下）。

> **Native 主动调用 JS**：无论哪种模式，原生回调 JS 都靠「执行一段 JS 字符串」——
> Android: `webView.evaluateJavascript("javascript:handleNativeResponse(...)", null)`
> iOS: `webView.evaluateJavaScript("handleNativeResponse(...)", completionHandler: nil)`

#### 模式 3：prompt / console 拦截

拦截 `window.prompt()`、`console.log()`，把参数当作消息通道。

```javascript
window.prompt(JSON.stringify(message)) // 触发原生 onJsPrompt
```

```java
webView.setWebChromeClient(new WebChromeClient() {
  @Override
  public boolean onJsPrompt(WebView view, String url, String message, ...) {
    dispatch(message);
    return true;
  }
});
```

现在基本被淘汰，仅作为兼容兜底手段，了解即可。

#### 模式 4：JSI（JavaScript Interface，React Native 新架构）

不再「传消息」，而是让 JS **直接持有 C++ 对象的引用**并同步调用其方法。这是通信模式的范式跃迁，后面「RN 桥接演进」详细展开。

#### 四种模式对比

| 模式            | 方向         | 同步返回 | 序列化   | 性能 | 现代程度      |
| --------------- | ------------ | -------- | -------- | ---- | ------------- |
| URL Scheme 拦截 | JS→Native    | 否       | JSON     | 低   | 传统          |
| 注入原生对象    | JS→Native    | 部分     | JSON     | 中   | 主流（H5）    |
| prompt/console  | JS→Native    | 否       | 字符串   | 低   | 淘汰          |
| JSI             | 双向直接引用 | **是**   | **无需** | 极高 | 前沿（RN 新） |

---

### 二、消息协议与回调机制的设计

无论信道如何，一个健壮的 JSBridge 协议层都长这样：

```
一次完整调用的时序：

JS 侧                              Native 侧
─────                              ─────────
1. 生成 callbackId
2. callbacks[id] = 回调函数
3. 发送 {handlerName, data, id} ──▶ 4. 解析消息
                                    5. 查找 handlerName 对应处理器
                                    6. 执行业务（可能异步，如调相机）
7. 执行回调 ◀──────────────────── 8. 用 evaluateJS 回调 handleResponse(id, result)
9. 从 callbacks 中删除 id
```

**关键设计点**：

- **callbackId 映射表**：因为调用是异步的，必须用一个自增 ID 把「请求」和「响应」关联起来。这张表就是桥接的「内存」。
- **方法注册表（handler map）**：Native 侧维护 `handlerName → 处理函数` 的字典，实现路由分发。
- **序列化约定**：几乎所有方案都用 JSON，因为它是 JS 原生格式，且各语言都有解析库。**序列化开销正是旧 RN Bridge 的性能瓶颈所在。**
- **错误处理**：协议里要预留 `errorCode / errorMessage` 字段，Native 异常也能回调给 JS。

```javascript
// 一个极简但完整的 bridge 封装
const callbacks = {}
let idx = 0

const bridge = {
  call(handlerName, params) {
    return new Promise((resolve, reject) => {
      const callbackId = 'cb_' + idx++
      callbacks[callbackId] = { resolve, reject }
      nativeInvoke(JSON.stringify({ handlerName, params, callbackId }))
    })
  },
  // 供 Native 通过 evaluateJS 调用
  handleResponse(callbackId, error, result) {
    const cb = callbacks[callbackId]
    if (!cb) return
    error ? cb.reject(error) : cb.resolve(result)
    delete callbacks[callbackId]
  },
}
```

---

### 三、React Native 桥接原理的演进

RN 是 JSBridge 思想最典型、演进最激烈的战场。

#### 旧架构：Bridge（异步批量 JSON 桥）

```
RN 旧架构三线程模型：

┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
│  JS Thread   │   │  Native/Main     │   │ Shadow Thread│
│  (JS 引擎)   │   │  Thread (UI)     │   │ (Yoga 布局)  │
│  业务逻辑     │   │  原生组件/模块   │   │  计算布局     │
└──────┬───────┘   └────────┬─────────┘   └──────┬───────┘
       │                    │                    │
       └────────────────────┴────────────────────┘
                    Bridge（JSON 消息队列）
              所有通信都要：序列化 → 入队 → 异步传递 → 反序列化
```

- **特点**：全异步、批量（batch）传递、JSON 序列化、单向队列。
- **痛点**：
  - 每次通信都要 JSON 编解码，**动画/手势/滚动等高频场景卡顿**。
  - 无法同步获取原生值（如获取设备信息也要异步）。
  - 启动时要初始化整个 Bridge，**冷启动慢**。

#### 新架构：JSI + Fabric + TurboModules + Codegen

```
RN 新架构：

┌──────────────┐        ┌──────────────────────────┐
│  JS 引擎      │◀──────▶│  JSI（C++ 接口层）         │
│  (Hermes)    │ 直接引用 │  HostObject / HostFunction│
└──────────────┘        └────────────┬─────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
      ┌───────────────┐    ┌──────────────────┐   ┌──────────────┐
      │  Fabric       │    │  TurboModules    │   │  Codegen     │
      │  新渲染器      │    │  原生模块懒加载   │   │  类型安全绑定 │
      │  (C++/同步)   │    │  (可同步调用)    │   │  (自动生成)  │
      └───────────────┘    └──────────────────┘   └──────────────┘
```

- **JSI（JavaScript Interface）**：一套轻量 C++ 接口，让 JS 能**直接持有 C++ 对象引用**并同步调用其方法，**彻底移除 JSON 序列化**。
- **Fabric**：基于 JSI 的新渲染器，UI 更新可同步、可优先级调度，支持并发特性。
- **TurboModules**：原生模块按需懒加载，支持同步调用，启动更快。
- **Codegen**：根据 JS 类型定义自动生成 C++/Java/OC 的类型安全绑定代码，编译期发现类型错误。

> **一句话总结演进**：从「隔着一堵墙喊话（Bridge，异步 + JSON）」变成「直接握住对方的手（JSI，同步 + 引用）」。

---

### 四、Expo 的桥接原理

Expo 本质是 **RN + 一套预置的原生模块集合 + 工具链**，它的桥接完全建立在 RN 之上。

```
Expo 桥接分层：

你的 JS 业务代码
      │  import { Camera } from 'expo-camera'
      ▼
Expo Modules API（JS 层封装）
      │
      ▼
RN 通信层（新架构走 JSI / 旧架构走 Bridge）
      │
      ▼
Expo 原生模块（Swift / Kotlin 实现）
      │
      ▼
iOS / Android 系统 API
```

- **Expo Modules API**：Expo 自研的原生模块开发框架，用 Swift/Kotlin 写模块，自动接入 RN 桥接层，比裸写 RN Native Module 更简洁。
- **Expo Go 的限制**：Expo Go 是一个「预打包了所有 Expo 模块的通用客户端」，**不能包含自定义原生代码**。一旦用了 Expo Modules API 写自己的原生模块，就必须走 **Development Build / EAS Build** 生成定制客户端。
- **新架构支持**：Expo SDK 50+ 已默认支持 RN 新架构（JSI/Fabric）。

---

### 五、开发语言与胶水层的全景

跨语言桥接的核心是「胶水层」——它把不同语言、不同运行时的调用约定「翻译」过去。

```
典型移动端跨语言调用栈（以 RN 新架构为例）：

  JavaScript（业务/UI 描述）        ← JS 引擎：Hermes / JSC
        │
        │  JSI（C++ 头文件接口）    ← 胶水层①：JS ↔ C++
        ▼
     C++（JSI HostObject）          ← 核心运行时
        │
        │  JNI / OC Bridge          ← 胶水层②：C++ ↔ 原生语言
        ▼
  Java/Kotlin  或  OC/Swift         ← 原生模块实现
        │
        ▼
     系统 API（Android SDK / iOS SDK）
```

| 语言/层     | 角色         | 说明                                    |
| ----------- | ------------ | --------------------------------------- |
| JavaScript  | 业务表达     | 跑在 JS 引擎里，无系统权限              |
| Hermes      | JS 引擎      | Meta 自研，预编译字节码，启动快、内存省 |
| C++         | 核心胶水     | JSI/Fabric 的实现语言，跨平台共享       |
| JNI         | Java 胶水    | Java Native Interface，C++ ↔ Java       |
| OC Bridge   | iOS 胶水     | C++ ↔ Objective-C ↔ Swift               |
| Java/Kotlin | Android 原生 | 调用 Android SDK                        |
| OC/Swift    | iOS 原生     | 调用 iOS SDK                            |

#### 对比：Flutter 的 Platform Channel

Flutter 用 Dart，同样需要桥接原生，但方案不同（Dart 跑在 Dart VM/AOT 里，也不用共享内存）：

```
Flutter Platform Channel 三种信道：

┌────────────────────┬──────────────────────────────────┐
│ MethodChannel      │ 一次性方法调用（最常用）           │
│ EventChannel       │ 原生 → Dart 的流式事件（如传感器） │
│ BasicMessageChannel│ 双向自由消息传递                   │
└────────────────────┴──────────────────────────────────┘

Dart 业务代码
    │  MethodChannel('battery').invokeMethod('getLevel')
    ▼
StandardMessageCodec（二进制编解码，非 JSON）  ← 胶水层
    │
    ▼
C++ Engine（Platform Channel 实现）
    │
    ▼
原生（Kotlin MethodCallHandler / Swift FlutterMethodCall）
```

- Flutter 用**二进制编解码（StandardMessageCodec）**而非 JSON，比旧 RN Bridge 高效。
- Flutter 也有类似 JSI 的 **FFI（dart:ffi）**，可直接同步调用 C 函数，绕过 Platform Channel。

---

## 多种通信实现模式横向对比

| 方案                     | 场景         | 信道            | 序列化          | 同步  | 性能  |
| ------------------------ | ------------ | --------------- | --------------- | ----- | ----- |
| WebView URL Scheme       | H5 Hybrid    | iframe/location | JSON            | 否    | 低    |
| WebView 注入对象         | H5 Hybrid    | window 对象     | JSON            | 部分  | 中    |
| RN Bridge（旧）          | React Native | 消息队列        | JSON 批量       | 否    | 中    |
| RN JSI（新）             | React Native | C++ 直接引用    | 无需            | 是    | 极高  |
| Expo Modules             | Expo/RN      | 基于 RN 桥接    | 同 RN           | 同 RN | 同 RN |
| Flutter Platform Channel | Flutter      | 二进制信道      | Codec（二进制） | 否    | 高    |
| Flutter FFI              | Flutter      | 直接 C 调用     | 无需            | 是    | 极高  |
| WebView postMessage      | Web 跨窗口   | 浏览器原生      | 结构化克隆      | 否    | 中    |

**演进主线**：**异步 JSON 消息 → 二进制编解码 → 直接引用同步调用（零序列化）**。所有现代方案都在往「消除序列化、支持同步、降低延迟」的方向走。

---

## 高频面试题

### Q1: JSBridge 有哪些实现方式？各自优缺点？

**要点**：

- URL Scheme 拦截：兼容性好，但性能差、有长度限制、无法同步。
- 注入原生对象（`addJavascriptInterface` / `WKScriptMessageHandler`）：现代主流，性能好，Android 可同步返回，iOS postMessage 单向。
- prompt/console 拦截：已淘汰，仅作兼容兜底。
- JSI：直接持有 C++ 引用，同步、零序列化，RN 新架构核心。
- Native → JS 统一靠 `evaluateJavascript` 执行 JS 字符串。

### Q2: 为什么 React Native 要用 JSI 取代 Bridge？

**要点**：

- 旧 Bridge 全异步 + JSON 序列化，高频场景（动画/手势）卡顿、无法同步取值、冷启动慢。
- JSI 让 JS 直接持有 C++ HostObject 引用，同步调用、无序列化开销。
- 配合 Fabric（同步渲染）、TurboModules（懒加载）、Codegen（类型安全）全面提升性能与开发体验。

### Q3: JS 调用原生后，原生怎么把异步结果返回给 JS？

**要点**：

- JS 侧生成唯一 callbackId，存入回调映射表，随消息一起发给原生。
- 原生完成异步业务后，通过 `evaluateJavascript` 执行一段 JS，把 `callbackId + result` 传回。
- JS 根据 callbackId 找到对应回调执行，并从映射表删除，避免内存泄漏。

### Q4: Expo 和 React Native 的桥接是什么关系？

**要点**：

- Expo 建立在 RN 之上，Expo Modules API 是对 RN Native Module 的更高层封装。
- Expo Go 不含自定义原生代码，用了自定义原生模块必须走 Development Build / EAS Build。
- Expo SDK 50+ 默认支持 RN 新架构（JSI）。

### Q5: Flutter 的 Platform Channel 和 JSBridge 有什么异同？

**要点**：

- 同：都是跨运行时/跨语言的消息通信，都需要编解码和回调关联。
- 异：Flutter 用二进制 Codec（非 JSON），有三种信道（Method/Event/BasicMessage）。
- Flutter 还有 FFI 可直接同步调用 C，绕过 Channel，类似 JSI 的思路。

---

## 延伸思考

1. **设计题**：为一个 Hybrid App 设计一套 JSBridge，要求支持同步调用、超时、错误码、鉴权白名单，你会如何设计协议层？
2. **性能题**：一个 RN 旧架构 App 在长列表滚动时掉帧严重，从桥接角度分析可能的原因和优化路径（迁移新架构 / 减少跨桥调用 / 批量合并）。
3. **安全题**：`addJavascriptInterface` 的历史安全漏洞是什么？现代 WebView 桥接应如何做方法白名单和来源校验？

---

## 相关链接

- [跨端技术选型矩阵 [P8]](/dev-knowledge/cross-domain/api-and-cross-platform/cross-platform-selection)
- [多端一致性方案 [P8]](/dev-knowledge/cross-domain/api-and-cross-platform/multi-platform-consistency)
- [React Native 新架构官方文档](https://reactnative.dev/docs/new-architecture-intro)
- [JSI 设计文档](https://github.com/reactwg/react-native-new-architecture/discussions/91)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Flutter Platform Channels](https://docs.flutter.dev/platform-integration/platform-channels)
- [WKWebView 与 JS 交互](https://developer.apple.com/documentation/webkit/wkscriptmessagehandler)
