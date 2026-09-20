# 安全（security）

> 检查项目中的安全漏洞和风险。

## 检查项

### 1. 不安全的正则表达式

- **严重级别**：🟡 Warning
- **检查方式**：检查 `RegExp` 中是否存在嵌套量词等可能触发 ReDoS 的模式
- **问题示例**：

```dart
final regex = RegExp(r'^(a+)+$'); // 嵌套量词，可能指数级回溯
```

- **处理建议**：使用更精确的正则表达式，避免嵌套量词

### 2. 敏感信息硬编码

- **严重级别**：🔴 Error
- **检查方式**：检查代码中是否存在硬编码的 API Key、密码、Token、私钥、加密盐等
- **问题示例**：

```dart
const apiKey = 'sk-abc123def456';
const dbPassword = 'admin123';
```

- **处理建议**：使用 `--dart-define` / 环境配置注入，密钥不入库；服务端密钥严禁打进客户端

### 3. 明文存储敏感数据

- **严重级别**：🔴 Error
- **检查方式**：检查 Token / 密码 / 隐私数据是否用 `SharedPreferences`、文件明文存储
- **问题示例**：

```dart
await prefs.setString('token', token); // ❌ 明文存储
```

- **正确写法**：

```dart
// ✅ 使用系统密钥库加密存储
await secureStorage.write(key: 'token', value: token);
```

- **处理建议**：使用 `flutter_secure_storage`（Keychain / Keystore）

### 4. 明文 http 传输 / 关闭证书校验

- **严重级别**：🔴 Error
- **检查方式**：
  - 检查是否使用 `http://` 明文传输敏感数据（应使用 `https://`）
  - 检查 Dio/HttpClient 是否关闭了证书校验（`badCertificateCallback` 直接返回 true）
- **问题示例**：

```dart
Dio(BaseOptions(baseUrl: 'http://api.example.com'));
// ❌ 信任所有证书，易受中间人攻击
..badCertificateCallback = (cert, host, port) => true;
```

- **处理建议**：全站 HTTPS；确需自签证书应做证书固定（certificate pinning），而非无条件信任

### 5. SQL / 命令拼接注入

- **严重级别**：🔴 Error
- **检查方式**：检查 `sqflite` / `drift` 等是否用字符串拼接构造 SQL 而未使用参数化查询
- **问题示例**：

```dart
// ❌ 字符串拼接，存在注入风险
db.rawQuery("SELECT * FROM users WHERE name = '$input'");
```

- **正确写法**：

```dart
// ✅ 参数化查询
db.rawQuery('SELECT * FROM users WHERE name = ?', [input]);
```

### 6. WebView / 动态内容风险

- **严重级别**：🟡 Warning
- **检查方式**：检查 `WebView` 是否开启了 JavaScript 且加载不可信 URL，是否配置了导航白名单；是否加载了远程 Dart 代码
- **处理建议**：限制 WebView 可访问域名，禁用不必要的 JS 桥接，不加载不可信内容
