# Vue 3 核心底层原理深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-07  
> **适用对象**: 高级前端工程师、架构师、对 Vue internals 感兴趣的开发者

---

## 📑 目录

- [一、Vue 3 架构概览](#一vue-3-架构概览)
- [二、响应式系统](#二响应式系统)
- [三、虚拟 DOM 与渲染机制](#三虚拟-dom-与渲染机制)
- [四、编译优化](#四编译优化)
- [五、Composition API 实现原理](#五composition-api-实现原理)
- [六、组件系统](#六组件系统)
- [七、依赖注入与 Provide/Inject](#七依赖注入与-provideinject)
- [八、生命周期钩子](#八生命周期钩子)
- [九、Teleport 和 Suspense](#九teleport-和-suspense)
- [十、性能优化机制](#十性能优化机制)

---

## 一、Vue 3 架构概览

### 1.1 模块化设计

```
@vue/runtime-core      # 运行时核心（平台无关）
├── apiWatch           # 侦听 API
├── apiLifecycle       # 生命周期 API
├── componentRenderUtils # 组件渲染工具
└── scheduler          # 调度器

@vue/reactivity        # 响应式系统（独立包）
├── ref                # ref 实现
├── reactive           # reactive 实现
├── computed           # computed 实现
└── effect             # effect 追踪

@vue/runtime-dom       # DOM 运行时
├── nodeOps            # DOM 操作
├─ patchProp           # 属性更新
└─ modules             # 事件、样式等模块

@vue/compiler-core     # 编译器核心
├── parse              # 模板解析
├── transform          # 转换
└── codegen            # 代码生成

@vue/compiler-dom      # DOM 编译器
└── transforms         # DOM 特定转换
```

### 1.2 渲染流程

```
模板字符串
    ↓
parse (解析)
    ↓
AST (抽象语法树)
    ↓
transform (转换)
    ↓
优化后的 AST
    ↓
generate (生成)
    ↓
render 函数
    ↓
执行 render 函数
    ↓
VNode (虚拟节点树)
    ↓
patch (对比更新)
    ↓
真实 DOM
```

### 1.3 响应式数据流

```
用户交互 / 数据变化
    ↓
触发 setter / ref.value = newValue
    ↓
track (收集依赖)
    ↓
trigger (触发更新)
    ↓
scheduler (调度)
    ↓
queueJob (加入队列)
    ↓
flushJobs (批量执行)
    ↓
重新渲染组件
    ↓
patch 更新 DOM
```

---

## 二、响应式系统

### 2.1 Proxy vs Object.defineProperty

**Vue 2 的局限性**：

```javascript
// Vue 2: 无法检测以下变化
const obj = {}
obj.newProp = 'value' // ❌ 无法检测新增属性

const arr = []
arr[0] = 'value' // ❌ 无法检测数组索引修改
arr.length = 0 // ❌ 无法检测长度变化
```

**Vue 3 的解决方案**：

```javascript
// Vue 3: 使用 Proxy
const handler = {
  get(target, key, receiver) {
    track(target, key) // 收集依赖
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key) // 触发更新
    return result
  },
  deleteProperty(target, key) {
    const result = Reflect.deleteProperty(target, key)
    trigger(target, key) // 触发更新
    return result
  },
}

const proxy = new Proxy(obj, handler)
proxy.newProp = 'value' // ✅ 可以检测
delete proxy.prop // ✅ 可以检测
```

### 2.2 reactive 实现原理

```typescript
// 简化的 reactive 实现
function reactive(target: object) {
  // 如果已经是响应式对象，直接返回
  if (target && (target as any)[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 检查是否已存在代理
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 只有特定类型可以被代理
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }

  // 创建 Proxy
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION
      ? collectionHandlers // Map/Set 处理器
      : baseHandlers, // 普通对象处理器
  )

  proxyMap.set(target, proxy)
  return proxy
}
```

**baseHandlers 核心逻辑**：

```typescript
const get = createGetter()
const set = createSetter()

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }

    const res = Reflect.get(target, key, receiver)

    // 不是只读且不是浅层响应式
    if (!isReadonly && !shallow) {
      if (isRef(res)) {
        // ref 在 reactive 中需要解包
        return res.value
      } else if (isObject(res)) {
        // 嵌套对象自动转为响应式
        return reactive(res)
      }
    }

    // 收集依赖
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    return res
  }
}

function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object,
  ): boolean {
    let oldValue = (target as any)[key]

    if (!shallow) {
      value = toRaw(value)
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    }

    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)

    // 触发更新
    if (!hadKey) {
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }

    return result
  }
}
```

### 2.3 ref 实现原理

```typescript
class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined
  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly _shallow: boolean,
  ) {
    this._rawValue = _shallow ? value : toRaw(value)
    this._value = _shallow ? value : convert(value)
  }

  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    newVal = this._shallow ? newVal : toRaw(newVal)
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = this._shallow ? newVal : convert(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}

function ref<T>(value: T): Ref<UnwrapRef<T>> {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}
```

**ref 与 reactive 的区别**：

- `ref`: 包装基本类型或对象，通过 `.value` 访问
- `reactive`: 只能包装对象，直接访问属性
- `ref` 在模板中自动解包，`reactive` 不会

### 2.4 依赖追踪系统（Effect）

```typescript
// 依赖存储结构
type Dep = Map<any, Set<ReactiveEffect>>

// 全局状态
let activeEffect: ReactiveEffect | undefined
const targetMap = new WeakMap<object, Dep>()  // target -> key -> effects

// 依赖收集
function track(target: object, type: TrackOpTypes, key: unknown) {
  if (activeEffect === undefined) {
    return  // 没有活动的 effect，不收集
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep mep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)  // 反向引用，便于清理
  }
}

// 触发更新
function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return  // 没有被追踪过
  }

  const effects = new Set<ReactiveEffect>()

  // 收集需要执行的 effects
  if (key !== void 0) {
    const dep95,10 @@
  }

  // 执行 effects
  const run = (effect: ReactiveEffect) => {
    if (effect.scheduler) {
      effect.scheduler(effect)  // 有调度器，交给调度器
    } else {
      effect.run()  // 直接执行
    }
  }

  effects.forEach(run)
}
```

### 2.5 computed 实现原理

```typescript
class ComputedRefImpl<T> {
  public dep?: Dep = undefined
  public readonly effect: ReactiveEffect

  private _value!: T
  private _dirty = true // 是否需要重新计算

  constructor(
    getter: ComputedGetter<T>,
    private readonly _setter: ComputedSetter<T>,
  ) {
    // 创建 effect，带有 scheduler
    this.effect = new ReactiveEffect(getter, () => {
      // scheduler: 标记为 dirty，但不立即执行
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this) // 通知依赖此 computed 的 effect
      }
    })
  }

  get value() {
    // 收集依赖（谁在使用这个 computed）
    trackRefValue(this)

    // 如果是 dirty，重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()!
    }

    return this._value
  }

  set value(newValue: T) {
    this._setter(newValue)
  }
}

function computed<T>(getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
```

**computed 的惰性求值**：

```javascript
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 第一次访问，执行 getter，缓存结果
console.log(doubleCount.value) // 0，执行了 getter

// count 变化，标记为 dirty，但不立即执行
count.value++

// 第二次访问，发现是 dirty，重新执行 getter
console.log(doubleCount.value) // 2，重新执行了 getter

// 第三次访问，不是 dirty，直接返回缓存
console.log(doubleCount.value) // 2，没有执行 getter
```

### 2.6 watch 和 watchEffect

```typescript
function watchEffect(source: EffectScheduler, options?: WatchEffectOptions): StopHandle {
  return doWatch(source, cb, { ...options, immediate: true })
}

function watch(
  source: WatchSource | WatchSource[] | WatchEffect,
  cb: WatchCallback,
  options?: WatchOptions,
): StopHandle {
  return doWatch(source, cb, options)
}

function doWatch(source, cb, options) {
  let getter: () => any
  let forceTrigger = false

  if (isRef(source)) {
    getter = () => source.value
    forceTrigger = isShallow(source)
  } else if (isReactive(source)) {
    getter = () => source
    forceTrigger = true
  } else if (isArray(source)) {
    getter = () =>
      source.map((s) => {
        if (isRef(s)) return s.value
        if (isReactive(s)) return traverse(s)
        if (isFunction(s)) return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)
      })
  } else if (isFunction(source)) {
    if (cb) {
      // watch with getter
      getter = () => callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)
    } else {
      // watchEffect
      getter = () => {
        cleanup()
        return callWithAsyncErrorHandling(source, instance, ErrorCodes.WATCH_CALLBACK, [onCleanup])
      }
    }
  }

  // 创建 scheduler
  const scheduler = () => {
    if (cb) {
      // watch: 将回调加入队列
      queueJob(job)
    } else {
      // watchEffect: 重新运行 effect
      effect.run()
    }
  }

  // 创建 effect
  const effect = new ReactiveEffect(getter, scheduler)

  // 立即执行（immediate）
  if (cb) {
    if (options.immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  // 返回停止函数
  return () => {
    effect.stop()
  }
}
```

**watch vs watchEffect**：

- `watch`: 需要指定监听的源和回调，惰性执行
- `watchEffect`: 自动追踪依赖，立即执行，适合副作用

---

## 三、虚拟 DOM 与渲染机制

### 3.1 VNode 结构

```typescript
interface VNode {
  __v_isVNode: true
  type: VNodeTypes // 元素类型（string | Component）
  props: (Data & VNodeProps) | null // 属性
  key: string | number | symbol | null // key
  ref: VNodeRef | null // ref
  scopeId: string | null // scoped CSS ID
  slotScopeIds: string[] | null // slot scope IDs
  children: VNodeNormalizedChildren // 子节点
  component: ComponentInternalInstance | null // 组件实例
  suspense: SuspenseBoundary | null // Suspense 边界
  ssContent: VNode | null // SSR 内容
  ssFallback: VNode | null // SSR fallback
  shapeFlag: number // 形状标志（优化用）
  dynamicProps: string[] | null // 动态属性
  dynamicChildren: VNode[] | null // 动态子节点
  appContext: AppContext | null // 应用上下文
}

// 形状标志（位运算优化）
export const enum ShapeFlags {
  ELEMENT = 1, // 普通元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数组件
  STATEFUL_COMPONENT = 1 << 2, // 有状态组件
  TEXT_CHILDREN = 1 << 3, // 文本子节点
  ARRAY_CHILDREN = 1 << 4, // 数组子节点
  SLOTS_CHILDREN = 1 << 5, // slot 子节点
  TELEPORT = 1 << 6, // Teleport
  SUSPENSE = 1 << 7, // Suspense
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // KeepAlive
  COMPONENT_KEPT_ALIVE = 1 << 9, // KeepAlive 保持
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}
```

### 3.2 创建 VNode

```typescript
function createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: PatchFlags = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false,
): VNode {
  // 处理组件
  if (isClassComponent(type)) {
    type = type.__vccOpts
  }

  // 合并 class 和 style
  if (props) {
    props = guardReactiveProps(props)
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style)
      }
      props.style = normalizeStyle(style)
    }
  }

  // 编码形状标志
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : __FEATURE_SUSPENSE__ && isSuspense(type)
      ? ShapeFlags.SUSPENSE
      : isTeleport(type)
        ? ShapeFlags.TELEPORT
        : isObject(type)
          ? ShapeFlags.STATEFUL_COMPONENT
          : isFunction(type)
            ? ShapeFlags.FUNCTIONAL_COMPONENT
            : 0

  const vnode: VNode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
  }

  // 标准化子节点
  normalizeChildren(vnode, children, shapeFlag)

  return vnode
}
```

### 3.3 渲染器（Renderer）

```typescript
function createRenderer(options: RendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    cloneNode: hostCloneNode,
    insertStaticContent: hostInsertStaticContent
  } = options

  // 核心 patch 函数
  const patch: PatchFn = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null = null,
    parentComponent: ComponentInternalInstance | null = null,
    parentSuspense: SuspenseBoundary | null = null,
    isSVG = false,
    slotScopeIds: string[] | null = null,
    optimized = false
  ) => {
    // 如果新旧节点类型不同，卸载旧节点
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1)
      unmount(n1, parentComponent, parentSuspense, true)
      n1 = null
    }

    const { type, ref, shapeFlag } = n2

    switch (type) {
      case Text:
        processText(n1, n2, container, anchor)
        break
      case Comment:
        processCommentNode(n1, n2, container, anchor)
        break
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, isSVG)
        } else {
          patchStaticNode(n1, n2, container, isSVG)
        }
        break
      case Fragment:
        processFragment(...)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(...)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(...)
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          ;(type as typeof Teleport).process(...)
        } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
          ;(type as typeof Suspense).process(...)
        }
    }

    // 设置 ref
    if (ref != null && parentComponent) {
      setRef(ref, n1 && n1.ref, parentComponent, n2)
    }
  }

  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  }
}
```

### 3.4 Element 的 Patch 过程

```typescript
const processElement = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean
) => {
  if (n1 == null) {
    // 挂载
    mountElement(
      n2,
      container,
      anchor,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    )
  } else {
    // 更新
    patchElement(
      n1,
      n2,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    )
  }
}

function mountElement(...) {
  const { type, props, shapeFlag } = vnode

  // 创建 DOM 元素
  const el = (vnode.el = hostCreateElement(
    type as string,
    isSVG,
    props && props.is,
    props
  ))

  // 挂载子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    hostSetElementText(el, vnode.children as string)
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(
      vnode.children as VNodeArrayChildren,
      el,
      null,
      parentComponent,
      parentSuspense,
      resolveChildrenSlotScopeIds(vnode, slotScopeIds),
      optimized
    )
  }

  // 设置属性
  if (props) {
    for (const key in props) {
      if (!isReservedProp(key)) {
        hostPatchProp(el, key, null, props[key], isSVG, ...)
      }
    }
  }

  // 插入到容器
  hostInsert(el, container, anchor)
}
```

### 3.5 Diff 算法

Vue 3 使用改进的双端比较算法：

```typescript
function patchKeyedChildren(
  c1: VNode[],
  c2: VNodeArrayChildren,
  container: RendererElement,
  parentAnchor: RendererNode | null,
  parentComponent: ComponentInternalInstance | null,
  parentSuspense: SuspenseBoundary | null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1
  let e2 = l2 - 1

  // 1. 从头部开始比较
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i]))

    if (isSameVNodeType(n1, n2)) {
      patch(
        n1,
        n2,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
      )
    } else {
      break
    }
    i++
  }

  // 2. 从尾部开始比较
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1]
    const n2 = (c2[e2] = optimized ? cloneIfMounted(c2[e2] as VNode) : normalizeVNode(c2[e2]))

    if (isSameVNodeType(n1, n2)) {
      patch(
        n1,
        n2,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
      )
    } else {
      break
    }
    e1--
    e2--
  }

  // 3. 常见情况：新节点比旧节点多（新增）
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1
      const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor
      while (i <= e2) {
        patch(
          null,
          (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i])),
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        )
        i++
      }
    }
  }
  // 4. 常见情况：旧节点比新节点多（删除）
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i], parentComponent, parentSuspense, true)
      i++
    }
  }
  // 5. 未知情况：中间部分需要移动
  else {
    const s1 = i
    const s2 = i

    // 构建新节点的 key -> index 映射
    const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
    for (i = s2; i <= e2; i++) {
      const nextChild = (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i]))
      if (nextChild.key != null) {
        keyToNewIndexMap.set(nextChild.key, i)
      }
    }

    let j
    let patched = 0
    const toBePatched = e2 - s2 + 1
    let moved = false
    let maxNewIndexSoFar = 0

    // 用于 LIS（最长递增子序列）算法
    const newIndexToOldIndexMap = new Array(toBePatched)
    for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

    // 遍历旧节点，尝试 patch 或 unmount
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i]

      if (patched >= toBePatched) {
        // 所有新节点都已 patch，剩余的旧节点 unmount
        unmount(prevChild, parentComponent, parentSuspense, true)
        continue
      }

      let newIndex
      if (prevChild.key != null) {
        newIndex = keyToNewIndexMap.get(prevChild.key)
      } else {
        // 无 key，尝试找到相同类型的节点
        for (j = s2; j <= e2; j++) {
          if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j] as VNode)) {
            newIndex = j
            break
          }
        }
      }

      if (newIndex === undefined) {
        // 找不到对应的新节点，unmount
        unmount(prevChild, parentComponent, parentSuspense, true)
      } else {
        // 记录旧索引到新索引的映射
        newIndexToOldIndexMap[newIndex - s2] = i + 1

        // 跟踪最大索引，判断是否移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }

        // patch 节点
        patch(
          prevChild,
          c2[newIndex] as VNode,
          container,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        )
        patched++
      }
    }

    // 6. 移动和挂载新节点
    const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR

    j = increasingNewIndexSequence.length - 1

    // 从后往前遍历，避免频繁移动 DOM
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i
      const nextChild = c2[nextIndex] as VNode
      const anchor = nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor

      if (newIndexToOldIndexMap[i] === 0) {
        // 新节点，需要挂载
        patch(
          null,
          nextChild,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        )
      } else if (moved) {
        // 需要移动
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          move(nextChild, container, anchor, MoveType.REORDER)
        } else {
          j--
        }
      }
    }
  }
}
```

**LIS 算法（最长递增子序列）**：

```typescript
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }

  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}
```

---

## 四、编译优化

### 4.1 静态提升（Static Hoisting）

**优化前**：

```javascript
// 每次渲染都创建新的 VNode
render() {
  return h('div', [
    h('span', 'Static'),  // 每次都创建
    h('span', this.msg)   // 动态内容
  ])
}
```

**优化后**：

```javascript
// 静态节点被提升到渲染函数外部
const _hoisted_1 = h('span', 'Static')

render() {
  return h('div', [
    _hoisted_1,              // 复用
    h('span', this.msg)      // 动态内容
  ])
}
```

### 4.2 Patch Flags

```typescript
export const enum PatchFlags {
  TEXT = 1, // 动态文本内容
  CLASS = 1 << 1, // 动态 class
  STYLE = 1 << 2, // 动态 style
  PROPS = 1 << 3, // 动态 props（不含 class/style）
  FULL_PROPS = 1 << 4, // 动态 props（含 class/style，key 可能变化）
  HYDRATE_EVENTS = 1 << 5, // 包含事件监听器
  STABLE_FRAGMENT = 1 << 6, // 子节点顺序不变的 Fragment
  KEYED_FRAGMENT = 1 << 7, // 部分子节点有 key 的 Fragment
  UNKEYED_FRAGMENT = 1 << 8, // 子节点无 key 的 Fragment
  NEED_PATCH = 1 << 9, // 只需要非 props 的 patch（如 ref、directives）
  DYNAMIC_SLOTS = 1 << 10, // 动态 slots
  HOISTED = -1, // 静态节点，跳过 diff
  BAIL = -2, // 优化 bailout
}
```

**使用示例**：

```javascript
// 只有文本是动态的
h('div', { id: 'app' }, [
  h('span', this.msg), // PatchFlags.TEXT
])

// 只有 class 是动态的
h('div', { class: this.className }) // PatchFlags.CLASS

// 只有 style 是动态的
h('div', { style: this.style }) // PatchFlags.STYLE

// 多个动态 props
h('div', { id: this.id, class: this.className }) // PatchFlags.PROPS
```

### 4.3 块树（Block Tree）

**传统 Virtual DOM 的问题**：

- 需要遍历整棵树进行 diff
- 即使大部分节点是静态的

**Block Tree 优化**：

```javascript
// 编译器将模板转换为带 block 的代码
import {
  createVNode as _createVNode,
  openBlock as _openBlock,
  createBlock as _createBlock,
} from 'vue'

export function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (
    _openBlock(),
    _createBlock('div', null, [
      _createVNode('span', null, 'Static'), // 静态节点
      _createVNode('span', null, _toDisplayString(_ctx.msg), 1 /* TEXT */), // 动态节点
    ])
  )
}
```

**Block 的作用**：

- Block 是一个特殊的 VNode，收集所有动态后代节点
- Patch 时只比较动态节点，跳过静态节点
- 大幅减少 diff 的节点数量

### 4.4 缓存事件处理函数

```javascript
// 优化前：每次渲染创建新函数
render() {
  return h('button', {
    onClick: () => this.handleClick()  // 新函数引用
  })
}

// 优化后：缓存函数
const _cache = {}

render() {
  return h('button', {
    onClick: _cache[0] || (_cache[0] = () => this.handleClick())
  })
}
```

### 4.5 v-once 和 v-memo

**v-once**：

```html
<!-- 只渲染一次，之后跳过更新 -->
<div v-once>{{ expensiveComputation }}</div>
```

**v-memo**（Vue 3.2+）：

```html
<!-- 只有当依赖变化时才重新渲染 -->
<div v-memo="[item.id]">{{ item.name }}</div>

<!-- 等同于 -->
<div>{{ item.name }}</div>

<!-- 编译器生成 -->
_vMemo([item.id], () => { return h('div', item.name) })
```

---

## 五、Composition API 实现原理

### 5.1 setup 执行时机

```typescript
function setupComponent(
  instance: ComponentInternalInstance,
  parentSuspense: SuspenseBoundary | null,
) {
  const { setup } = instance.type

  if (setup) {
    const setupContext = (instance.setupContext =
      setup.length > 1 ? createSetupContext(instance) : null)

    // 设置当前实例
    setCurrentInstance(instance)
    pauseTracking() // 暂停依赖收集

    const setupResult = callWithErrorHandling(setup, instance, ErrorCodes.SETUP_FUNCTION, [
      instance.props,
      setupContext,
    ])

    resetTracking() // 恢复依赖收集
    unsetCurrentInstance()

    if (isPromise(setupResult)) {
      // 异步 setup
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance)

      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult, parentSuspense)
        })
      } else {
        instance.asyncDep = setupResult
      }
    } else {
      // 同步 setup
      handleSetupResult(instance, setupResult, parentSuspense)
    }
  } else {
    finishComponentSetup(instance, parentSuspense)
  }
}
```

### 5.2 响应式数据的暴露

```typescript
function handleSetupResult(
  instance: ComponentInternalInstance,
  setupResult: unknown,
  parentSuspense: SuspenseBoundary | null,
) {
  if (isFunction(setupResult)) {
    // setup 返回渲染函数
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    // setup 返回对象，设置为组件实例的暴露属性
    instance.setupState = proxyRefs(setupResult)
  } else if (setupResult !== undefined) {
    warn(`setup() should return an object or a function, but got ${typeof setupResult}`)
  }

  finishComponentSetup(instance, parentSuspense)
}

// 将 setup 返回的对象代理到组件实例
function proxyRefs(objectWithRefs: any) {
  return isReactive(objectWithRefs)
    ? objectWithRefs
    : new Proxy(objectWithRefs, {
        get(target, key, receiver) {
          const value = Reflect.get(target, key, receiver)
          return isRef(value) ? value.value : value
        },
        set(target, key, value, receiver) {
          const oldValue = target[key]
          if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value
            return true
          } else {
            return Reflect.set(target, key, value, receiver)
          }
        },
      })
}
```

### 5.3 getCurrentInstance

```typescript
let currentInstance: ComponentInternalInstance | null = null

export function getCurrentInstance(): ComponentInternalInstance | null {
  return currentInstance
}

export function setCurrentInstance(instance: ComponentInternalInstance) {
  currentInstance = instance
}

export function unsetCurrentInstance() {
  currentInstance = null
}

// 在 setup 执行期间设置
function setupComponent(instance) {
  setCurrentInstance(instance)
  const result = setup(props, context)
  unsetCurrentInstance()
  return result
}

// Hooks 内部使用
function useFeature() {
  const instance = getCurrentInstance()
  if (!instance) {
    warn(`useFeature must be called in setup()`)
  }
  // 使用 instance...
}
```

### 5.4 toRef 和 toRefs

```typescript
function toRef<T extends object, K extends keyof T>(object: T, key: K): ToRef<T[K]> {
  const val = object[key]
  return isRef(val) ? val : (new ObjectRefImpl(object, key) as any)
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true

  constructor(
    private readonly _object: T,
    private readonly _key: K,
  ) {}

  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}

function toRefs<T extends object>(object: T): ToRefs<T> {
  const ret: any = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}
```

**使用场景**：

```javascript
// props 解构会失去响应性
const { name } = props // ❌ 不是响应式的

// 使用 toRefs 保持响应性
const { name } = toRefs(props) // ✅ 响应式的 ref

// 或者使用 toRef
const name = toRef(props, 'name') // ✅ 响应式的 ref
```

---

## 六、组件系统

### 6.1 组件实例

```typescript
interface ComponentInternalInstance {
  uid: number // 唯一 ID
  type: ConcreteComponent // 组件类型
  parent: ComponentInternalInstance | null // 父组件
  root: ComponentInternalInstance // 根组件
  appContext: AppContext // 应用上下文

  vnode: VNode // 当前 VNode
  subTree: VNode // 子树 VNode
  effect: ReactiveEffect // 渲染 effect
  update: SchedulerJob // 更新函数

  scope: EffectScope // 作用域
  render: Function | null // 渲染函数
  setupState: any // setup 返回的状态
  data: any // data 选项
  props: any // props
  attrs: any //  attrs
  slots: InternalSlots // slots
  refs: any // refs
  emit: (event: string, ...args: unknown[]) => void // emit 函数

  isMounted: boolean // 是否已挂载
  isUnmounted: boolean // 是否已卸载
  isDeactivated: boolean // 是否被停用（KeepAlive）

  lifecycleHooks: {
    [key: string]: Function[] // 生命周期钩子
  }

  provides: any // provide 的数据
  ids: [string, number, number] // 用于 provide/inject
}
```

### 6.2 组件挂载流程

```typescript
const mountComponent: MountComponentFn = (
  initialVNode,
  container,
  anchor,
  parentComponent,
  parentSuspense,
  isSVG,
  optimized,
) => {
  // 1. 创建组件实例
  const instance = (initialVNode.component = createComponentInstance(
    initialVNode,
    parentComponent,
    parentSuspense,
  ))

  // 2. 设置组件实例
  setupComponent(instance)

  // 3. 设置渲染 effect
  setupRenderEffect(instance, parentSuspense, optimized)
}

function setupRenderEffect(instance: ComponentInternalInstance, parentSuspense, optimized) {
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // 首次挂载
      const { bm, m, parent } = instance

      // beforeMount
      invokeArrayFns(bm)

      // 渲染子树
      const subTree = (instance.subTree = renderComponentRoot(instance))

      // 挂载子树
      patch(null, subTree, container, anchor, instance, parentSuspense, isSVG)

      // mounted
      invokeArrayFns(m)

      instance.isMounted = true
    } else {
      // 更新
      const { next, bu, u, parent } = instance

      // beforeUpdate
      invokeArrayFns(bu)

      // 渲染新的子树
      const nextTree = renderComponentRoot(instance)
      const prevTree = instance.subTree

      // 保存旧子树
      instance.subTree = nextTree

      // patch 对比
      patch(prevTree, nextTree, container, anchor, instance, parentSuspense, isSVG)

      // updated
      invokeArrayFns(u)
    }
  }

  // 创建 effect
  const effect = (instance.effect = new ReactiveEffect(
    componentUpdateFn,
    () => queueJob(instance.update), // scheduler
    instance.scope,
  ))

  // 更新函数
  const update = (instance.update = () => effect.run())
  update.id = instance.uid
}
```

### 6.3 组件更新优化

```typescript
function shouldUpdateComponent(prevVNode: VNode, nextVNode: VNode, optimized?: boolean): boolean {
  const { props: prevProps, children: prevChildren } = prevVNode
  const { props: nextProps, children: nextChildren } = nextVNode

  // children 变化，需要更新
  if (prevChildren || nextChildren) {
    if (optimized) {
      return true
    }
    return true
  }

  // props 没有变化，不需要更新
  if (prevProps === nextProps) {
    return false
  }

  // props 都为空，不需要更新
  if (!prevProps && !nextProps) {
    return false
  }

  // 比较 props
  if (!prevProps || !nextProps) {
    return true
  }

  // 逐个比较 props
  for (const key in nextProps) {
    if (key === '$children') continue
    if (nextProps[key] !== prevProps[key]) {
      return true
    }
  }

  for (const key in prevProps) {
    if (key === '$children') continue
    if (!(key in nextProps)) {
      return true
    }
  }

  return false
}
```

### 6.4 异步组件

```typescript
function defineAsyncComponent(asyncSrc: AsyncComponentLoader) {
  let Comp: Component | undefined
  let retry: (() => void) | undefined

  const asyncComp = {
    __asyncLoader: () => {
      if (!Comp) {
        const promise = asyncSrc()

        return promise.then((resolved: any) => {
          Comp = isFunction(resolved) ? resolved : resolved.default
          return Comp
        })
      }
      return Promise.resolve(Comp)
    },

    setup() {
      const instance = currentInstance

      // 加载组件
      const load = () => {
        return asyncComp.__asyncLoader().then((comp) => {
          instance.type = comp
          instance.update()
        })
      }

      // 首次加载
      load()

      // 返回一个占位组件
      return () => {
        if (Comp) {
          return createVNode(Comp)
        } else {
          return createVNode('div', 'Loading...')
        }
      }
    },
  }

  return asyncComp
}

// 使用
const AsyncComp = defineAsyncComponent(() => import('./MyComponent.vue'))
```

---

## 七、依赖注入与 Provide/Inject

### 7.1 Provide 实现

```typescript
export function provide<T>(key: InjectionKey<T> | string, value: T) {
  if (!currentInstance) {
    warn(`provide() can only be used inside setup().`)
  } else {
    let provides = currentInstance.provides

    // 继承父组件的 provides
    const parentProvides = currentInstance.parent?.provides
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key as string] = value
  }
}
```

### 7.2 Inject 实现

```typescript
export function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue?: T | (() => T),
  treatDefaultAsFactory = false,
): T | undefined {
  const instance = currentInstance || currentRenderingInstance

  if (instance) {
    const provides = instance.parent?.provides

    if (provides && (key as string | symbol) in provides) {
      return provides[key as string]
    } else if (arguments.length > 1) {
      // 有默认值
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(instance.proxy)
        : defaultValue
    } else {
      warn(`Injection "${String(key)}" not found.`)
    }
  }
}
```

### 7.3 原型链继承

```javascript
// provides 的结构
parent.provides = {
  theme: 'dark',
  locale: 'zh-CN',
}

child.provides = Object.create(parent.provides)
child.provides = {
  __proto__: parent.provides,
  user: { name: 'John' },
}

// 查找时沿原型链向上
inject('theme') // 'dark' (从 parent 继承)
inject('user') // { name: 'John' } (自己的)
```

---

## 八、生命周期钩子

### 8.1 生命周期注册

```typescript
export function onBeforeMount(fn: () => void) {
  registerHook('bm', fn)
}

export function onMounted(fn: () => void) {
  registerHook('m', fn)
}

export function onBeforeUpdate(fn: () => void) {
  registerHook('bu', fn)
}

export function onUpdated(fn: () => void) {
  registerHook('u', fn)
}

export function onBeforeUnmount(fn: () => void) {
  registerHook('bum', fn)
}

export function onUnmounted(fn: () => void) {
  registerHook('um', fn)
}

function registerHook(lifecycle: LifecycleHooks, hook: Function) {
  const target = currentInstance || currentRenderingInstance
  if (target) {
    const hooks = target[lifecycle] || (target[lifecycle] = [])

    // 将 hook 包装，确保在当前实例上下文中执行
    const wrappedHook = hook.bind(target.proxy)
    hooks.push(wrappedHook)
  }
}
```

### 8.2 生命周期执行

```typescript
function invokeArrayFns(fns: Function[], arg?: any) {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg)
  }
}

// 在适当的时机调用
function mountComponent(...) {
  // beforeMount
  invokeArrayFns(instance.bm)

  // ... 挂载 ...

  // mounted
  invokeArrayFns(instance.m)
}

function updateComponent(...) {
  // beforeUpdate
  invokeArrayFns(instance.bu)

  // ... 更新 ...

  // updated
  invokeArrayFns(instance.u)
}

function unmountComponent(...) {
  // beforeUnmount
  invokeArrayFns(instance.bum)

  // ... 卸载 ...

  // unmounted
  invokeArrayFns(instance.um)
}
```

### 8.3 生命周期映射

| Vue 2 Options API | Vue 3 Composition API | 说明       |
| ----------------- | --------------------- | ---------- |
| beforeCreate      | setup()               | 组件创建前 |
| created           | setup()               | 组件创建后 |
| beforeMount       | onBeforeMount         | 挂载前     |
| mounted           | onMounted             | 挂载后     |
| beforeUpdate      | onBeforeUpdate        | 更新前     |
| updated           | onUpdated             | 更新后     |
| beforeDestroy     | onBeforeUnmount       | 销毁前     |
| destroyed         | onUnmounted           | 销毁后     |
| errorCaptured     | onErrorCaptured       | 错误捕获   |
| -                 | onRenderTracked       | 追踪依赖   |
| -                 | onRenderTriggered     | 触发更新   |

---

## 九、Teleport 和 Suspense

### 9.1 Teleport 实现

```typescript
const Teleport = {
  __isTeleport: true,

  process(
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
    internals: RendererInternals,
  ) {
    const {
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      o: { insert, querySelector, createText, createComment },
    } = internals

    const disabled = n2.props && n2.props.disabled

    if (n1 == null) {
      // 挂载
      const target = (n2.target = isString(n2.props?.to)
        ? querySelector(n2.props.to)
        : n2.props?.to)

      if (target) {
        // 创建锚点注释
        const placeholder = (n2.el = createText(''))
        const anchor = (n2.anchor = createText(''))

        insert(placeholder, container, anchor)
        insert(anchor, container, anchor)

        // 挂载子节点到目标位置
        mountChildren(
          n2.children as VNode[],
          target,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        )
      }
    } else {
      // 更新
      const target = (n2.target = n1.target)

      if (disabled) {
        // 禁用时，移回原位置
        // ...
      } else {
        // 正常更新
        patchChildren(
          n1,
          n2,
          target,
          null,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        )
      }
    }
  },

  remove(
    vnode,
    parentComponent,
    parentSuspense,
    optimized,
    { um: unmount, o: { remove: hostRemove } },
  ) {
    const { el, anchor } = vnode
    hostRemove(el)
    hostRemove(anchor)
    unmount(vnode.children, parentComponent, parentSuspense, true, optimized)
  },
}
```

### 9.2 Suspense 实现

```typescript
const Suspense = {
  __isSuspense: true,

  process(
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
    internals: RendererInternals
  ) {
    if (n1 == null) {
      mountSuspense(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals)
    } else {
      patchSuspense(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals)
    }
  }
}

function mountSuspense(...) {
  const {
    o: { createElement },
    mc: mountChildren,
    pbc: patchBlockChildren
  } = internals

  const suspense = (n2.suspense = createSuspenseBoundary(
    n2,
    parentSuspense,
    parentComponent,
    container,
    isSVG,
    slotScopeIds,
    optimized,
    internals
  ))

  // 挂载 fallback
  mountChildren(
    n2.fallbackChildren as VNode[],
    container,
    anchor,
    parentComponent,
    suspense,
    isSVG,
    slotScopeIds,
    optimized
  )

  // 尝试挂载主内容
  const mainContent = n2.defaultChildren as VNode[]
  let hasAsyncContent = false

  for (let i = 0; i < mainContent.length; i++) {
    if (mainContent[i].suspense) {
      hasAsyncContent = true
    }
  }

  if (hasAsyncContent) {
    // 有异步内容，等待解决
    suspense.pendingBranch = mainContent
  } else {
    // 没有异步内容，直接挂载
    mountChildren(
      mainContent,
      container,
      anchor,
      parentComponent,
      suspense,
      isSVG,
      slotScopeIds,
      optimized
    )
    suspense.isResolved = true
  }
}

function createSuspenseBoundary(...) {
  const boundary: SuspenseBoundary = {
    vnode,
    parent: parentSuspense,
    parentComponent,
    isSVG,
    container,
    hiddenContainer,
    anchor,
    deps: 0,              // 依赖计数
    pendingId: 0,         // pending ID
    timeout: -1,          // 超时时间
    pendingBranch: null,  // 正在等待的分支
    isResolved: false,    // 是否已解决
    isUnmounted: false,
    effects: [],

    resolve(resume = false) {
      const { vnode, pendingBranch } = boundary

      if (pendingBranch) {
        boundary.pendingBranch = null

        // 移除 fallback
        // ...

        // 挂载主内容
        mountChildren(
          pendingBranch,
          container,
          anchor,
          parentComponent,
          boundary,
          isSVG,
          slotScopeIds,
          optimized
        )

        boundary.isResolved = true

        // 触发 resolve 钩子
        // ...
      }
    },

    fallback(fallbackVNode) {
      if (!boundary.pendingBranch) {
        return
      }

      // 显示 fallback 内容
      // ...
    }
  }

  return boundary
}
```

---

## 十、性能优化机制

### 10.1 调度器（Scheduler）

```typescript
const queue: SchedulerJob[] = []
const p = Promise.resolve()
let isFlushPending = false

function nextTick(fn?: () => void): Promise<void> {
  return fn ? p.then(fn) : p
}

function queueJob(job: SchedulerJob) {
  if (!queue.length || !queue.includes(job, isFlushing ? flushIndex + 1 : flushIndex)) {
    queue.push(job)
  }
  queueFlush()
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    nextTick(flushJobs)
  }
}

function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true

  // 排序：先父后子，先 computed 后 watcher
  queue.sort((a, b) => getId(a) - getId(b))

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job && job.active !== false) {
        callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
      }
    }
  } finally {
    flushIndex = 0
    queue.length = 0
    isFlushing = false
  }
}
```

**批处理优势**：

- 多次状态变化合并为一次更新
- 避免不必要的中间状态渲染
- 保证更新的顺序性

### 10.2 KeepAlive 缓存

```typescript
const KeepAlive = {
  __isKeepAlive: true,

  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: [String, Number],
  },

  setup(props: KeepAliveProps, { slots }: SetupContext) {
    const instance = getCurrentInstance()!
    const sharedContext = instance.ctx as KeepAliveContext

    // 缓存 Map
    const cache: Cache = new Map()
    const keys: Keys = new Set()

    let current: VNode | null = null

    return () => {
      const vnode = slots.default?.()

      if (!vnode || vnode.length !== 1) {
        return vnode
      }

      const child = vnode[0]

      // 检查是否应该缓存
      if (shouldCache(child, props.include, props.exclude)) {
        const key = getKey(child)

        if (cache.has(key)) {
          // 从缓存获取
          const cached = cache.get(key)!
          child.component = cached.component
          child.el = cached.el
          child.component.vnode = child
        } else {
          // 添加到缓存
          cache.set(key, child)
          keys.add(key)

          // 限制缓存数量
          if (props.max && keys.size > parseInt(props.max as string, 10)) {
            pruneCacheEntry(cache, keys, Array.from(keys)[0])
          }
        }

        child.keptAlive = true
      }

      return child
    }
  },
}

function shouldCache(
  vnode: VNode,
  include: MatchPattern | undefined,
  exclude: MatchPattern | undefined,
): boolean {
  const { name } = vnode.type as ComponentOptions

  if (!name) {
    return false
  }

  if (include && !matches(include, name)) {
    return false
  }

  if (exclude && matches(exclude, name)) {
    return false
  }

  return true
}
```

### 10.3 懒加载与代码分割

```javascript
// 路由级别的代码分割
const routes = [
  {
    path: '/home',
    component: () => import('./views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('./views/About.vue'),
  },
]

// 组件级别的懒加载
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// 条件加载
const ConditionalComponent = defineAsyncComponent(() =>
  showCondition ? import('./ComponentA.vue') : import('./ComponentB.vue'),
)
```

### 10.4 虚拟滚动

```javascript
// 使用 vue-virtual-scroller
import { RecycleScroller } from 'vue-virtual-scroller'

<RecycleScroller
  :items="items"
  :item-size="50"
  key-field="id"
  v-slot="{ item }"
>
  <div class="item">{{ item.name }}</div>
</RecycleScroller>
```

**原理**：

- 只渲染可视区域的 DOM 节点
- 根据滚动位置动态更新内容
- 大幅减少 DOM 节点数量

### 10.5 防抖与节流

```javascript
import { ref, watch } from 'vue'
import { debounce, throttle } from 'lodash-es'

// 防抖搜索
const searchQuery = ref('')
const debouncedSearch = debounce((query) => {
  // 执行搜索
}, 300)

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery)
})

// 节流滚动处理
const scrollPosition = ref(0)
const throttledScroll = throttle((e) => {
  scrollPosition.value = e.target.scrollTop
}, 100)

onMounted(() => {
  window.addEventListener('scroll', throttledScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledScroll)
})
```

### 10.6 内存泄漏预防

```javascript
// 清理事件监听器
onMounted(() => {
  const handler = () => {
    /* ... */
  }
  window.addEventListener('resize', handler)

  onUnmounted(() => {
    window.removeEventListener('resize', handler)
  })
})

// 清理定时器
onMounted(() => {
  const timer = setInterval(() => {
    /* ... */
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

// 清理自定义 effect
onMounted(() => {
  const stop = watchEffect(() => {
    // ...
  })

  onUnmounted(() => {
    stop()
  })
})
```

---

## 附录

### A. Vue 3 vs Vue 2 关键差异

| 特性         | Vue 2                 | Vue 3                |
| ------------ | --------------------- | -------------------- |
| 响应式       | Object.defineProperty | Proxy                |
| API          | Options API           | Composition API      |
| 碎片化       | 不支持                | 支持多个根节点       |
| Teleport     | 无                    | 内置支持             |
| Suspense     | 无                    | 实验性支持           |
| TypeScript   | 部分支持              | 完全重写，更好的支持 |
| Tree-shaking | 困难                  | 模块化设计，易于优化 |
| 性能         | -                     | 更快，更小           |

### B. 常见性能问题排查

**1. 不必要的重渲染**

```javascript
// 使用 Vue Devtools Performance tab
// 查看哪些组件频繁重渲染
// 使用 v-memo 优化列表
```

**2. 大列表性能**

```javascript
// 使用虚拟滚动
// 使用 key 优化 diff
// 避免在模板中使用复杂表达式
```

**3. 响应式过度**

```javascript
// ❌ 不需要响应式的大对象
const largeData = reactive(hugeObject)

// ✅ 使用 shallowRef 或 markRaw
const largeData = shallowRef(hugeObject)
const largeData = markRaw(hugeObject)
```

### C. Vue 3 新特性总结

| 特性                 | 作用           | 底层机制                   |
| -------------------- | -------------- | -------------------------- |
| Composition API      | 更好的逻辑复用 | setup + getCurrentInstance |
| Fragment             | 多根节点       | 特殊的 VNode 类型          |
| Teleport             | 渲染到任意位置 | 特殊的目标容器             |
| Suspense             | 异步依赖处理   | 边界 + 依赖计数            |
| v-memo               | 条件渲染优化   | 缓存 + 条件判断            |
| Reactivity Transform | 语法糖         | 编译时转换                 |
| Custom Elements      | Web Components | 特殊封装                   |

### D. 学习资源

- **官方文档**: https://vuejs.org/
- **Vue 源码**: https://github.com/vuejs/core
- **Vue Router**: https://router.vuejs.org/
- **Pinia**: https://pinia.vuejs.org/
- **Vue Mastery**: https://www.vuemastery.com/

---

**深入理解 Vue 3 底层原理，才能写出更高效、更优雅的代码！** 💚
