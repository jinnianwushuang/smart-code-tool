import { shallowRef } from 'vue'
import { flutter_docs } from './module/flutter.js'
import { fullstack_docs } from './module/fullstuck.js'
import { react_docs } from './module/react.js'
import { vue_docs } from './module/vue.js'

import { architecture_docs } from './module/architecture.js'

import { js_basic_doc } from './module/js-basic.js'

// 综合所有维度的文档数据
export const allDocGroups = shallowRef([
  ...js_basic_doc,

  ...vue_docs,
  ...react_docs,
  ...flutter_docs,
  ...fullstack_docs,

  ...architecture_docs,
])
