export const base_architecture_tree = [
  {
    title: 'standard-model-module-directory',
    key: 'r1',
    description: '标准模型模块目录',
    children: [
      {
        title: 'index.vue',
        key: 'r1-1',
        description: '模块入口VUE组件',
      },
      {
        title: 'module',
        key: 'r1-2',
        description: '业务函数目录',
        children: [
          {
            title: 'index.js',
            key: 'r1-2-1',
            description: '模块业务逻辑零散JS文件',
          },
          {
            title: 'mitt-pipeline',
            key: 'r1-2-2',
            description: '模块MITT事件管道目录',
            children: [
              {
                title: 'dialog.js',
                key: 'r1-2-2-1',
                description: '模块MITT事件管道-dialog-管道事件定义文件',
              },
              {
                title: 'table.js',
                key: 'r1-2-2-2',
                description: '模块MITT事件管道-table-管道事件定义文件',
              },
              {
                title: 'other.js',
                key: 'r1-2-2-3',
                description: '模块MITT事件管道-other-管道事件定义文件',
              },
            ],
          },
        ],
      },
    ],
  },
]
