---
title: "Vue 3 生命周期深入 [P5-P6]"
level: "intermediate"
tags: ["Vue 3", "生命周期", "组合式 API", "钩子"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Vue 3 生命周期深入 [P5-P6]

> Vue 3 组合式 API 改变了生命周期使用方式。理解完整的生命周期和执行时机，才能正确处理初始化、更新和销毁逻辑。

## 核心概念（What）

### 生命周期概览

```
Vue 组件生命周期：

创建阶段：
├── beforeCreate → 实例初始化之前
├── created → 实例创建完成
├── beforeMount → 挂载之前
└── mounted → 挂载完成

更新阶段：
├── beforeUpdate → 更新之前
└── updated → 更新完成

销毁阶段：
├── beforeUnmount → 卸载之前
└── unmounted → 卸载完成

组合式 API 钩子：
├── setup() → 组件初始化（替代 beforeCreate/created）
├── onMounted → 挂载完成
├── onUpdated → 更新完成
├── onUnmounted → 卸载完成
├── onBeforeMount → 挂载之前
├── onBeforeUpdate → 更新之前
├── onBeforeUnmount → 卸载之前
└── onActivated/onDeactivated → KeepAlive
```

## 底层原理（Why）

### 生命周期执行顺序

```
组件创建流程：

1. 创建实例
   ├── 初始化事件和生命周期
   ├── beforeCreate 钩子
   └── 初始化响应式数据

2. 创建完成
   ├── created 钩子
   └── 可以访问 data、methods

3. 编译模板
   ├── 生成 render 函数
   └── beforeMount 钩子

4. 挂载 DOM
   ├── 创建真实 DOM
   ├── 插入页面
   └── mounted 钩子

组件更新流程：

1. 数据变化
   ├── 触发响应式
   └── beforeUpdate 钩子

2. 重新渲染
   ├── 生成新 VNode
   ├── Diff 算法对比
   ├── 更新 DOM
   └── updated 钩子

组件销毁流程：

1. 准备销毁
   ├── beforeUnmount 钩子
   └── 清理定时器、事件

2. 销毁完成
   ├── 移除 DOM
   ├── 解除绑定
   └── unmounted 钩子
```

### 组合式 API 使用

```vue
<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue';

const count = ref(0);

// setup() 相当于 beforeCreate + created
console.log('setup: 组件初始化');

// 挂载完成
onMounted(() => {
  console.log('mounted: DOM 已挂载');
  
  // 常见操作：
  // ├── 发起 API 请求
  // ├── 操作 DOM
  // ├── 添加事件监听
  // └── 启动定时器
});

// 更新完成
onUpdated(() => {
  console.log('updated: DOM 已更新');
  
  // 注意：
  // ├── 不要在这里修改数据（可能无限循环）
  // └── 可以访问更新后的 DOM
});

// 卸载完成
onUnmounted(() => {
  console.log('unmounted: 组件已销毁');
  
  // 清理工作：
  // ├── 清除定时器
  // ├── 移除事件监听
  // ├── 取消订阅
  // └── 关闭 WebSocket
});

// 示例：定时器
let timer;

onMounted(() => {
  timer = setInterval(() => {
    count.value++;
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer); // 清理定时器
});

// 示例：事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize); // 清理
});

function handleResize() {
  console.log('窗口大小变化');
}
</script>
```

### 选项式 vs 组合式

```
选项式 API：
export default {
  data() {
    return { count: 0 };
  },
  mounted() {
    console.log('mounted');
  },
  unmounted() {
    console.log('unmounted');
  }
}

组合式 API：
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0);

onMounted(() => {
  console.log('mounted');
});

onUnmounted(() => {
  console.log('unmounted');
});
</script>

映射关系：
├── beforeCreate → setup()
├── created → setup()
├── beforeMount → onBeforeMount
├── mounted → onMounted
├── beforeUpdate → onBeforeUpdate
├── updated → onUpdated
├── beforeUnmount → onBeforeUnmount
└── unmounted → onUnmounted
```

## 实战应用（How）

### 常见使用场景

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 1. API 请求
const data = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('/api/data');
    data.value = await response.json();
  } catch (error) {
    console.error('请求失败:', error);
  } finally {
    loading.value = false;
  }
});

