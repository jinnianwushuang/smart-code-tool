import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'

import { dayjs } from 'src/output/common/project-common.js'

import { useGlobalState } from 'src/output/common/composable-common.js'
const { router, route, $q } = useGlobalState()

const isDesktop = $q.platform.is.desktop
const is_mobile = $q.platform.is.mobile
const clear = () => {
  inputCode.value = ''
  outputCode.value = ''
}
const copyOutput = () => {
  copyText(outputCode.value)
}

// create_multiton_variable
// create_computed_variable


/**
 * 
 * AUTO_DOC_UUID: 83232893Y28Y8Y2930U302U
 * AUTO_DOC_TITLE: 通用代码
 * AUTO_DOC_SECTION: 通用代码示例
 * AUTO_DOC_CONTENT:
 * 这是示例的 通用代码

const isDesktop = $q.platform.is.desktop
const is_mobile = $q.platform.is.mobile
 * 
 * 
 */