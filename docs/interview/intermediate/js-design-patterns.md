---
title: "JavaScript 常用设计模式 [P5-P6]"
level: "intermediate"
tags: ["JavaScript", "设计模式", "观察者", "策略", "工厂", "单例"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# JavaScript 常用设计模式 [P5-P6]

> 设计模式是解决常见问题的通用方案。掌握前端常用设计模式，能写出更优雅、可维护的代码。

## 核心概念（What）

### 设计模式分类

```
设计模式分类：
├── 创建型 → 对象创建过程
│   ├── 工厂模式
│   ├── 单例模式
│   └── 原型模式
├── 结构型 → 对象组合方式
│   ├── 装饰器模式
│   ├── 适配器模式
│   └── 代理模式
└── 行为型 → 对象交互方式
    ├── 观察者模式
    ├── 策略模式
    └── 迭代器模式

前端常用：
├── 观察者模式 → 事件系统
├── 工厂模式 → 组件创建
├── 单例模式 → 全局状态
├── 策略模式 → 表单验证
├── 装饰器模式 → React 高阶组件
└── 发布-订阅 → Vue 事件总线
```

## 底层原理（Why）

### 观察者模式（Observer）

```javascript
// 观察者模式 = 一对多依赖关系

// 主题（被观察者）
class Subject {
  constructor() {
    this.observers = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// 观察者
class Observer {
  update(data) {
    console.log('收到更新:', data);
  }
}

// 使用
const subject = new Subject();
const observer1 = new Observer();
const observer2 = new Observer();

subject.addObserver(observer1);
subject.addObserver(observer2);

subject.notify('Hello'); // 两个观察者都收到

// 应用：Vue 响应式
// ├── data 变化 → 通知依赖
// ├── 依赖更新 → 重新渲染
// └── Watcher = 观察者

// 应用：DOM 事件
button.addEventListener('click', (event) => {
  console.log('按钮被点击');
});
```

### 发布-订阅模式（Pub/Sub）

```javascript
// 发布-订阅 = 中间人模式

class EventBus {
  constructor() {
    this.events = {};
  }
  
  // 订阅
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  // 取消订阅
  off(event, callback) {
    if (!this.events[event]) return;
    
    if (callback) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      delete this.events[event];
    }
  }
  
  // 发布
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(...args);
    });
  }
  
  // 只执行一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用
const bus = new EventBus();

// 订阅
bus.on('user-login', (user) => {
  console.log('用户登录:', user);
});

// 发布
bus.emit('user-login', { name: 'Alice' });

// Vue 事件总线
// main.js
Vue.prototype.$bus = new EventBus();

// 组件 A
this.$bus.emit('update-cart', itemCount);

// 组件 B
this.$bus.on('update-cart', (count) => {
  this.cartCount = count;
});
```

### 工厂模式（Factory）

```javascript
// 工厂模式 = 创建对象的接口

// 简单工厂
class Button {
  render() {
    throw new Error('必须实现 render 方法');
  }
}

class PrimaryButton extends Button {
  render() {
    return '<button class="primary">主要按钮</button>';
  }
}

class SecondaryButton extends Button {
  render() {
    return '<button class="secondary">次要按钮</button>';
  }
}

class ButtonFactory {
  static create(type) {
    switch (type) {
      case 'primary':
        return new PrimaryButton();
      case 'secondary':
        return new SecondaryButton();
      default:
        throw new Error('未知类型');
    }
  }
}

// 使用
const primaryBtn = ButtonFactory.create('primary');
console.log(primaryBtn.render());

// 应用：React .createElement
// React.createElement('div', { className: 'box' }, '内容')
// 返回 React 元素对象

// 应用：Vue 组件注册
// Vue.component('MyComponent', { ... })
```

### 单例模式（Singleton）

```javascript
// 单例模式 = 全局唯一实例

class Store {
  constructor() {
    if (Store.instance) {
      return Store.instance;
    }
    
    this.state = {};
    Store.instance = this;
  }
  
  getState() {
    return this.state;
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }
}

// 使用
const store1 = new Store();
const store2 = new Store();

console.log(store1 === store2); // true（同一实例）

store1.setState({ count: 1 });
console.log(store2.getState()); // { count: 1 }

// 应用：Vuex/Pinia
// import { useStore } from 'vuex';
// const store = useStore(); // 全局唯一

// 应用：全局配置
class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }
    
    this.config = {};
    Config.instance = this;
  }
  
  get(key) {
    return this.config[key];
  }
  
  set(key, value) {
    this.config[key] = value;
  }
}

const config1 = new Config();
const config2 = new Config();
console.log(config1 === config2); // true
```

### 策略模式（Strategy）

```javascript
// 策略模式 = 封装算法

// 表单验证
const validators = {
  required: (value) => {
    return value ? null : '必填';
  },
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : '邮箱格式错误';
  },
  
  minLength: (min) => (value) => {
    return value.length >= min ? null : `至少${min}个字符`;
  },
  
  maxLength: (max) => (value) => {
    return value.length <= max ? null : `最多${max}个字符`;
  }
};

// 使用
function validate(value, rules) {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

const usernameRules = [
  validators.required,
  validators.minLength(3),
  validators.maxLength(20)
];

const emailRules = [
  validators.required,
  validators.email
];

console.log(validate('', usernameRules)); // '必填'
console.log(validate('ab', usernameRules)); // '至少3个字符'
console.log(validate('alice@example.com', emailRules)); // null
```

### 装饰器模式（Decorator）

```javascript
// 装饰器模式 = 动态添加功能

// React 高阶组件（HOC）
function withLoading(Component) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
}

// 使用
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading 
  users={users} 
  isLoading={loading} 
/>

// React Redux connect
const ConnectedComponent = connect(mapStateToProps, mapDispatchToProps)(MyComponent);

// Vue 混入（Mixin）
const timestampMixin = {
  created() {
    this.createdAt = new Date();
  },
  methods: {
    formatTimestamp() {
      return this.createdAt.toLocaleString();
    }
  }
};

export default {
  mixins: [timestampMixin],
  // ...
}

// TypeScript 装饰器
function log(target, key, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
}
```

## 实战应用（How）

### 模式选择

```
场景 → 模式：
├── 事件系统 → 观察者/发布-订阅
├── 组件创建 → 工厂模式
├── 全局状态 → 单例模式
├── 表单验证 → 策略模式
├── 功能扩展 → 装饰器模式
├── 接口适配 → 适配器模式
└── 复杂对象 → 建造者模式
```

## 高频面试题

### Q1: 观察者模式和发布-订阅的区别？

```
观察者模式：
├── 主题维护观察者列表
├── 主题直接通知观察者
├── 松耦合（但仍有依赖）
└── 示例：Vue 响应式

发布-订阅：
├── 发布者和订阅者完全解耦
├── 通过中间人（事件总线）通信
├── 更灵活
└── 示例：EventBus、Node.js EventEmitter
```

### Q2: 单例模式的应用？

```
应用：
├── 全局状态管理（Vuex/Pinia/Redux）
├── 全局配置
├── 数据库连接池
├── 缓存
└── 日志对象

优点：
├── 全局唯一实例
├── 节省资源
└── 统一访问点

缺点：
├── 全局状态（难以追踪）
├── 测试困难
└── 可能滥用
```

### Q3: 策略模式的优势？

```
优势：
├── 避免大量 if-else
├── 算法可复用
├── 易于扩展
└── 符合开闭原则

应用：
├── 表单验证
├── 价格计算
├── 排序算法
└── 动画效果
```

## 延伸思考

1. 如何用装饰器实现日志记录？
2. 观察者模式的内存泄漏问题？
3. 如何测试单例模式？

## 参考资料

- [设计模式 - 阮一峰](https://www.ruanyifeng.com/blog/2016/10/online_design_patterns.html)
- [JavaScript 设计模式](https://www.patterns.dev/posts/classic-design-patterns/)
