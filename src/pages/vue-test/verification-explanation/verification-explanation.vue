<template>
  <div class="content-guide-container">
    <a-card title="架构验证代码分级说明" :bordered="false">
      <a-typography v-for="item in guideData" :key="item.level" class="guide-section">
        <!-- 级别标题 -->
        <a-typography-title level="5"> L{{ item.level }} - {{ item.title }} </a-typography-title>

        <div class="text-h6">思路</div>
        <div class="description-list">
          <div v-for="(desc, index) in item.approach" :key="index" class="desc-item">
            <span class="index-badge">{{ index + 1 }}、</span>
            <a-typography-text>{{ desc }}</a-typography-text>
          </div>
        </div>

        <!-- 描述列表：自动带序号 -->
        <div class="text-h6">描述</div>
        <div class="description-list">
          <div v-for="(desc, index) in item.description" :key="index" class="desc-item">
            <span class="index-badge">{{ index + 1 }}、</span>
            <a-typography-text>{{ desc }}</a-typography-text>
          </div>
        </div>
        <div class="text-h6">评价</div>
        <div class="description-list">
          <div v-for="(desc, index) in item.appraise" :key="index" class="desc-item">
            <span class="index-badge">{{ index + 1 }}、</span>
            <a-typography-text>{{ desc }}</a-typography-text>
          </div>
        </div>
        <!-- 示例展示 -->
        <!-- <div v-if="item.example" class="example-box">
          <a-tag color="blue">示例</a-tag>
          <code>{{ item.example }}</code>
        </div> -->

        <a-divider v-if="item.level < 7" />
      </a-typography>
    </a-card>
  </div>
</template>
<script setup>
import { ref } from 'vue'

