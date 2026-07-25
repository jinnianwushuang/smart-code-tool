# CI/CD 与发布工程化

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 移动端的 CI/CD 比 Web 复杂一个量级——双平台构建环境、证书签名管理、应用商店审核、灰度发布策略，每一环都可能成为发布瓶颈。工程化的目标是：让发布从"重大事件"变成"日常操作"。

---

## 📑 目录

- [一、移动端 CI/CD 全景](#一移动端-cicd-全景)
- [二、构建环境管理](#二构建环境管理)
- [三、证书与签名自动化](#三证书与签名自动化)
- [四、Fastlane 流水线](#四fastlane-流水线)
- [五、CI 平台选型与配置](#五ci-平台选型与配置)
- [六、版本号与构建号管理](#六版本号与构建号管理)
- [七、测试门禁与质量卡点](#七测试门禁与质量卡点)
- [八、分发与灰度发布](#八分发与灰度发布)
- [九、崩溃监控与线上守护](#九崩溃监控与线上守护)
- [十、发布流程规范](#十发布流程规范)

---

## 一、移动端 CI/CD 全景

### 1.1 与 Web CI/CD 的差异

```
Web CI/CD：
代码 → 构建 → 测试 → 部署服务器 → 用户即时可见
特点：分钟级发布、随时回滚、无审核

移动端 CI/CD：
代码 → 构建(双平台) → 测试 → 签名 → 上传商店 → 审核 → 灰度 → 全量
特点：
├── 构建环境受限（iOS 必须 macOS）
├── 签名体系复杂（证书/描述文件）
├── 商店审核不可控（iOS 1-48h）
├── 发布后无法热修（Dart 代码）
└── 回滚 = 重新提审（代价极高）
```

### 1.2 完整流水线阶段

```
┌─ 持续集成 (CI) ────────────────────────────┐
│ ① 代码提交 → 触发流水线                       │
│ ② 静态检查（analyze / lint）                 │
│ ③ 单元测试 + Widget 测试                     │
│ ④ 构建产物（debug/release）                  │
│ ⑤ 集成测试（可选，需模拟器/真机）              │
└────────────────────────────────────────────┘
┌─ 持续交付 (CD) ────────────────────────────┐
│ ⑥ 版本号自增 + 构建 Release 包               │
│ ⑦ 签名（Android keystore / iOS 证书）        │
│ ⑧ 上传分发平台                               │
│    - 内测：蒲公英/Firebase App Distribution   │
│    - 商店：TestFlight / Google Play 内测轨道  │
│ ⑨ 通知（钉钉/飞书/Slack）                    │
└────────────────────────────────────────────┘
┌─ 发布 (Release) ──────────────────────────┐
│ ⑩ 提审（App Store / Google Play）            │
│ ⑪ 灰度放量（1% → 10% → 50% → 100%）          │
│ ⑫ 线上监控（崩溃率/ANR/性能）                 │
│ ⑬ 异常熔断（暂停放量/回滚）                   │
└────────────────────────────────────────────┘
```

---

## 二、构建环境管理

### 2.1 双平台环境要求

```
Android 构建：
├── OS：Linux / macOS / Windows 均可
├── JDK：17（AGP 8.x 要求）
├── Android SDK：按 compileSdk 安装
├── Flutter SDK：版本锁定
└── 资源：4C8G 起步，构建 5-15min

iOS 构建：
├── OS：必须 macOS（Apple 许可协议限制）
├── Xcode：版本与 Flutter/iOS SDK 匹配
├── CocoaPods：插件原生依赖
├── 证书：构建机需安装签名证书
└── 资源：macOS 构建机成本高（云 Mac ~$50-100/月）
```

### 2.2 Flutter 版本锁定

```yaml
# 方案一：.fvm/fvm_config.json（FVM 工具）
{
  "flutterSdkVersion": "3.24.0"
}
# 团队成员 fvm install / fvm use 统一版本
# CI 中 fvm exec flutter build

# 方案二：CI 镜像锁定
# Docker (Android): ghcr.io/cirruslabs/flutter:3.24.0
# macOS: 自建镜像固定 Xcode + Flutter 版本

# 方案三：pubspec 环境约束
environment:
  sdk: '>=3.4.0 <4.0.0'
  flutter: '>=3.22.0'
```

### 2.3 构建缓存策略

```
CI 缓存清单：
├── pub 缓存（~/.pub-cache）→ 依赖下载 5min → 30s
├── Gradle 缓存（~/.gradle）→ Android 增量构建
├── CocoaPods 缓存 → Pod install 加速
├── build_runner 产物 → 代码生成加速
└── Flutter  precache 产物

缓存失效策略：
- key: pubspec.lock 哈希（依赖变化即失效）
- 定期全量重建（防缓存腐化，每周一次）

缓存命中对构建时间的影响：
全量构建：Android 15min / iOS 25min
缓存构建：Android 5min / iOS 12min
```

---

## 三、证书与签名自动化

### 3.1 Android 签名管理

```
密钥安全原则：
① keystore 永不入 Git（.gitignore）
② CI 中通过环境变量/密钥管理服务注入
③ 上传密钥 + Play App Signing 分离

CI 签名配置：
# 环境变量注入
KEYSTORE_BASE64: <keystore 文件 base64>
KEYSTORE_PASSWORD: ***
KEY_ALIAS: ***
KEY_PASSWORD: ***

# CI 脚本还原
echo $KEYSTORE_BASE64 | base64 -d > android/app/upload.keystore

# gradle 引用环境变量
signingConfigs {
    release {
        storeFile file("upload.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}

密钥轮换：
- Play App Signing 托管应用签名密钥 → 上传密钥可重置
- 未加入 Play App Signing → 密钥丢失 = 应用死亡
```

### 3.2 iOS 签名管理（Fastlane Match）

```
iOS 签名痛点：
- 证书/描述文件手动管理易混乱
- 团队成员证书不一致 → "在我机器上能打包"
- 证书过期/吊销 → 构建突然失败

Fastlane Match 方案：
① 证书统一存储在加密 Git 仓库（或云存储）
② 团队/CI 通过 match 命令同步
③ 单一事实来源，自动续期管理

# 初始化（创建证书+描述文件并加密存储）
fastlane match appstore --app_identifier com.company.app
fastlane match development
fastlane match adhoc

# CI 中同步（只读）
fastlane match appstore --readonly

# Matchfile 配置
git_url("https://github.com/company/certificates")
storage_mode("git")
type("appstore")
app_identifier(["com.company.app"])

密钥管理：
- Match 加密密码存 CI 环境变量（MATCH_PASSWORD）
- App Store Connect API Key（.p8）用于自动上传
```

### 3.3 多环境签名

```
环境矩阵：
┌──────────┬──────────────┬──────────────┐
│ 环境      │ Android       │ iOS           │
├──────────┼──────────────┼──────────────┤
│ dev      │ debug 签名     │ 开发证书       │
│ staging  │ 内测 keystore  │ Ad Hoc        │
│ prod     │ 上传 keystore  │ App Store     │
└──────────┴──────────────┴──────────────┘

Flutter 多环境构建：
flutter build apk --dart-define=ENV=staging
flutter build ipa --dart-define=ENV=prod

配合原生配置切换：
- Android：productFlavors（applicationId 后缀区分）
- iOS：多 Scheme + xcconfig
```

---

## 四、Fastlane 流水线

### 4.1 Fastlane 核心能力

```
Fastlane 是移动端 CI/CD 的事实标准：
├── 截图自动化（snapshot）
├── 元数据管理（deliver）
├── 证书管理（match）
├── 构建打包（gym/build_android_app）
├── 上传分发（pilot/supply）
└── 自定义动作（插件生态）
```

### 4.2 iOS 发布 Lane 示例

```ruby
# ios/Fastfile
default_platform(:ios)

platform :ios do
  desc "内测分发"
  lane :beta do
    # 1. 自增构建号
    increment_build_number(xcodeproj: "Runner.xcodeproj")

    # 2. 同步证书
    match(type: "appstore", readonly: true)

    # 3. 构建 IPA
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "build/ios"
    )

    # 4. 上传 TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      api_key_path: "fastlane/api_key.json"
    )

    # 5. 通知团队
    slack(message: "iOS 内测包已上传 TestFlight")
  end

  desc "正式发布"
  lane :release do
    beta
    # 提交审核（自动填写审核信息）
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,  # 手动放量
      metadata_path: "fastlane/metadata"
    )
  end
end
```

### 4.3 Android 发布 Lane 示例

```ruby
# android/Fastfile
platform :android do
  desc "内测分发"
  lane :beta do
    # 1. Flutter 构建 AAB
    sh("flutter build appbundle --release --dart-define=ENV=prod")

    # 2. 上传 Google Play 内测轨道
    upload_to_play_store(
      track: "internal",           # 内测轨道
      aab: "build/app/outputs/bundle/release/app-release.aab",
      json_key: "fastlane/play-key.json",
      rollout: "1"
    )

    # 3. Firebase App Distribution（国内团队常用）
    firebase_app_distribution(
      app: "1:xxx:android:xxx",
      groups: "qa-team,dev-team",
      release_notes: changelog_from_git_commits
    )
  end

  desc "灰度发布"
  lane :rollout do |options|
    upload_to_play_store(
      track: "production",
      rollout: options[:percent],   # 0.01 → 0.1 → 1.0
      ...
    )
  end
end
```

---

## 五、CI 平台选型与配置

### 5.1 平台对比

| 平台 | macOS 支持 | Flutter 适配 | 成本 | 适用 |
| ---- | ---------- | ------------ | ---- | ---- |
| GitHub Actions | ✅ macOS Runner | 官方 Action | 中 | 开源/海外团队 |
| GitLab CI | ✅（需自备 Mac） | 自定义镜像 | 可控 | 私有化部署 |
| Codemagic | ✅ 专为移动优化 | 开箱即用 | 高 | 移动专属 |
| Jenkins | ✅（自建 Mac 节点） | 插件生态 | 低（自建） | 大厂/定制需求 |
| 腾讯云 CODING | ✅ 云 Mac | 国内网络友好 | 中 | 国内团队 |

### 5.2 GitHub Actions 示例

```yaml
# .github/workflows/release.yml
name: Build & Release

on:
  push:
    tags: ['v*']

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          cache: true
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test
      - run: flutter build appbundle --release
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
      - name: Upload to Play Store
        run: bundle exec fastlane android beta

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
          cache: true
      - run: flutter pub get
      - name: Build & Upload
        run: bundle exec fastlane ios beta
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          ASC_API_KEY: ${{ secrets.ASC_API_KEY }}
```

### 5.3 流水线触发策略

```
分支策略与触发规则：
┌──────────────┬──────────────────────────────┐
│ 事件          │ 流水线                          │
├──────────────┼──────────────────────────────┤
│ PR 创建/更新  │ analyze + test（快速反馈 <10min） │
│ merge 到 dev │ 构建 debug + 内测分发             │
│ tag v*       │ 构建 release + 双平台上传         │
│ 定时（每晚）  │ 全量集成测试 + 性能基线            │
└──────────────┴──────────────────────────────┘

快速反馈原则：
- PR 检查必须 <10min（否则开发者不看）
- 慢任务（集成测试/构建）异步化
- 失败即时通知（IM 机器人 @责任人）
```

---

## 六、版本号与构建号管理

### 6.1 版本语义

```
pubspec.yaml: version: 1.2.3+45
├── 1.2.3 = versionName（用户可见，语义化版本）
│   ├── major：不兼容的功能变更
│   ├── minor：向后兼容的功能新增
│   └── patch：向后兼容的问题修复
└── 45 = versionCode/buildNumber（商店识别，单调递增）
    ├── Android：每次上传必须递增
    └── iOS：同 versionName 内递增

双平台差异：
- Android versionCode：全局唯一递增即可
- iOS buildNumber：同一 marketing version 内唯一
```

### 6.2 版本号自动化

```bash
# CI 中自动管理构建号（避免人工冲突）

# 方案一：CI 运行号作为构建号（GitHub Actions）
BUILD_NUMBER=$GITHUB_RUN_NUMBER
flutter build apk --build-number=$BUILD_NUMBER

# 方案二：基于时间戳（保证单调递增）
BUILD_NUMBER=$(date +%y%m%d%H%M)  # 2607261430

# 方案三：Fastlane 自增（读取商店当前最大值+1）
fastlane run latest_testflight_build_number
increment_build_number(build_number: latest + 1)

# 版本名管理：
# - 语义化版本由发布负责人决定
# - git tag 触发构建（v1.2.3 → version 1.2.3）
```

---

## 七、测试门禁与质量卡点

### 7.1 质量门禁设计

```
PR 合并门禁（自动化）：
├── ✅ flutter analyze 零 error
├── ✅ 单元测试通过 + 覆盖率 ≥ 阈值
├── ✅ 新增代码必须有测试（增量覆盖率）
├── ✅ 包体积增长检查（超 500KB 需说明）
└── ✅ Code Review 通过

发布门禁（发布前）：
├── ✅ 全量回归测试通过
├── ✅ 性能基线无回退（启动/帧率/内存）
├── ✅ 崩溃率 < 0.1%（内测期数据）
├── ✅ 安全扫描（依赖漏洞/敏感信息）
└── ✅ 发布清单人工确认
```

### 7.2 包体积守护

```yaml
# CI 包体积检查脚本
- name: Check APK size
  run: |
    flutter build apk --release
    SIZE=$(stat -f%z build/app/outputs/flutter-apk/app-release.apk)
    LIMIT=31457280  # 30MB
    if [ $SIZE -gt $LIMIT ]; then
      echo "❌ APK 超限: $SIZE bytes"
      exit 1
    fi

# 体积增长归因：
# flutter build apk --analyze-size
# → 生成 build/apk-size-analysis.json
# → 定位增长的库/资源/Dart 代码
```

### 7.3 依赖安全扫描

```bash
# Dart 依赖漏洞检查
dart pub outdated --mode=null-safety
# 或使用 Snyk / Dependabot

# 原生依赖扫描：
# Android: ./gradlew dependencyCheckAnalyze
# iOS: pod audit / Snyk

# 敏感信息检测（防密钥入库）：
# gitleaks / trufflehog 扫描 Git 历史
```

---

## 八、分发与灰度发布

### 8.1 分发渠道矩阵

```
内测分发（团队/QA）：
├── Firebase App Distribution（双平台，免费）
├── 蒲公英/pgyer（国内常用）
├── TestFlight（iOS，限 1 万外部测试者）
└── Google Play 内部测试轨道（最快 5min 生效）

正式发布：
├── App Store：提审 → 通过后手动/自动发布
├── Google Play：内测 → Alpha → Beta → 生产轨道
└── 国内 Android 市场：华为/小米/OPPO/vivo 各自提审
    （无统一渠道，需逐一上传，部分支持 API）
```

### 8.2 灰度发布策略

```
Google Play 分阶段发布（Staged Rollout）：
Day 1: 1%   → 观察崩溃率/ANR
Day 2: 10%  → 观察核心指标
Day 3: 50%  → 确认无异常
Day 5: 100% → 全量

App Store 分阶段发布（Phased Release）：
Day 1: 1% / Day 2: 2% / Day 3: 5% / Day 4: 10%
Day 5: 20% / Day 6: 50% / Day 7: 100%
（Apple 自动控制节奏，可暂停）

灰度观察指标：
├── 崩溃率：对比上一版本（超过 2 倍即熔断）
├── ANR 率（Android）
├── 核心业务转化率（下单/支付成功率）
├── 启动耗时 P95
└── 用户反馈/评分突变

熔断机制：
- 自动：监控告警 → 暂停放量（Play 支持 API 操作）
- 手动：值班同学 7×24 响应
- 回滚：恢复上一版本放量（Play 支持，iOS 需重新提审）
```

### 8.3 热修复与应急

```
Dart 代码无法热修（AOT 限制）的应对：

① 配置下发（最常用）：
   - 功能开关（Feature Flag）远程关闭问题功能
   - 配置中心下发修复参数
   - 前提：架构设计时预留开关

② 资源热更：
   - 图片/文案/Lottie 等静态资源可动态下发
   - 通过 CDN + 版本管理

③ 补丁方案（谨慎）：
   - Shorebird：Dart 代码补丁（合规风险需评估）
   - 原理：替换 AOT 快照中的代码段
   - iOS 审核条款 2.5.2 风险

④ 服务端兜底：
   - 客户端 Bug 通过服务端逻辑绕过
   - 强制升级（最后手段，体验差）

最佳实践：
- Feature Flag 全覆盖核心功能（发布即可回滚）
- 灰度充分验证（不要跳过）
- 应急预案文档化（值班手册）
```

---

## 九、崩溃监控与线上守护

### 9.1 监控接入

```dart
// Sentry 一体化接入（崩溃+性能）
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'https://xxx@sentry.io/xxx';
      options.tracesSampleRate = 0.2;      // 性能采样 20%
      options.profilesSampleRate = 0.1;    // 性能剖析
      options.environment = env.name;      // 环境标识
      options.release = packageInfo.version;
      // 敏感信息过滤
      options.beforeSend = (event, hint) {
        return event.copyWith(
          user: null,  // 不上报用户信息
        );
      };
    },
    appRunner: () => runApp(const App()),
  );
}

// 崩溃自动符号化：
// CI 上传 debug symbols（--split-debug-info 产物）
// sentry-cli upload-dif build/debug-info
```

### 9.2 告警与值班

```
告警分级：
┌────────┬──────────────────────┬──────────────┐
│ 级别    │ 条件                   │ 响应          │
├────────┼──────────────────────┼──────────────┤
│ P0     │ 崩溃率 >1% / 核心链路挂  │ 5min 内响应   │
│ P1     │ 崩溃率 0.1%-1%         │ 30min 内响应  │
│ P2     │ 新增 Top 崩溃          │ 当日处理      │
│ P3     │ 性能轻微回退            │ 排期处理      │
└────────┴──────────────────────┴──────────────┘

告警通道：IM 机器人 + 电话（P0）+ 邮件汇总
值班机制：发布后 48h 重点观察期专人值守
```

---

## 十、发布流程规范

### 10.1 标准发布流程

```
T-7d  功能冻结（Feature Freeze）
      └── dev 分支停止合入新功能
T-5d  集成测试 + Bug Bash
T-3d  RC 版本（Release Candidate）
      └── 双平台构建 → 内测分发 → QA 回归
T-1d  提审
      ├── iOS：提交 App Store 审核
      └── Android：上传生产轨道（暂停放量）
T-0   发布日
      ├── iOS：审核通过 → 开始分阶段发布
      ├── Android：启动灰度 1%
      └── 全员关注监控大盘
T+1~7 灰度放量 + 监控
T+7   全量 + 发布复盘
```

### 10.2 发布检查清单

```
构建前：
□ 版本号/构建号确认
□ 环境配置确认（API 域名/密钥为生产环境）
□ 依赖锁定（pubspec.lock 提交）
□ Changelog 更新

构建后：
□ 包体积对比上一版本
□ 安装测试（真机冷启动/核心路径）
□ 权限声明检查（新增权限需合规评审）
□ 隐私政策同步（新增数据收集需更新）

提审前：
□ 商店元数据（截图/描述/隐私标签）
□ 审核备注（测试账号/特殊说明）
□ iOS 出口合规声明（加密算法）

发布后：
□ 监控大盘确认（崩溃/性能/业务）
□ 灰度按计划放量
□ 用户反馈渠道监控
```

### 10.3 发布度量

```
发布质量指标（持续追踪）：
├── 发布周期：从冻结到全量的天数（目标 <7d）
├── 回滚率：需要回滚的发布占比（目标 <5%）
├── 崩溃率：新版本 vs 旧版本（目标 ≤ 旧版本）
├── 审核通过率：iOS 一次过审率（目标 >90%）
├── 升级率：7 日内用户升级占比（目标 >60%）
└── 发布事故数：P0/P1 事故（目标 0）
```

---

## 📎 参考资源

- [Fastlane 官方文档](https://docs.fastlane.tools/)
- [Flutter 部署官方指南](https://docs.flutter.dev/deployment)
- [Google Play 分阶段发布](https://support.google.com/googleplay/android-developer/answer/6346149)
- [App Store 分阶段发布](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
