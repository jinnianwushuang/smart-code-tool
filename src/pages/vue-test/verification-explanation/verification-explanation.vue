<template>
  <div class="content-guide-container">
    <a-card title="架构验证代码分级说明" :bordered="false">
      <a-typography v-for="item in guideData" :key="item.level" class="guide-section">
        <!-- 级别标题 -->
        <a-typography-title level="4"> L{{ item.level }} - {{ item.title }} </a-typography-title>

        <!-- 描述列表：自动带序号 -->
        <div class="description-list">
          <div v-for="(desc, index) in item.description" :key="index" class="desc-item">
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
    description: ['最基本的代码堆砌'],
    example: '',
  },
  {
    level: 2,
    title: 'lv2',
    description: ['vue模板部分按照功能结构拆分子组件，', 'props,emit 常规开发 父子组件通信'],
    example: '',
  },

  {
    level: 3,
    title: 'lv3',
    description: [
      '状态机单独抽离为create_variable，生成器。函数式生成状态机。',
      '事件和监听调度生命周期抽离为composable生成器，消费状态机上下文。',
      'VUE代码整洁，无函数代码的具体实现。但是父子组件传参较多',
    ],
    example: '',
  },
  {
    level: 4,
    title: 'lv4',
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
    example: '',
  },
  {
    level: 5,
    title: 'lv5',
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
