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
