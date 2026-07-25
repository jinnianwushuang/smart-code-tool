# 原生开发主流语言：简单说明与基础对比

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 语言选型本质是"生态绑定"——选 Java/Kotlin 就是选 Android 生态，选 Swift 就是选 Apple 生态。理解每门语言的设计取舍与生态位，才能在跨平台与原生之间做出理性决策。

---

## 📑 目录

- [一、原生开发语言全景](#一原生开发语言全景)
- [二、Android 阵营：Java vs Kotlin](#二android-阵营java-vs-kotlin)
- [三、iOS 阵营：Objective-C vs Swift](#三ios-阵营objective-c-vs-swift)
- [四、跨平台语言：Dart / JS-TS / C#](#四跨平台语言dart--js-ts--c)
- [五、系统级语言：C/C++ 与 Rust](#五系统级语言cc-与-rust)
- [六、多维度横向对比](#六多维度横向对比)
- [七、语言选型决策](#七语言选型决策)
- [八、趋势与展望](#八趋势与展望)

---

## 一、原生开发语言全景

### 1.1 语言与平台的绑定关系

```
┌─ 平台专属语言 ────────────────────────────┐
│ Android：Kotlin（官方首选）/ Java（遗留）    │
│ iOS/macOS：Swift（官方首选）/ ObjC（遗留）   │
└──────────────────────────────────────────┘
┌─ 跨平台语言 ──────────────────────────────┐
│ Dart：Flutter（自绘引擎，全平台）            │
│ JavaScript/TypeScript：React Native         │
│ C#：.NET MAUI / Xamarin                     │
└──────────────────────────────────────────┘
┌─ 系统级/通用语言 ─────────────────────────┐
│ C/C++：NDK / 游戏引擎 / 高性能库            │
│ Rust：新兴系统编程（Android/iOS 底层渐入）    │
└──────────────────────────────────────────┘

关键认知：
- "原生开发"狭义 = 平台专属语言（Kotlin/Swift）
- 广义 = 直接调用平台 API 的开发方式（含 C++ NDK）
- 跨平台语言通过框架间接调用平台能力
```

### 1.2 各语言诞生背景

| 语言 | 诞生年 | 设计者 | 核心使命 |
| ---- | ------ | ------ | -------- |
| Java | 1995 | Sun (Gosling) | 一次编写到处运行（JVM） |
| C++ | 1985 | Stroustrup | C 之上增加面向对象 + 零成本抽象 |
| Objective-C | 1984 | Cox | C + Smalltalk 消息机制（Apple 采用） |
| C# | 2000 | Microsoft (Hejlsberg) | .NET 平台主力语言 |
| JavaScript | 1995 | Eich | 浏览器脚本（后借 RN 进入移动） |
| Rust | 2010 | Mozilla (Hoare) | 内存安全的系统编程 |
| Swift | 2014 | Apple (Lattner) | 取代 ObjC 的现代 Apple 语言 |
| Kotlin | 2011 | JetBrains | 更好的 Java（JVM/Android） |
| Dart | 2011 | Google (Lars Bak) | 客户端优化语言（Flutter 载体） |
| TypeScript | 2012 | Microsoft (Hejlsberg) | JS 的静态类型超集 |

---

## 二、Android 阵营：Java vs Kotlin

### 2.1 Java 的特点与现状

```java
// Java：Android 的"开国语言"
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button btn = findViewById(R.id.button);
        btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {  // 匿名内部类，冗长
                Toast.makeText(this, "Hi", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

特点：
├── 静态强类型，面向对象（一切皆对象）
├── JVM 字节码 → Android 上转为 DEX
├── 空安全弱（NPE 是"十亿美元错误"）
├── 语法冗长（样板代码多）
└── 生态极其成熟（海量库/资料）

现状：
- 2019 起 Google 宣布 Kotlin 为 Android 首选
- 新项目基本不再用纯 Java
- 但存量代码、部分 SDK 仍是 Java
```

### 2.2 Kotlin 的改进

```kotlin
// Kotlin：同等功能的简洁写法
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.button).setOnClickListener {
            toast("Hi")  // Lambda 简化
        }
    }
}

核心改进：
├── 空安全（类型系统级，String? 显式可空）
├── 类型推断（减少类型声明）
├── 数据类（data class 自动生成 equals/hashCode/copy）
├── 协程（Coroutines，优雅的异步）
├── 扩展函数（给现有类加方法）
├── 空安全 + 智能转换
└── 与 Java 100% 互操作

// 协程示例（对比 Java 的回调地狱）
lifecycleScope.launch {
    val user = api.getUser()        // 挂起，非阻塞
    val orders = api.getOrders(user) // 顺序写异步
    updateUI(orders)
}
```

### 2.3 Java vs Kotlin 对比

| 维度 | Java | Kotlin |
| ---- | ---- | ------ |
| 语法简洁度 | 冗长（样板多） | 简洁（推断+Lambda） |
| 空安全 | 无（运行时 NPE） | 类型系统级 |
| 异步 | 回调/Future（繁琐） | 协程（同步写法） |
| 函数式 | 8+ 支持（较弱） | 一等公民 |
| 编译速度 | 较快 | 略慢（增量优化中） |
| 学习曲线 | 平缓 | 平缓（Java 开发者友好） |
| 互操作 | - | 与 Java 无缝 |
| 多平台 | JVM 为主 | KMP（Kotlin Multiplatform） |
| 官方地位 | 遗留支持 | Android 首选 |

**结论**：Android 新开发无脑选 Kotlin；维护老项目需懂 Java。

---

## 三、iOS 阵营：Objective-C vs Swift

### 3.1 Objective-C 的特点

```objc
// Objective-C：C 的超集 + Smalltalk 消息机制
@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
- (void)sayHelloTo:(NSString *)someone;
@end

@implementation Person
- (void)sayHelloTo:(NSString *)someone {
    NSLog(@"Hello, %@", someone);  // 消息发送 [obj method]
}
@end

// 调用：消息传递语法
[person sayHelloTo:@"Tom"];

特点：
├── 动态运行时（消息机制，方法可运行时替换）
├── C 的超集（可直接混编 C 代码）
├── 语法独特（方括号消息发送，初学门槛高）
├── 无命名空间（前缀约定 NS/UI）
├── 手动内存管理时代 → ARC（自动引用计数）
└── 空值不敏感（nil 消息返回 0/nil，不崩溃）

现状：
- 大量存量代码（老项目/底层库）
- 新代码基本用 Swift
- 但理解 ObjC 对读源码/调试仍必要
```

### 3.2 Swift 的设计

```swift
// Swift：现代、安全、快速
struct Person {
    let name: String
    func sayHello(to someone: String) {
        print("Hello, \(someone)")  // 字符串插值
    }
}

let person = Person(name: "Tom")
person.sayHello(to: "Jerry")

// 空安全（Optional）
var email: String? = nil
let length = email?.count ?? 0  // 可选链 + 空合运算

// 协议扩展（面向协议编程）
protocol Describable { var description: String { get } }
extension Int: Describable {
    var description: String { "数字 \(self)" }
}

特点：
├── 静态强类型 + 类型推断
├── Optional 空安全（编译期强制处理）
├── 值类型优先（struct）+ 引用类型（class）
├── 面向协议编程（POP，区别于 OOP）
├── 现代特性：泛型、闭包、枚举关联值、async/await
├── 性能接近 C（LLVM 编译，无运行时开销）
└── 内存安全（ARC + 独占访问检查）
```

### 3.3 ObjC vs Swift 对比

| 维度 | Objective-C | Swift |
| ---- | ----------- | ----- |
| 类型安全 | 弱（id 类型/动态） | 强（编译期检查） |
| 空安全 | nil 消息静默 | Optional 强制处理 |
| 性能 | 消息分发有开销 | 静态派发，接近 C |
| 语法 | 方括号，冗长 | 现代简洁 |
| 运行时动态性 | 极强（Method Swizzling） | 受限（更安全） |
| 与 C 混编 | 超集，直接混编 | 需桥接（但支持） |
| 包体积 | 依赖运行时 | 静态链接，略增 |
| 跨平台 | Apple 专属 | 开源（Linux/服务端可用） |
| 官方地位 | 遗留维护 | Apple 首选 |

**结论**：iOS 新开发选 Swift；但 ObjC 的动态性在 Hook/热修等场景仍不可替代。

---

## 四、跨平台语言：Dart / JS-TS / C#

### 4.1 Dart（Flutter）

```dart
// Dart：为客户端优化的语言
void main() {
  final counter = Counter();
  counter.increment();
  print(counter.value);
}

class Counter {
  int _value = 0;
  int get value => _value;
  void increment() => _value++;
}

// async/await + Stream
Future<void> loadData() async {
  final data = await fetchData();
  await for (final item in dataStream) {
    process(item);
  }
}

设计取向：
├── 针对客户端 UI 场景优化
├── JIT（开发热重载）+ AOT（发布高性能）双模式
├── 单线程 + Event Loop（Isolate 并行）
├── 强类型 + 类型推断 + 空安全
└── 学习曲线平缓（Java/JS 开发者易上手）
```

### 4.2 JavaScript / TypeScript（React Native）

```typescript
// TypeScript：JS 的静态类型超集
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

// React Native 组件
function UserCard({ user }: { user: User }) {
  return (
    <View>
      <Text>{user.name}</Text>
    </View>
  );
}

特点：
├── JS：动态弱类型，事件驱动，单线程
├── TS：编译期类型检查（运行时仍是 JS）
├── 生态最大（npm 海量包）
├── Web 开发者零门槛进入移动
├── RN 通过桥接调用原生（新架构 JSI 优化）
└── 性能上限低于原生/Flutter（解释执行 + 桥）
```

### 4.3 C#（.NET MAUI）

```csharp
// C#：微软生态的现代 OOP 语言
public class UserService {
    public async Task<User> GetUserAsync(int id) {
        return await _httpClient.GetFromJsonAsync<User>($"/users/{id}");
    }
}

// MAUI 跨平台 UI
public partial class MainPage : ContentPage {
    void OnCounterClicked(object sender, EventArgs e) {
        count++;
        CounterLabel.Text = $"Clicked {count} times";
    }
}

特点：
├── 强类型 + 现代特性（async/await 先驱、LINQ）
├── .NET 运行时（跨平台）
├── MAUI：Xamarin 继任者，一套代码多平台
├── 微软生态强（Azure/企业级）
└── 移动端社区/生态弱于 Flutter/RN
```

### 4.4 跨平台语言对比

| 维度 | Dart | JS/TS | C# |
| ---- | ---- | ----- | -- |
| 类型系统 | 强 + 空安全 | TS 静态/JS 动态 | 强 + 完善 |
| 执行方式 | AOT/JIT | 解释/JIT | JIT/AOT |
| UI 渲染 | 自绘（Skia） | 原生控件映射 | 原生控件映射 |
| 性能 | 高 | 中 | 中-高 |
| 生态规模 | 中（成长快） | 极大（npm） | 中（NuGet） |
| 热重载 | 优秀 | 优秀 | 一般 |
| 主流框架 | Flutter | React Native | .NET MAUI |
| 市场占有率 | 上升 | 高 | 低（移动） |

---

## 五、系统级语言：C/C++ 与 Rust

### 5.1 C/C++ 在移动中的角色

```
应用场景：
├── Android NDK：性能敏感模块（音视频/加密/AI 推理）
├── iOS：底层库、游戏引擎、与 ObjC 混编
├── 跨平台引擎：Flutter Engine(C++) / Unreal / Unity
├── 音视频编解码：FFmpeg / x264 / opus
└── 数据库/网络底层：SQLite / OpenSSL

特点：
├── 极致性能（零抽象成本，手动内存管理）
├── 直接操作硬件/内存
├── 跨平台（编译到各平台机器码）
├── 但：内存安全漏洞多（缓冲区溢出/UAF）
└── 开发效率低，调试困难

// NDK 调用示例（Dart FFI / JNI）
extern "C" JNIEXPORT jint JNICALL
Java_com_app_Native_add(JNIEnv* env, jobject, jint a, jint b) {
    return a + b;
}
```

### 5.2 Rust：内存安全的系统语言

```rust
// Rust：无 GC 实现内存安全（所有权系统）
fn main() {
    let users = vec![
        User { name: String::from("Tom") },
        User { name: String::from("Jerry") },
    ];

    // 迭代器 + 闭包（零成本抽象）
    let names: Vec<&str> = users.iter()
        .map(|u| u.name.as_str())
        .collect();
}

// 所有权：编译期杜绝数据竞争与内存错误
// 无 GC，性能对标 C++

在移动中的渗透：
├── Android 系统底层（AOSP 新模块用 Rust）
├── iOS：部分库（如 Firefox 组件）
├── 跨平台库：用 Rust 写核心，各端 FFI 调用
├── 工具链：构建工具、CLI
└── 趋势：安全敏感场景逐步替代 C/C++
```

### 5.3 系统级语言对比

| 维度 | C | C++ | Rust |
| ---- | - | --- | ---- |
| 抽象层级 | 低 | 中-高 | 中-高 |
| 内存安全 | 手动（易错） | 手动/智能指针 | 编译期保证 |
| 性能 | 极致 | 极致 | 极致 |
| 学习曲线 | 中 | 陡峭 | 陡峭 |
| 移动应用 | NDK/底层 | 引擎/NDK | 新兴底层 |
| 生态成熟度 | 极成熟 | 极成熟 | 成长中 |

---

## 六、多维度横向对比

### 6.1 核心特性矩阵

| 语言 | 类型系统 | 空安全 | 异步模型 | 内存管理 | 派发方式 |
| ---- | -------- | ------ | -------- | -------- | -------- |
| Java | 静态强 | 无 | 线程/Future | GC | 虚方法表 |
| Kotlin | 静态强 | 有 | 协程 | GC | 静态+虚 |
| ObjC | 动态弱 | nil 静默 | GCD/Block | ARC | 消息分发 |
| Swift | 静态强 | Optional | async/await | ARC | 静态+ witness table |
| Dart | 静态强 | 有 | async/Stream | GC | 静态+动态 |
| TS/JS | 静态/动态 | 严格模式 | Promise/async | GC | 原型链 |
| C# | 静态强 | 有(8+) | async/await | GC | 虚方法表 |
| C++ | 静态强 | 无 | 线程/协程(20) | 手动/RAII | 虚函数表 |
| Rust | 静态强 | Option | async/await | 所有权 | 静态+ trait |

### 6.2 性能层级（典型场景）

```
性能从高到低（粗略排序）：
C/C++/Rust（系统级，零开销）
    ↓
Swift / Kotlin AOT（接近原生）
    ↓
Dart AOT（Flutter，自绘高效）
    ↓
C# / Kotlin JVM（托管运行时）
    ↓
JavaScript（解释/JIT，桥接开销）

注意：
- 性能差异多数场景用户无感知
- 瓶颈通常在 I/O/网络，而非语言本身
- 架构设计 > 语言性能（90% 场景）
```

### 6.3 学习曲线与开发效率

```
易学 ──────────────────────────────── 难学
Dart ≈ Kotlin ≈ Swift < C# < Java < JS/TS < C++ ≈ Rust

开发效率（同等功能代码量）：
Kotlin ≈ Swift ≈ Dart > C# > Java > JS > C++ > C

心智负担：
Rust（所有权）> C++（手动内存）> C > Swift（Optional）
> Kotlin > Dart > C# > Java
```

### 6.4 就业与生态

| 语言 | 移动岗位需求 | 生态成熟度 | 薪资水平 |
| ---- | ------------ | ---------- | -------- |
| Kotlin | 高（Android） | 成熟 | 中-高 |
| Swift | 高（iOS） | 成熟 | 中-高 |
| Dart | 中-高（上升） | 成长 | 中-高 |
| TS/JS | 高（RN/全栈） | 极成熟 | 中 |
| C++ | 中（音视频/游戏） | 极成熟 | 高 |
| C# | 低（移动） | 成熟（企业） | 中 |
| Rust | 低（移动，上升） | 成长 | 高 |

---

## 七、语言选型决策

### 7.1 按目标平台选型

```
只做 Android：
└── Kotlin（首选）+ Java（维护存量）

只做 iOS：
└── Swift（首选）+ ObjC（维护存量）

双平台原生（追求极致体验/深度平台能力）：
└── Kotlin + Swift（各写一套，团队双栈）

跨平台（一套代码多端，效率优先）：
├── Flutter (Dart)：UI 一致性 + 高性能（推荐）
├── React Native (TS)：Web 团队转型 + 生态
└── .NET MAUI (C#)：微软生态/企业内

高性能底层/引擎：
└── C++ / Rust

游戏：
└── C++ (Unreal) / C# (Unity)
```

### 7.2 决策矩阵

| 考量因素 | 推荐方向 |
| -------- | -------- |
| 团队是 Web 背景 | React Native (TS) |
| 追求 UI 一致性与性能 | Flutter (Dart) |
| 深度平台能力/硬件 | 原生 (Kotlin/Swift) |
| 已有大量原生代码 | 原生 + 渐进混合 |
| 微软技术栈企业 | .NET MAUI (C#) |
| 音视频/图形密集型 | 原生 + C++/Rust |
| 快速验证 MVP | Flutter / RN |
| 长期大型 App | 原生 或 Flutter 混合栈 |

### 7.3 Flutter 开发者的语言策略

```
作为 Flutter 开发者，语言能力优先级：

必备：
① Dart（主力，日常开发）
② 平台基础（读懂原生代码）
   - Android：Kotlin 基础（看插件/写 Channel）
   - iOS：Swift 基础（看插件/写 Channel）

进阶（解决深水区问题）：
③ 原生深入（混合栈/自研插件/性能优化）
④ C/C++（FFI/音视频/底层调优）

加分：
⑤ TypeScript（理解 RN/全栈协作/工具链）
⑥ Rust（前沿底层库）

核心认知：
- Flutter 屏蔽了 UI，但屏蔽不了平台
- 越往底层/原生能力走，越需要平台语言
- "Flutter + 原生双修"是高级移动工程师的标配
```

---

## 八、趋势与展望

### 8.1 语言演进趋势

```
① 空安全成为标配
   Kotlin/Swift/Dart/Rust 全部类型系统级空安全
   老语言（Java/ObjC/JS）逐步补强

② 协程/async 统一异步编程
   回调地狱 → 协程/async-await（全语言普及）

③ 内存安全受重视
   Rust 崛起 / C++ 智能指针 / 各国推动内存安全语言
   Android/iOS 底层逐步引入 Rust

④ 多平台编译成主流
   Kotlin Multiplatform / Swift 跨平台 / Dart 全平台
   "一次编写"重新成为追求

⑤ AI 辅助弱化语言门槛
   语法记忆价值下降，架构/平台理解价值上升
```

### 8.2 给开发者的建议

```
① 不要"语言党争"
   语言是工具，解决问题才是目的
   没有最好的语言，只有最合适的场景

② 投资"平台知识"而非仅"语言语法"
   语法 AI 能写，平台机制/架构经验难替代
   （这正是本系列思考文档的价值所在）

③ T 型能力结构
   一门精通（Dart）+ 多门了解（原生/系统级）
   深度决定下限，广度决定上限

④ 关注底层不变量
   内存模型/并发/渲染/网络原理跨语言通用
   掌握原理，学任何新语言都快
```

---

## 📎 参考资源

- [Kotlin 官方文档](https://kotlinlang.org/docs/home.html)
- [Swift 官方文档](https://docs.swift.org/swift-book/)
- [Dart 语言指南](https://dart.dev/guides/language/language-tour)
- [Rust Book](https://doc.rust-lang.org/book/)
- [TIOBE 编程语言排行榜](https://www.tiobe.com/tiobe-index/)