// 2. DOM 操作
const canvasRef = ref(null);

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, 100, 100);
});

// 3. 第三方库集成
import * as echarts from 'echarts';

const chartRef = ref(null);
let chart;

onMounted(() => {
  chart = echarts.init(chartRef.value);
  chart.setOption({ /* ... */ });
});

onUnmounted(() => {
  chart.dispose(); // 销毁实例
});

// 4. 事件监听
const scrollPosition = ref(0);

function handleScroll() {
  scrollPosition.value = window.scrollY;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 5. 定时器
const time = ref(new Date());
let timer;

onMounted(() => {
  timer = setInterval(() => {
    time.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>
```

### 生命周期执行顺序

```
父组件和子组件的执行顺序：

创建阶段：
├── 父 beforeCreate
├── 父 created
├── 父 beforeMount
├── 子 beforeCreate
├── 子 created
├── 子 beforeMount
├── 子 mounted
└── 父 mounted

更新阶段：
├── 父 beforeUpdate
├── 子 beforeUpdate
├── 子 updated
└── 父 updated

销毁阶段：
├── 父 beforeUnmount
├── 子 beforeUnmount
├── 子 unmounted
└── 父 unmounted

规律：
├── 创建：父→子→父
├── 更新：父→子→父
└── 销毁：父→子→父
```

### 常见陷阱

```vue
<script setup>
import { ref, onMounted, onUpdated } from 'vue';

// ❌ 陷阱 1：在 onUpdated 中修改数据
const count = ref(0);

onUpdated(() => {
  count.value++; // 无限循环！
});

// ✅ 正确：使用条件判断
onUpdated(() => {
  if (shouldUpdate()) {
    count.value++;
  }
});

// ❌ 陷阱 2：在 setup 中访问 DOM
const element = ref(null);
console.log(element.value); // null（DOM 还没挂载）

// ✅ 正确：在 onMounted 中访问
onMounted(() => {
  console.log(element.value); // DOM 元素
});

// ❌ 陷阱 3：忘记清理
onMounted(() => {
  setInterval(() => {
    console.log('timer');
  }, 1000);
}); // 组件销毁后定时器还在运行

// ✅ 正确：清理定时器
let timer;
onMounted(() => {
  timer = setInterval(() => {
    console.log('timer');
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timer);
});
</script>
```

## 高频面试题

### Q1: Vue 3 的生命周期有哪些？

```
创建阶段：
├── beforeCreate → 实例初始化前
├── created → 实例创建完成
├── beforeMount → 挂载前
└── mounted → 挂载完成

更新阶段：
├── beforeUpdate → 更新前
└── updated → 更新完成

销毁阶段：
├── beforeUnmount → 卸载前
└── unmounted → 卸载完成

组合式 API：
├── setup() → 替代 beforeCreate/created
├── onMounted → 挂载完成
├── onUpdated → 更新完成
└── onUnmounted → 卸载完成
```

### Q2: onMounted 的常见使用场景？

```
场景：
├── 发起 API 请求
├── 操作 DOM（获取元素尺寸）
├── 添加事件监听
├── 启动定时器
├── 初始化第三方库（ECharts、Map）
└── 订阅消息（WebSocket）

注意：
├── DOM 已挂载，可以访问
├── 数据可能还没加载（异步）
└── 记得在 onUnmounted 清理
```

### Q3: 父子组件的生命周期执行顺序？

```
创建：
├── 父 beforeCreate → created → beforeMount
├── 子 beforeCreate → created → beforeMount
├── 子 mounted
└── 父 mounted

更新：
├── 父 beforeUpdate
├── 子 beforeUpdate → updated
└── 父 updated

销毁：
├── 父 beforeUnmount
├── 子 beforeUnmount → unmounted
└── 父 unmounted

规律：
├── 创建：父→子→父
├── 更新：父→子→父
└── 销毁：父→子→父
```

## 延伸思考

1. 如何在 setup 中访问 DOM？
2. KeepAlive 的生命周期钩子？
3. 异步组件的生命周期？

## 参考资料

- [Vue 3 生命周期](https://vuejs.org/guide/essentials/lifecycle.html)
- [组合式 API](https://vuejs.org/guide/extras/composition-api-faq.html)