// 定义一到五级的数据
const guideData = ref([
  {
    level: 1,
    title: 'lv1',
    approach: ['最基本的代码堆砌'],
    description: [
      '最基本的代码堆砌',
      '各个区块功能的状态和方法都放在一个VUE文件中，非常难维护。',
      '业务逻辑、UI交互与接口请求高度耦合，修改功能如同拆解乱线团。',
      'Props与Emit事件定义模棱两可，内部逻辑如同黑盒，导致组件完全无法复用。',
      '生命周期函数内堆放过多的异步初始化代码，缺乏必要的内存清理与资源释放。',
      '响应式变量（Data）动辄上百行，未区分UI状态与核心业务数据，存在严重命名冲突隐患。',
      '滥用 Watch 监听实现补丁逻辑，导致数据流向混乱，极易触发死循环或性能瓶颈。',
      '数千行代码共存一个文件，缺乏模块化拆分，新成员接手时心理负担大且阅读效率极低。',
      'CSS 样式随代码无限膨胀，缺乏统筹管理，即便使用 scoped 也难以避免查找与修改的痛苦。',
    ],
    appraise: [
      `这些补充内容涵盖了耦合度、复用性、生命周期管理、状态管理、调试难度、可维护性以及样式组织等多个实战中常见的痛点。`,
    ],
    example: '',
  },
  {
    level: 2,
    title: 'lv2',
    approach: [
      '继续上面，当对单一一体化的组件进行 区块功能性的 子组件拆分 ，使用 props,emit 父子组件通信 方案 ',
    ],
    description: [
      'Vue模板部分按照功能结构拆分子组件。',
      'Props、Emit 常规开发，实现父子组件通信。',
      '随着嵌套层级加深，出现“Props 逐级透传（Prop Drilling）”现象，中间层组件沦为纯搬运工。',
      '父组件状态（State）过于臃肿，需管理所有子组件的响应式数据，导致单文件逻辑依然厚重。',
      '子组件向上传递大量事件（Emit），父组件监听列表极长，回调函数命名冲突风险增加。',
      '父子组件生命周期执行顺序交错，导致部分子组件在获取 Props 初始值时出现异步不同步。',
      '强耦合的父子通信导致子组件离开特定父环境后无法独立运行，复用性依然受限。',
      '缺乏统一的数据流向管理，跨层级通信（如孙子传爷爷）被迫使用 EventBus 或过度依赖 Root。',
      '调试难度转移：虽单文件行数减少，但在多个文件间来回跳转追踪数据流向，增加了认知负担。',
    ],
    appraise: [`这阶段的问题核心在于“通信链路过长”和“逻辑中心化”。`],
    example: '',
  },

  {
    level: 3,
    title: 'lv3',
    approach: [
      '继续上面， 把组件的状态机封装为函数式生成，  。  ',
      '然后 把业务逻辑封装成composable 。  ',
      '在VUE 组件内 先调用状态机生成函数生成 基础上下文，然后调用业务逻辑封装的 composable 激活页面 。  ',
    ],
    description: [
      '将组件状态机（State Machine）封装为函数式生成，实现数据结构的标准化。',
      '业务逻辑（Business Logic）全量封装为 Composable，实现逻辑与 UI 的物理隔离。',
      'Vue 组件仅作为“粘合层”，通过调用状态机函数生成基础上下文（Context）。',
      '调用业务 Composable 注入上下文并“激活”页面，组件内仅保留极简的模板绑定。',
      '逻辑高度抽象导致“代码跳转陷阱”，开发者需在多个 Composable 文件间反复横跳才能理清数据流。',
      '状态机生成函数若缺乏严格的类型约束（TS），会导致注入上下文后的属性联想失效，维护成本骤增。',
      '过度封装产生“黑盒效应”，新成员难以直观看到响应式变量的来源，逻辑溯源变得极其困难。',
      '多个 Composable 之间可能存在隐性依赖，若调用顺序错误，会导致状态初始化失败或闭包陷阱。',
      '组件间逻辑复用虽然提升，但过度的函数式拆分可能导致简单的业务需求也被“过度设计”。',
      'VUE代码整洁，无函数代码的具体实现。但是父子组件传参较多',
    ],
    appraise: [`这阶段的架构已经迈向了高度抽象化。`],

    example: '',
  },
  {
    level: 4,
    title: 'lv4',
    approach: [
      '继续上面，进一步优化，把父组件的状态机转换为单例模式，',
      '把子孙组件消费的父组件的事件函数使用MITT管道函数式封装，',
      '下游子孙组件直接引入父组件的单例状态机的集合和MITT管道函数的派发方法函数，',
      'VUE组件内的代码进一步封装隔离。',
    ],

    description: [
      '把状态机抽离为singleton，事件和监听抽离为module，事件调度生命周期抽离为composable，',
      '使用MITT封装事件管道，为下游组件提供管道消费函数。',
      '父级组件内部消费状态机上下文。',
      '下游组件直接消费单利状态机和MITT事件管道。',
      '组件层级可以进一步拉伸更多层',
      'VUE代码进一步整洁，子组件无需props,emit。',
      '但是多个切面之间存在执行顺序交叉',
      '另外必须了解每一个切面的输入输出',
    ],

    description: [
      '父组件状态机（State Machine）重构为单例模式，跨组件共享统一的数据源快照。',
      '子孙组件通过引入单例状态机集合，实现对父级数据的直接消费，摆脱 Props 逐级透传。',
      '父组件事件函数采用 MITT 管道函数式封装，建立标准化的事件派发（Dispatch）机制。',
      '下游子孙组件直接引用 MITT 派发方法，实现跨层级的“逻辑解耦”与“精准通信”。',
      '单例模式导致组件实例与状态生命周期脱节，若不手动销毁监听与重置状态，极易造成内存泄漏。',
      'MITT 属于全局或单例级别的发布订阅，缺乏原生事件的冒泡与捕获语义，导致事件流向难以通过工具溯源。',
      '子组件直接修改父组件单例状态，破坏了单向数据流原则，容易引发“数据被谁改了”的定位灾难。',
      '过度隔离使得 Vue 开发者工具（Devtools）的组件状态追踪失效，逻辑调试演变为控制台断点大战。',
      '由于逻辑完全剥离出 Vue 组件体系，模板（Template）与脚本（Script）的直观关联性降至冰点。',
    ],
    appraise: [
      `这已经是高度函数式、去组件中心化的重构方向了。
现在的架构已经很像一种“自定义的微型状态管理系统”了`,
    ],

    example: '',
  },
  {
    level: 5,
    title: 'lv5',
    approach: [
      '继续上面，进一步优化，优化目录结构，提供全局封装函数。',
      '使用vite 扫描目录内容，自动组合装配 状态机 、函数、事件管道、  生命周期调度 、副作用生成注入以及销毁。',
      '组件内只需要按照固定的目录结构放置代码内容.',
      '最后在模块内固定的文件内调用全局封装的零件聚合函数， 聚合零件生成队列。',
      '在VUE组件内，调用全局封装的组合式函数，注入基础上下文，执行上面生成的零件生成队列， 不断扩展上下文，生成上下文。',
      '所有地方消费的上下文是同一个，不会出现不一致。',
      "一切只需要从payload上下文内获取'",
    ],

    description: [
      '在LV4的基础上，使用高阶函数代理，实现事件管道的注入。支持链式调用。',
      '封装扫描架构,工具函数，和聚合函数以及组合式函数，实现代码的自动注入和解耦。',
      '封装使用全局装配函数，把所有零件装配好，在VUE组件内，注入基础上下文，并且不断扩展，生成上下文。',
      '所有函数和公共切面逻辑全部采用从上下文获取内容的方式',
      '无需考虑各个切面的输入输出的逻辑 ',
      '界面组件直接消费的函数，提供专门包装，闭合上下文，不用的不做多余封装，不混淆。',
      '所有地方消费的上下文是同一个，不会出现不一致。',
      '心智模型再次降低难度，一切只需要从payload上下文内获取',
    ],
    description: [
      '心智模型再次降低难度，一切逻辑与状态只需要从 Payload 上下文内获取。',
      '利用 Vite 自动扫描目录，实现状态机、函数、事件管道的零手动引入与自动装配。',
      '全局封装调度引擎，统一管理生命周期钩子、副作用生成（Effect）及其自动销毁。',
      'Vue 组件高度标准化，仅需按照固定目录规范放置零件代码，实现“配置即功能”。',
      '在模块内通过聚合函数生成零件队列，由全局组合式函数一键注入并激活上下文。',
      '全链路消费同一份上下文副本，彻底杜绝多数据源导致的状态不一致问题。',
      '架构高度抽象导致“魔法代码”过多，新成员若不了解底层扫描与装配逻辑，将完全无法调试。',
      '极度依赖固定的目录结构，一旦业务需求打破常规文件组织方式，重构代价将呈指数级上升。',
      '黑盒化的自动化装配削弱了 Vue 官方 Devtools 的感知力，状态变更的溯源链条变得极长。',
      '过度中心化的 Payload 上下文可能导致内存膨胀，若无精细的局部销毁机制，单页应用性能堪忧。',
    ],
    appraise: [
      ` 这套架构已经进化到了“框架级的自研 DSL（领域特定语言）”阶段。
这种“约定优于配置”的模式在大型低代码平台或复杂后台中非常强大`,
    ],

    example: '',
  },
])
</script>

<style scoped>
.content-guide-container {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.guide-item {
  margin-bottom: 20px;
}

.example-box {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
  font-family: monospace;
}
</style>
