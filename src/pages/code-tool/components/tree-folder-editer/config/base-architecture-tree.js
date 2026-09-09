/**
 * 基础架构树模板
 * 节点字段说明:
 * - title: 文件/目录名称 (必填)
 * - description: 功能注释 (可选)
 * - children: 子节点数组 (可选, 有则为目录, 无则为文件)
 * 注意: 无需手动维护 key, 组件解析时会自动生成
 */
export const base_architecture_tree = [
  {
    title: 'standard-model-module',
    description: '标准模型模块目录',
    children: [
      {
        title: 'index.vue',
        description: '模块入口组件, 负责布局编排与子组件组装',
      },
      {
        title: 'config',
        description: '模块静态配置目录',
        children: [
          {
            title: 'config.js',
            description: '表格列定义 / 表单字段 / 常量枚举等静态配置',
          },
        ],
      },
      {
        title: 'module',
        description: '业务逻辑目录',
        children: [
          {
            title: 'use-table.js',
            description: '表格业务逻辑 (查询/分页/排序)',
          },
          {
            title: 'use-form.js',
            description: '表单业务逻辑 (校验/提交/回显)',
          },
          {
            title: 'use-dialog.js',
            description: '弹窗业务逻辑 (打开/关闭/确认回调)',
          },
        ],
      },
      {
        title: 'mitt-pipeline',
        description: 'MITT 事件管道目录, 解耦组件间通信',
        children: [
          {
            title: 'dialog.js',
            description: 'dialog 管道事件定义与注册',
          },
          {
            title: 'table.js',
            description: 'table 管道事件定义与注册',
          },
        ],
      },
      {
        title: 'components',
        description: '模块私有子组件目录',
        children: [
          {
            title: 'search-bar.vue',
            description: '搜索栏组件',
          },
          {
            title: 'data-table.vue',
            description: '数据表格组件',
          },
          {
            title: 'form-dialog.vue',
            description: '表单弹窗组件',
          },
        ],
      },
    ],
  },
]
