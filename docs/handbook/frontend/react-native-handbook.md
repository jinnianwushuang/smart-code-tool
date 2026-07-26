# React Native 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-26  
> **适用对象**: React 开发者、移动端工程师、跨平台开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、核心组件](#二核心组件)
- [三、布局与样式](#三布局与样式)
- [四、列表与虚拟化](#四列表与虚拟化)
- [五、导航](#五导航)
- [六、状态管理](#六状态管理)
- [七、网络请求](#七网络请求)
- [八、平台适配](#八平台适配)
- [九、原生模块与桥接](#九原生模块与桥接)
- [十、动画](#十动画)
- [十一、手势](#十一手势)
- [十二、存储](#十二存储)
- [十三、设备能力](#十三设备能力)
- [十四、性能优化](#十四性能优化)
- [十五、调试与发布](#十五调试与发布)

---

## 一、基础概念

### 1.1 创建项目

```bash
# 官方推荐（React Native Community CLI）
npx @react-native-community/cli init MyApp
cd MyApp

# 使用 Expo（推荐新手，开箱即用）
npx create-expo-app MyApp
cd MyApp

# 启动 Metro 打包器
npm start

# 运行到平台
npm run android   # Android
npm run ios       # iOS（需 macOS + Xcode）
```

### 1.2 项目结构

```
MyApp/
├── android/          # Android 原生工程（Gradle）
├── ios/              # iOS 原生工程（Xcode）
├── src/              # 业务源码（约定）
│   ├── components/   # 组件
│   ├── screens/      # 页面
│   ├── navigation/   # 导航配置
│   ├── services/     # 网络/业务服务
│   └── utils/        # 工具函数
├── App.tsx           # 应用入口
├── index.js          # 注册入口
├── metro.config.js   # Metro 打包配置
└── package.json
```

### 1.3 应用入口

```javascript
// index.js
import { AppRegistry } from 'react-native'
import App from './App'
import { name as appName } from './app.json'

AppRegistry.registerComponent(appName, () => App)
```

```tsx
// App.tsx
import React from 'react'
import { SafeAreaView, Text, StatusBar } from 'react-native'

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Text>Hello React Native!</Text>
    </SafeAreaView>
  )
}

export default App
```

### 1.4 RN 与 Web React 的差异

| 维度 | Web React | React Native |
| ---- | --------- | ------------ |
| 渲染目标 | DOM（浏览器） | 原生视图（iOS/Android） |
| 标签 | div/span/h1 | View/Text/Image |
| 样式 | CSS（级联） | StyleSheet（Flexbox，无级联） |
| 事件 | 合成事件 | 触摸手势系统 |
| 路由 | react-router | React Navigation |
| 桥接 | 无 | JSI / TurboModules |

---

## 二、核心组件

### 2.1 基础组件速查

```tsx
import {
  View,        // 容器（≈ div）
  Text,        // 文本（≈ span，必须包裹文本）
  Image,       // 图片（≈ img）
  TextInput,   // 输入框（≈ input）
  ScrollView,  // 滚动容器
  Pressable,   // 可按压交互（推荐）
  TouchableOpacity, // 带透明度过渡的按压
  Switch,      // 开关
  Modal,       // 模态框
  ActivityIndicator, // 加载指示器
  FlatList,    // 高性能列表
} from 'react-native'
```

### 2.2 View 与 Text

```tsx
<View style={styles.container}>
  <Text style={styles.title}>标题</Text>
  <Text style={styles.body} numberOfLines={2}>
    正文内容，超出两行省略...
  </Text>
  <Text>
    嵌套 <Text style={{ fontWeight: 'bold' }}>加粗</Text> 文本
  </Text>
</View>
```

### 2.3 Image

```tsx
// 网络图片（必须指定宽高）
<Image
  source={{ uri: 'https://example.com/pic.png' }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"  // cover | contain | stretch | center
/>

// 本地图片
<Image source={require('./assets/logo.png')} style={styles.logo} />
```

### 2.4 TextInput

```tsx
const [text, setText] = useState('')

<TextInput
  style={styles.input}
  value={text}
  onChangeText={setText}
  placeholder="请输入..."
  placeholderTextColor="#999"
  secureTextEntry={false}      // 密码输入
  keyboardType="numeric"       // 键盘类型
  maxLength={20}
  returnKeyType="done"
  onSubmitEditing={() => console.log('提交')}
/>
```

### 2.5 Pressable（推荐交互组件）

```tsx
<Pressable
  onPress={() => console.log('点击')}
  onLongPress={() => console.log('长按')}
  android_ripple={{ color: '#ccc' }}   // Android 水波纹
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,   // 按压态样式
  ]}
>
  <Text>点我</Text>
</Pressable>
```

### 2.6 ScrollView

```tsx
<ScrollView
  horizontal={false}          // 横向滚动
  showsVerticalScrollIndicator={false}
  refreshControl={            // 下拉刷新
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  onScrollEndDrag={(e) => console.log(e.nativeEvent.contentOffset.y)}
>
  {items.map((item) => (
    <Card key={item.id} data={item} />
  ))}
</ScrollView>
```

### 2.7 Modal 与 ActivityIndicator

```tsx
<Modal visible={visible} transparent animationType="fade">
  <View style={styles.overlay}>
    <View style={styles.dialog}>
      <Text>确认操作？</Text>
      <Button title="确定" onPress={() => setVisible(false)} />
    </View>
  </View>
</Modal>

{loading && <ActivityIndicator size="large" color="#007AFF" />}
```

---

## 三、布局与样式

### 3.1 StyleSheet 基础

```tsx
import { StyleSheet, View, Text } from 'react-native'

function Card() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>卡片</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android 阴影
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
})
```

### 3.2 Flexbox 布局（核心）

```tsx
// RN 默认 flexDirection: 'column'（与 Web 相反！）
const styles = StyleSheet.create({
  // 水平排列
  row: {
    flexDirection: 'row',
    alignItems: 'center',       // 交叉轴居中
    justifyContent: 'space-between', // 主轴两端对齐
    gap: 8,                     // 0.71+ 支持 gap
  },
  // 弹性伸缩
  flex1: { flex: 1 },           // 占据剩余空间
  // 绝对定位
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
})
```

### 3.3 尺寸单位与适配

```tsx
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native'

// 屏幕尺寸
const { width, height } = Dimensions.get('window')

// 响应式（推荐 Hook，自动响应旋转/分屏）
function Responsive() {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  return <View style={{ width: isTablet ? '50%' : '100%' }} />
}

// 像素密度
const dp = PixelRatio.getPixelSizeForLayoutSize(100) // 逻辑像素 → 物理像素
```

### 3.4 安全区域

```tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

// 组件方式
<SafeAreaView style={{ flex: 1 }}>...</SafeAreaView>

// Hook 方式（更灵活）
function Screen() {
  const insets = useSafeAreaInsets()
  return <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} />
}
```

---

## 四、列表与虚拟化

### 4.1 FlatList（长列表首选）

```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => <Row item={item} index={index} />}
  // 性能关键配置
  initialNumToRender={10}        // 首屏渲染数量
  windowSize={5}                 // 可视窗口倍数
  maxToRenderPerBatch={10}       // 每批渲染数
  removeClippedSubviews={true}   // 裁剪屏外视图（Android）
  getItemLayout={(data, index) => ({  // 固定行高时提供，跳过测量
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index,
  })}
  // 分页加载
  onEndReached={loadMore}
  onEndReachedThreshold={0.3}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
  // 下拉刷新
  refreshing={refreshing}
  onRefresh={handleRefresh}
  // 空状态 / 头部 / 尾部
  ListEmptyComponent={<EmptyView />}
  ListHeaderComponent={<Header />}
/>
```

### 4.2 SectionList（分组列表）

```tsx
<SectionList
  sections={[
    { title: '水果', data: ['苹果', '香蕉'] },
    { title: '蔬菜', data: ['青菜', '萝卜'] },
  ]}
  keyExtractor={(item, index) => item + index}
  renderItem={({ item }) => <Row text={item} />}
  renderSectionHeader={({ section }) => <Header title={section.title} />}
  stickySectionHeadersEnabled  // iOS 吸顶
/>
```

### 4.3 列表选型

| 组件 | 场景 | 虚拟化 |
| ---- | ---- | ------ |
| ScrollView | 少量内容、不定高 | ❌ 全量渲染 |
| FlatList | 长列表、同构数据 | ✅ |
| SectionList | 分组列表 | ✅ |
| FlashList（Shopify） | 超高性能列表 | ✅ 回收复用 |

---

## 五、导航

### 5.1 React Navigation 安装

```bash
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
```

### 5.2 Stack 导航

```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// 页面内跳转
function HomeScreen({ navigation }) {
  return (
    <Button
      title="去详情"
      onPress={() => navigation.navigate('Detail', { id: 42 })}
    />
  )
}

// 接收参数
function DetailScreen({ route }) {
  const { id } = route.params
  return <Text>详情 {id}</Text>
}
```

### 5.3 Tab 导航

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator()

<Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => <Icon name={route.name} size={size} color={color} />,
    tabBarActiveTintColor: '#007AFF',
  })}
>
  <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
  <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
</Tab.Navigator>
```

### 5.4 常用导航 API

```tsx
navigation.navigate('Detail', params)  // 跳转（存在则复用）
navigation.push('Detail', params)      // 强制入栈
navigation.goBack()                    // 返回
navigation.popToTop()                  // 回到栈底
navigation.replace('Login')            // 替换当前页
navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) // 重置栈
navigation.setParams({ id: 1 })        // 更新参数
```

---

## 六、状态管理

### 6.1 组件内状态（useState / useReducer）

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  return <Button title={`计数 ${count}`} onPress={() => setCount(count + 1)} />
}
```

### 6.2 Context（轻量全局）

```tsx
const ThemeContext = createContext('light')

function App() {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Main />
    </ThemeContext.Provider>
  )
}

function Main() {
  const { theme } = useContext(ThemeContext)
  return <Text>当前主题：{theme}</Text>
}
```

### 6.3 Zustand（推荐，轻量高效）

```tsx
import { create } from 'zustand'

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

// 组件中使用（自动订阅，精准更新）
function Profile() {
  const user = useUserStore((s) => s.user)
  return <Text>{user?.name}</Text>
}
```

### 6.4 方案选型

| 方案 | 适用场景 | 特点 |
| ---- | -------- | ---- |
| useState/useReducer | 组件局部 | 内置，零依赖 |
| Context | 低频全局（主题/语言） | 内置，更新粒度粗 |
| Zustand | 中大型全局状态 | 轻量、精准订阅 |
| Redux Toolkit | 大型复杂应用 | 生态成熟、规范严格 |
| Jotai / Recoil | 原子化状态 | 细粒度、派生简单 |

---

## 七、网络请求

### 7.1 Fetch 基础

```tsx
// GET
const res = await fetch('https://api.example.com/users')
const data = await res.json()

// POST
const res = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Tom' }),
})
```

### 7.2 Axios（推荐）

```bash
npm install axios
```

```tsx
import axios from 'axios'

const http = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
})

// 请求拦截器（注入 Token）
http.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器（统一错误处理）
http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) redirectToLogin()
    return Promise.reject(err)
  },
)

// 使用
const { data } = await http.get('/users')
await http.post('/users', { name: 'Tom' })
```

### 7.3 React Query（服务端状态管理）

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  )
}

function UserList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => http.get('/users').then((r) => r.data),
    staleTime: 60_000,  // 缓存 1 分钟
  })

  if (isLoading) return <ActivityIndicator />
  if (error) return <Text>加载失败</Text>
  return <FlatList data={data} renderItem={...} />
}
```

---

## 八、平台适配

### 8.1 Platform API

```tsx
import { Platform } from 'react-native'

// 条件判断
const shadow = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOpacity: 0.1 }
  : { elevation: 4 }

// 平台文件（自动按平台选择）
// api.ios.js / api.android.js
import { doSomething } from './api'

// 版本判断
if (Platform.Version >= 33) { /* Android 13+ */ }
```

### 8.2 平台样式分离

```tsx
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { paddingTop: 44 },
      android: { paddingTop: 24 },
    }),
  },
})
```

### 8.3 权限声明

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
```

