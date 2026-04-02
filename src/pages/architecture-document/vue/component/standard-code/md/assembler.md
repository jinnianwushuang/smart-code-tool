---
title: 装配
order: 51
---

## 装配-目录结构

```text
./assembler
├── assembler.js
└── module
    ├── lifecycle.js
    ├── method.js
    └── state.js

```

## 单元属性装配： assembler/module/state.js

```javascript
import { common_assemble_state } from 'src/output/common/project-common.js'

const modules = import.meta.glob('../../state/*.js', {
  eager: true,
})

export const assemble_state = (payload) => {
  common_assemble_state({
    payload,
    modules,
  })
}
```

## 单元方法装配： assembler/module/method.js

```javascript
import { merge_to_payload_with_conflict_logs } from 'src/output/common/project-common.js'

import { handle_query_demo } from '../../api-request/index.js'
import { handle_xxx_demo } from '../../module/other-method/index.js'
import { create_messaging_emit } from '../../module/emit/emit.js'
//当前文件路径
const current_file_path = import.meta.url
export const assemble_method = (payload) => {
  // 1. 创建暴露的方法
  let exposed_method = {
    handle_query_demo,
    handle_xxx_demo,
  }

  // 2. 检查冲突并合并

  merge_to_payload_with_conflict_logs({
    payload,
    dataToMerge: exposed_method,
    file_path: current_file_path,
  })
  // 3. 生成事件通道函数
  const all_emit = create_messaging_emit(payload)
  // 4. 检查冲突并合并
  merge_to_payload_with_conflict_logs({
    payload,
    dataToMerge: all_emit,
    file_path: current_file_path,
  })
}
```

## 单元调度装配： assembler/module/lifecycle.js

```javascript
import { handle_query_demo } from '../../api-request/index.js'
import { handle_xxx_demo } from '../../module/other-method/index.js'

import { useModuleLifecycleAssembler } from 'src/output/common/composable-common.js'

const modules = import.meta.glob(
  [
    '../../effect/*.js',
    '../../module/event-pipeline/event-pipeline.js',
    '../../state/singleton.js',
  ],
  {
    eager: true,
  },
)

export const assemble_lifecycle = (payload) => {
  const extra = {
    onBeforeMount: () => {},
    onMounted: () => {
      handle_query_demo(paylaod)
    },
    onBeforeUnmount: () => {
      handle_xxx_demo(paylaod)
    },
    onUnmounted: () => {},
  }
  useModuleLifecycleAssembler({
    payload,
    modules,
    extra,
  })
}
```

## 聚合装配： assembler/assembler.js

```javascript
import * as composable_common from 'src/output/common/composable-common.js'
import { common_assemble_assembler } from 'src/output/common/project-common.js'

// 扫描当前目录下的 module 目录内的 文件
const modules = import.meta.glob('./module/*.js', { eager: true })

//公共的外部模块

const income_assembler = ['useGlobalVariable']
//当前文件路径
const current_file_path = import.meta.url

//单元聚合装配
// export const assemble_assembler = () => {
//  return common_assemble_assembler({
//    current_file_path,
//    modules,
//  })
// }

//全部聚合装配
export const assemble_assembler = () => {
  const local_assembler = common_assemble_assembler({
    current_file_path,
    modules,
  })

  return common_assemble_assembler({
    composable_common,
    income_assembler,
    local_assembler,
  })
}
```

## 上下文装配： index.vue

```javascript
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { assemble_assembler } from './assembler/assembler.js'
// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = ['income_public_fn_a']
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = ['handle_query_demo']
// 基础上下文
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}
const {
  user_info,
  btn_a_click,
  wrapped_payload: { compute_btn_class },
} = useContextAssembler(base_payload, assemble_assembler())
```
