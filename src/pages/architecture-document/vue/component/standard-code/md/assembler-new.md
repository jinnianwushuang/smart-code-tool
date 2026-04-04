---
title: 装配
order: 99
---

## 装配-目录结构

```text
./assembler
└── assembler.js


```

## 聚合装配： assembler/assembler.js

```javascript
import * as composable_common from 'src/output/common/composable-common.js'
import { super_assemble_assembler } from 'src/output/common/project-common.js'

//公共的外部模块
const public_assembler = ['useGlobalVariable']
//手动引入的外部模块，不在 composable_common 中 的模块
const manual_assembler = []
//当前文件路径
const current_file_path = import.meta.url

//模块扫描
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true,
})

//聚合装配
export const assemble_assembler = () => {
  return super_assemble_assembler({
    composable_common,
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
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