```
<!-- ios/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>需要使用相机拍摄照片</string>
```

```tsx
// 运行时权限（react-native-permissions）
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'

const status = await request(PERMISSIONS.ANDROID.CAMERA)
if (status === RESULTS.GRANTED) openCamera()
```

---

## 九、原生模块与桥接

### 9.1 架构演进

```
旧架构（Bridge）：
JS ←→ JSON 序列化 ←→ Bridge（异步队列）←→ Native
问题：序列化开销、异步阻塞、启动慢

新架构（0.68+）：
JS ←→ JSI（C++ 直接持有引用）←→ TurboModules / Fabric
优势：同步调用、懒加载、并发渲染
```

### 9.2 调用原生（以电池为例）

```kotlin
// Android (Kotlin) - BatteryModule.kt
class BatteryModule(reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "BatteryModule"

  @ReactMethod
  fun getLevel(promise: Promise) {
    val level = /* 读取电量 */ 0.85
    promise.resolve(level)
  }
}
```

```objc
// iOS (ObjC) - BatteryModule.m
RCT_EXPORT_MODULE();
RCT_EXPORT_METHOD(getLevel:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@0.85);
}
```

```tsx
// JS 侧调用
import { NativeModules } from 'react-native'
const level = await NativeModules.BatteryModule.getLevel()
```

