# 移动端安全攻防基础

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 移动端安全没有银弹——客户端永远不可信。安全设计的原则是"提高攻击成本"而非"绝对防御"，核心资产的保护必须放在服务端。

---

## 📑 目录

- [一、移动端威胁全景](#一移动端威胁全景)
- [二、逆向工程：攻击者视角](#二逆向工程攻击者视角)
- [三、代码保护](#三代码保护)
- [四、安全存储](#四安全存储)
- [五、网络安全防护](#五网络安全防护)
- [六、运行环境检测](#六运行环境检测)
- [七、API 安全](#七api-安全)
- [八、Flutter 的安全特性与局限](#八flutter-的安全特性与局限)
- [九、安全开发清单](#九安全开发清单)

---

## 一、移动端威胁全景

### 1.1 攻击面分析

```
┌─ 移动端攻击面 ────────────────────────────────┐
│                                                │
│ ① 客户端本体                                    │
│    - 逆向分析（反编译/砸壳）                      │
│    - 二次打包（植入恶意代码/去广告）                │
│    - 内存修改（游戏修改器/Frida Hook）            │
│                                                │
│ ② 数据存储                                      │
│    - 本地文件窃取（SharedPreferences/SQLite）     │
│    - 备份提取（adb backup / iTunes 备份）         │
│    - 剪贴板监听                                  │
│                                                │
│ ③ 网络通信                                      │
│    - 中间人攻击（抓包/篡改）                      │
│    - DNS 劫持                                   │
│    - 重放攻击                                    │
│                                                │
│ ④ 运行环境                                      │
│    - Root/越狱设备（沙箱失效）                    │
│    - 模拟器/云手机（自动化作弊）                   │
│    - 调试器附加（ptrace/lldb）                   │
│                                                │
│ ⑤ 服务端接口                                     │
│    - 接口滥用（爬虫/刷单）                        │
│    - 越权访问（水平/垂直越权）                     │
│    - 参数篡改                                    │
└────────────────────────────────────────────────┘
```

### 1.2 安全设计基本原则

```
原则一：客户端永远不可信
- 客户端发出的任何数据都可能被篡改
- 客户端存储的任何密钥都可能被提取
- 业务校验的最终防线必须在服务端

原则二：提高攻击成本
- 安全是成本博弈，不是绝对防御
- 让攻击成本 > 攻击收益即为成功
- 分层防御：逆向难 + 存储难 + 通信难 + 检测

原则三：纵深防御
- 单点防御必被突破，多层叠加
- 每层独立生效，不互相依赖

原则四：敏感数据最小化
- 不存储不该存的数据
- 必须存的加密存储
- 内存中用完即清
```

---

## 二、逆向工程：攻击者视角

### 2.1 Android 逆向链路

```
APK 结构：
├── classes.dex（Dalvik 字节码）← 主要逆向目标
├── lib/*.so（Native 库）
├── res/（资源）
└── AndroidManifest.xml

逆向流程：
① 反编译：
   apktool → smali 代码 + 资源
   jadx → 直接反编译为 Java 伪代码（可读性极高）
② 分析：
   定位关键逻辑（签名算法/加密函数/许可证校验）
③ 修改：
   修改 smali → 重打包 → 重签名
④ 动态调试：
   Frida Hook 任意 Java/Native 函数
   Xposed 框架运行时修改行为

Dart 代码的特殊性：
- Release 模式为 AOT 机器码（libapp.so）
- 无字节码 → 无法像 Java 那样直接反编译
- 但仍可逆向：IDA/Ghidra 分析机器码
- Flutter 3.x 符号剥离后难度显著提升
```

### 2.2 iOS 逆向链路

```
IPA 结构：
├── Mach-O 可执行文件 ← 主要逆向目标
├── Frameworks/
└── Assets/

逆向流程：
① 砸壳（解密）：
   App Store 下载的 IPA 经 FairPlay 加密
   越狱设备 + frida-ios-dump / bfdecrypt 脱壳
② 分析：
   class-dump → ObjC 头文件（类/方法一览）
   Hopper / IDA → 反汇编
③ Hook：
   Frida / Cydia Substrate 运行时 Hook
   method swizzling 替换方法实现
④ 重签名：
   企业证书重签 → 分发修改版

Swift/Flutter 的特殊性：
- Swift 符号剥离后逆向难度高于 ObjC
- Flutter AOT 机器码，同 Android
```

### 2.3 Frida：最强动态分析工具

```javascript
// Frida Hook 示例（攻击者视角）
// Hook Java 层方法，修改返回值
Java.perform(() => {
  const Target = Java.use('com.app.SecurityUtil');
  Target.verifySignature.implementation = function() {
    return true;  // 绕过签名校验
  };
});

// Hook Native 函数
Interceptor.attach(Module.findExportByName('libapp.so', 'verify'), {
  onLeave: (retval) => { retval.replace(1); }
});

// 防御思路：
// - 检测 Frida 特征（端口/线程名/D-Bus 协议）
// - 关键逻辑 Native 化 + 混淆
// - 完整性自校验（但校验点本身也要保护）
```

---

## 三、代码保护

### 3.1 Android 保护手段

```
① 代码混淆（ProGuard/R8）：
   - 类名/方法名 → a/b/c
   - 移除无用代码
   - Flutter Dart 代码不受影响（AOT 机器码）
   - 原生 Java/Kotlin 层必须开启

② 签名校验：
   - 运行时校验 APK 签名指纹
   - 防止二次打包篡改
   - 校验点分散 + Native 化

③ 加固（第三方服务）：
   - DEX 加壳：运行时解密加载
   - DEX 虚拟化：自定义指令集（VMP）
   - SO 加固：ELF 加密/反调试
   - 服务商：梆梆/爱加密/360加固

④ 反调试：
   - 检测 TracerPid（/proc/self/status）
   - ptrace 自占位
   - 检测调试器特征
```

### 3.2 iOS 保护手段

```
① 编译选项：
   - Strip Linked Product: YES（剥离符号）
   - Dead Code Stripping: YES
   - 避免 ObjC 暴露关键类（用 Swift/C++）

② 完整性校验：
   - 校验 Mach-O 代码段哈希
   - 校验 embedded.mobileprovision
   - 检测重签名特征

③ 反调试：
   - sysctl 检测 P_TRACED
   - ptrace(PT_DENY_ATTACH)
   - 检测越狱环境

④ App Store 天然屏障：
   - FairPlay 加密（提高砸壳门槛）
   - 但越狱设备可脱壳 → 仍需自保护
```

### 3.3 Dart/Flutter 代码保护

```
Flutter Release 构建的默认保护：
① AOT 编译为机器码（无字节码可反编译）
② --split-debug-info 剥离调试符号
③ --obfuscate 混淆 Dart 符号

flutter build apk \
  --obfuscate \                    # 混淆 Dart 标识符
  --split-debug-info=build/debug   # 符号表分离（崩溃还原用）

局限认知：
- 混淆 ≠ 加密：逻辑仍可被逆向理解
- 字符串常量仍在二进制中（密钥/URL 可提取）
- 关键算法建议：
  ① 移至服务端（最优）
  ② Native 实现（C/C++ + 混淆）
  ③ Dart FFI 调用加固的 Native 库
```

---

## 四、安全存储

### 4.1 双平台安全存储机制

```
Android: Keystore 体系
┌─────────────────────────────────────────┐
│ Android Keystore                         │
│ - 密钥在 TEE/StrongBox 硬件中生成         │
│ - 私钥永不导出（不可提取）                 │
│ - 支持指纹/锁屏绑定（setUserAuthentication）│
│                                          │
│ EncryptedSharedPreferences / EncryptedFile │
│ - Jetpack Security 库                    │
│ - 主密钥存于 Keystore                    │
│ - 数据 AES256 加密存储                    │
└─────────────────────────────────────────┘

iOS: Keychain + Data Protection
┌─────────────────────────────────────────┐
│ Keychain                                 │
│ - 硬件加密（Secure Enclave）              │
│ - 独立于应用沙箱（卸载不清除）             │
│ - 访问控制：kSecAttrAccessible 系列       │
│   - WhenUnlocked：解锁后可访问（默认推荐）  │
│   - AfterFirstUnlock：后台可访问          │
│                                          │
│ Data Protection (文件系统)                │
│ - NSFileProtectionComplete：锁屏不可读     │
│ - 基于设备密钥 + 用户密码派生              │
└─────────────────────────────────────────┘
```

### 4.2 Flutter 安全存储实践

```dart
// flutter_secure_storage：双平台统一封装
// Android → EncryptedSharedPreferences (Keystore)
// iOS → Keychain
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage(
  aOptions: AndroidOptions(encryptedSharedPreferences: true),
  iOptions: IOSOptions(
    accessibility: KeychainAccessibility.first_unlock,
  ),
);

// 存储 Token
await storage.write(key: 'access_token', value: token);
// 读取
final token = await storage.read(key: 'access_token');
// 删除
await storage.delete(key: 'access_token');

// ⚠️ 注意事项：
// 1. 不适合大文件（仅小量敏感数据）
// 2. iOS 备份会带走 Keychain（需评估）
// 3. Android 卸载会清除（iOS 不会 → 设备指纹可利用）
```

### 4.3 存储反模式

```dart
// ❌ 明文存储敏感数据
SharedPreferences.set('token', rawToken);        // 明文 XML
File('user.json').writeAsString(jsonWithPassword); // 明文文件

// ❌ 硬编码密钥
const aesKey = 'my-secret-key-123';  // 二进制中可直接提取！

// ❌ 日志打印敏感信息
debugPrint('user: $user');  // 含手机号/身份证 → 日志泄露

// ✅ 正确姿势：
// 1. Token/密钥 → flutter_secure_storage
// 2. 业务敏感数据 → 加密后存文件（密钥来自 Keystore/Keychain）
// 3. 密钥动态生成，永不硬编码
// 4. Release 关闭敏感日志（assert 包裹 / 日志分级）
```

### 4.4 内存中的敏感数据

```dart
// 敏感数据在内存中的风险：
// - 内存 dump 可提取
// - Swap/压缩内存可能落盘（Android ZRAM）

// 缓解手段：
// 1. 用完即置空
String? otp = await getOtp();
verify(otp!);
otp = null;  // 尽快释放引用（GC 后不可控，但缩短窗口）

// 2. 避免字符串常量池（Dart 字符串不可变，难擦除）
// 高敏场景用 Uint8List，可手动覆写
final keyBytes = Uint8List(32);
// ... 使用
keyBytes.fillRange(0, 32, 0);  // 主动清零

// 3. 剪贴板防护
// 复制敏感内容后定时清除剪贴板
// iOS 14+ 剪贴板读取有系统提示（用户可感知）
```

---

## 五、网络安全防护

### 5.1 防抓包与防篡改

```
攻击链路：
Charles/mitmproxy 中间人 → 安装自签 CA → 解密 HTTPS

防御层级：
① TLS 基础（防被动窃听）
   - 强制 HTTPS（ATS / Network Security Config）
   - 禁用降级（防 SSL Strip）

② 证书固定（防中间人）
   - 仅信任内置证书指纹
   - 详见《移动端网络层原理》第六节

③ 请求签名（防篡改/重放）
   - 请求参数 + 时间戳 + nonce → HMAC 签名
   - 服务端验签 + 时间窗校验 + nonce 去重

④ 双向认证（mTLS，最高强度）
   - 客户端也出示证书
   - 证书嵌入 App（仍有被提取风险）
```

### 5.2 请求签名设计

```dart
// 客户端签名流程
class ApiSigner {
  static String sign(Map<String, dynamic> params, String secret) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final nonce = uuid.v4();

    // 1. 参数按 key 排序拼接
    final sorted = params.keys.toList()..sort();
    final payload = sorted.map((k) => '$k=${params[k]}').join('&');

    // 2. 加入时间戳 + nonce + 密钥
    final raw = '$payload&ts=$timestamp&nonce=$nonce&key=$secret';

    // 3. HMAC-SHA256
    final hmac = Hmac(sha256, utf8.encode(secret));
    return hmac.convert(utf8.encode(raw)).toString();
  }
}

// 服务端校验：
// 1. 验证签名正确性
// 2. 时间戳窗口（±5min）→ 防长期重放
// 3. nonce 唯一性（Redis 去重）→ 防短期重放
// 4. 密钥本身的安全：动态下发 / 白盒加密（提高提取难度）
```

---

## 六、运行环境检测

### 6.1 Root/越狱检测

```dart
// 检测项（多维度交叉验证）：
class EnvironmentChecker {
  // Android Root 特征：
  // - su 二进制文件存在（/system/bin/su 等）
  // - Superuser.apk / Magisk 特征
  // - Build.prop 测试密钥（ro.build.tags=test-keys）
  // - 可写 system 分区
  // - Magisk Hide 会隐藏部分特征 → 需多项组合

  // iOS 越狱特征：
  // - Cydia/Sileo 存在
  // - 越狱文件路径（/Applications/Cydia.app 等）
  // - 沙箱外文件可写（/private/jailbreak.txt）
  // - 动态库注入检测（DYLD_INSERT_LIBRARIES）
  // - fork/system 调用可用性（沙箱限制失效）

  // 现成方案：
  // flutter_jailbreak_detection / free_rasp 插件
}

// 检测后的策略（不要直接崩溃，易被定位绕过）：
// - 上报风控系统 → 服务端决策
// - 降级功能（禁止支付/提现）
// - 静默标记（收集证据后批量封禁）
```

### 6.2 模拟器与调试检测

```
模拟器检测（反作弊场景）：
- 硬件特征：传感器缺失/电池状态异常
- 系统属性：ro.kernel.qemu / ro.hardware=goldfish
- 文件特征：/system/lib/libc_malloc_debug_qemu.so
- IMEI/IMSI 全 0 或固定值

调试器检测：
- Android: Debug.isDebuggerConnected()
- Android Native: TracerPid != 0
- iOS: sysctl P_TRACED / ptrace 拒绝附加

完整性检测：
- APK 签名指纹校验
- classes.dex 哈希校验
- iOS 代码段哈希 + 重签名检测
```

### 6.3 检测的对抗性认知

```
重要认知：所有客户端检测都可被绕过
- Frida 可 Hook 任何检测函数返回 false
- 检测代码本身也会被逆向定位并 Patch

正确姿势：
① 检测点分散 + 混淆 + Native 化（提高绕过成本）
② 检测结果上报服务端（风控决策在后端）
③ 延迟响应（不立即暴露检测逻辑）
④ 持续对抗（检测策略定期更新）
⑤ 核心业务不依赖客户端检测（服务端兜底）
```

---

## 七、API 安全

### 7.1 接口防护要点

```
① 认证（Authentication）：
   - Token 短时效（Access 15min + Refresh 30d）
   - Refresh Token 单设备绑定 + 可撤销
   - 异地/异设备登录检测

② 授权（Authorization）：
   - 服务端校验资源归属（防水平越权）
     ❌ GET /api/order/123 → 仅校验登录态
     ✅ 校验 order.userId == currentUser.id
   - 角色权限校验（防垂直越权）

③ 限流（Rate Limiting）：
   - 按用户/IP/设备多维度限流
   - 滑动窗口算法
   - 验证码/人机验证升级

④ 输入校验：
   - 服务端永不信任客户端参数
   - 防注入/防越界/防负数金额等业务校验
```

### 7.2 设备指纹

```
用途：风控识别（多账号检测/设备封禁/异常登录）

Android 可用标识（合规前提下）：
- Android ID（恢复出厂会变）
- OAID（国内广告标识，替代 IMEI）
- 硬件特征组合（屏幕/传感器/字体列表）
- ⚠️ IMEI/MAC 已限制获取（Android 10+）

iOS 可用标识：
- identifierForVendor（同开发者唯一，卸载重装变化）
- Keychain 持久化 ID（卸载不清除）
- ⚠️ IDFA 需 ATT 用户授权

设备指纹趋势：
- 单一标识不可靠 → 多维特征指纹（概率匹配）
- 隐私合规收紧 → 服务端行为风控权重上升
```

---

## 八、Flutter 的安全特性与局限

### 8.1 Flutter 的天然安全优势

```
① AOT 机器码：
   Release 无字节码 → 反编译难度远高于 Java/JS
   对比：React Native (JS Bundle 明文) 几乎零门槛

② 符号混淆支持：
   --obfuscate + --split-debug-info

③ 单语言栈：
   无 Java 层暴露面（除插件 Native 代码）

④ 内存安全语言：
   Dart 无指针/缓冲区溢出类漏洞
```

### 8.2 Flutter 的安全局限

```
① 字符串常量裸露：
   libapp.so 中字符串可提取（URL/密钥/配置）
   → 敏感字符串加密存储 + 运行时解密

② Dart 逻辑可被动态分析：
   Frida 可 Hook Dart VM 内部函数
   → 关键逻辑 Native 化（FFI）

③ 插件引入原生攻击面：
   第三方插件的 Java/ObjC 代码不受 Dart 保护
   → 审计插件来源，核心能力自研

④ Debug 模式极不安全：
   JIT + VM Service 开放 → 可执行任意 Dart 代码
   → 确保 Release 不残留调试开关

⑤ 热更新方案的风险：
   动态下发 Dart 补丁（如 Shorebird）
   → 补丁通道被劫持 = 远程代码执行
   → 补丁必须签名校验 + HTTPS 固定
```

### 8.3 敏感逻辑 Native 化

```dart
// 高敏算法（签名/加解密）移至 Native：
// 1. C/C++ 实现核心算法
// 2. 编译为 .so / .framework（可加固）
// 3. Dart FFI 调用

import 'dart:ffi';

final _lib = DynamicLibrary.open('libsecure.so');
final _sign = _lib.lookupFunction<
    Pointer<Utf8> Function(Pointer<Utf8>, Int32),
    Pointer<Utf8> Function(Pointer<Utf8>, int)>('native_sign');

String sign(String payload) {
  final input = payload.toNativeUtf8();
  final result = _sign(input, payload.length);
  return result.toDartString();
}

// Native 层再叠加：混淆 + 反调试 + 完整性校验
```

---

## 九、安全开发清单

### 9.1 上线前安全检查

```
数据安全：
□ 敏感数据（Token/密钥）存 Keystore/Keychain
□ 无明文敏感文件（数据库/日志/缓存）
□ 日志无敏感信息（Release 验证）
□ 剪贴板敏感内容处理
□ 键盘缓存/自动填充评估（密码字段关闭）

网络安全：
□ 全站 HTTPS + 禁用明文降级
□ 证书固定（生产环境）
□ 请求签名 + 防重放
□ Token 短时效 + 刷新机制

代码保护：
□ Release 构建（--obfuscate --split-debug-info）
□ Android R8 混淆开启
□ iOS 符号剥离
□ 无硬编码密钥/证书
□ 调试开关/测试后门移除

运行环境：
□ Root/越狱检测（风控上报）
□ 模拟器检测（反作弊场景）
□ 完整性自校验

服务端：
□ 接口鉴权 + 资源归属校验
□ 限流 + 防刷
□ 输入校验（不信任客户端）
□ 敏感操作二次验证
```

### 9.2 安全与体验的平衡

```
过度安全的代价：
- 频繁二次验证 → 用户流失
- 强制升级证书 → 证书事故时无法热修
- 全面禁用模拟器 → 误伤正常用户（部分平板）

分级防护策略：
┌──────────┬──────────────────────────────┐
│ 场景      │ 安全强度                       │
├──────────┼──────────────────────────────┤
│ 浏览内容  │ 基础（HTTPS + 登录态）          │
│ 个人信息  │ 中等（加密存储 + Token 时效）    │
│ 支付交易  │ 高（环境检测 + 二次验证 + 签名）  │
│ 账号操作  │ 高（设备绑定 + 异地检测）        │
└──────────┴──────────────────────────────┘
```

---

## 📎 参考资源

- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [OWASP MASTG 移动安全测试指南](https://mas.owasp.org/)
- [Flutter 安全最佳实践](https://docs.flutter.dev/deployment/obfuscate)
- [Frida 官方文档](https://frida.re/docs/)