### 9.3 常用原生能力库

| 能力 | 推荐库 |
| ---- | ------ |
| 相机/相册 | react-native-vision-camera / expo-image-picker |
| 定位 | react-native-geolocation / expo-location |
| 推送 | @react-native-firebase/messaging |
| 生物识别 | react-native-biometrics |
| 文件 | react-native-fs / expo-file-system |
| 分享 | react-native-share |

---

## 十、动画

### 10.1 Animated API

```tsx
import { Animated, Easing } from 'react-native'

function FadeIn() {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,  // 关键：原生线程执行
    }).start()
  }, [])

  return <Animated.View style={{ opacity }} />
}

// 组合动画
Animated.parallel([fadeIn, slideUp]).start()   // 并行
Animated.sequence([step1, step2]).start()      // 串行
Animated.loop(spin).start()                    // 循环
```

### 10.2 插值

```tsx
const translateY = scrollY.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -50],
  extrapolate: 'clamp',
})
```

### 10.3 Reanimated（高性能推荐）

```bash
npm install react-native-reanimated
```

```tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated'

function ScaleButton() {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
      />
    </Animated.View>
  )
}
```

---

## 十一、手势

### 11.1 Gesture Handler（推荐）

```bash
npm install react-native-gesture-handler
```

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

function Draggable() {
  const offset = useSharedValue({ x: 0, y: 0 })

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      offset.value = { x: e.translationX, y: e.translationY }
    })
    .onEnd(() => {
      offset.value = withSpring({ x: 0, y: 0 })  // 回弹
    })

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle} />
    </GestureDetector>
  )
}
```

### 11.2 常用手势类型

```tsx
Gesture.Tap()        // 点击
Gesture.LongPress()  // 长按
Gesture.Pan()        // 拖拽
Gesture.Pinch()      // 捏合缩放
Gesture.Rotation()   // 旋转
Gesture.Fling()      // 轻扫

// 手势组合
Gesture.Exclusive(pan, tap)   // 互斥
Gesture.Simultaneous(pinch, rotate)  // 同时
Gesture.Race(swipeLeft, swipeRight)  // 竞争
```

---

## 十二、存储

### 12.1 AsyncStorage（轻量 KV）

```bash
npm install @react-native-async-storage/async-storage
```

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'

// 存
await AsyncStorage.setItem('token', 'abc123')
await AsyncStorage.setItem('user', JSON.stringify({ name: 'Tom' }))

// 取
const token = await AsyncStorage.getItem('token')
const user = JSON.parse((await AsyncStorage.getItem('user')) ?? 'null')

// 删 / 清空
await AsyncStorage.removeItem('token')
await AsyncStorage.clear()
```

### 12.2 MMKV（高性能推荐）

```bash
npm install react-native-mmkv
```

```tsx
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

storage.set('token', 'abc123')        // 同步写入，比 AsyncStorage 快 30 倍
const token = storage.getString('token')
storage.set('user', { name: 'Tom' })  // 直接存对象
storage.delete('token')
storage.contains('user')
```

### 12.3 存储选型

| 方案 | 特点 | 场景 |
| ---- | ---- | ---- |
| AsyncStorage | 异步、简单 | 少量配置 |
| MMKV | 同步、极快、加密 | Token/用户态 |
| SQLite | 关系型、事务 | 结构化离线数据 |
| WatermelonDB | 高性能 ORM、懒加载 | 大型离线优先应用 |

---

## 十三、设备能力

### 13.1 常用设备 API

```tsx
import {
  Dimensions,      // 屏幕尺寸
  PixelRatio,      // 像素密度
  StatusBar,       // 状态栏
  Keyboard,        // 键盘控制
  Linking,         // 深链/外部跳转
  Alert,           // 系统弹窗
  AppState,        // 前后台状态
  Vibration,       // 震动
  Appearance,      // 深色模式
} from 'react-native'

// 打开链接
await Linking.openURL('https://example.com')

// 系统弹窗
Alert.alert('提示', '确定删除？', [
  { text: '取消', style: 'cancel' },
  { text: '确定', style: 'destructive', onPress: doDelete },
])

// 监听前后台
AppState.addEventListener('change', (state) => {
  if (state === 'background') saveState()
})
```

### 13.2 深色模式

```tsx
import { useColorScheme } from 'react-native'

function Themed() {
  const scheme = useColorScheme()  // 'light' | 'dark'
  const colors = scheme === 'dark' ? DarkTheme : LightTheme
  return <View style={{ backgroundColor: colors.bg }} />
}
```

---

## 十四、性能优化

### 14.1 渲染优化

```tsx
// ① React.memo 避免无效重渲染
const Row = React.memo(({ item }) => <Text>{item.name}</Text>)

// ② useCallback 稳定回调引用
const onPress = useCallback(() => navigate('Detail'), [navigate])

// ③ 列表用 FlatList 而非 ScrollView.map
// ④ 避免在 renderItem 中创建新对象/函数
// ⑤ 图片用 FastImage 缓存
import FastImage from 'react-native-fast-image'
<FastImage source={{ uri, priority: FastImage.priority.high }} />
```

### 14.2 包体积与启动

```bash
# 开启 Hermes（默认，JS 引擎优化）
# android/app/build.gradle
project.ext.react = [
  enableHermes: true,
]
```

```
优化清单：
① 启用 Hermes（启动快 30%+，内存更低）
② 启用新架构（Fabric + TurboModules）
③ 图片压缩 + WebP 格式
④ 按需引入 lodash（lodash-es / 单函数引入）
⑤ 移除未用资源与语言包
⑥ 懒加载重型页面（React.lazy + Suspense）
```

### 14.3 性能检测工具

| 工具 | 用途 |
| ---- | ---- |
| React DevTools Profiler | 组件重渲染分析 |
| Flipper | RN 官方调试套件 |
| why-did-you-render | 检测无效渲染 |
| Performance Monitor | 内置 FPS 监视器 |
| Systrace / Perfetto | Android 帧分析 |
| Instruments | iOS 帧/内存分析 |

---

## 十五、调试与发布

### 15.1 调试方式

```bash
# Metro 开发者菜单（摇一摇 / Cmd+M）
- Reload            # 重载 JS
- Toggle Element Inspector  # 尺寸检查
- Performance Monitor       # FPS 监视

# Chrome DevTools（新架构 Hermes 调试）
# Flipper（日志/网络/布局检查）
# Reactotron（状态/网络/日志一体化）
```

### 15.2 构建发布

```bash
# Android 生成签名 APK / AAB
cd android && ./gradlew assembleRelease
cd android && ./gradlew bundleRelease   # AAB（Play 商店）

# iOS 通过 Xcode Archive 或 fastlane
fastlane ios release
```

### 15.3 热更新（CodePush / EAS Update）

```bash
# EAS Update（Expo 官方）
eas update --branch production

# CodePush（微软，经典方案）
code-push release-react MyApp-Android android -d Production
```

```tsx
// 应用内检查更新（CodePush）
import CodePush from 'react-native-code-push'

useEffect(() => {
  CodePush.sync({ installMode: CodePush.InstallMode.ON_NEXT_RESTART })
}, [])
```

### 15.4 Expo vs 裸 RN 选型

| 维度 | Expo | 裸 RN（CLI） |
| ---- | ---- | ------------ |
| 上手难度 | 极低 | 中 |
| 原生定制 | 受限（可用 Dev Client） | 完全自由 |
| 构建 | EAS 云构建 | 本地/CI |
| 热更新 | EAS Update | CodePush |
| 包体积 | 略大 | 可控 |
| 适用 | 快速迭代/中小应用 | 深度定制/大型应用 |

---

## 📎 参考资源

- [React Native 官方文档](https://reactnative.dev/docs/getting-started)
- [React Navigation 文档](https://reactnavigation.org/docs/getting-started)
- [Expo 文档](https://docs.expo.dev/)
- [React Native 新架构指南](https://reactnative.dev/docs/the-new-architecture/landing-page)
