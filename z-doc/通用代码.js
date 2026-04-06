import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'

const $q = useQuasar()
const isDesktop = $q.platform.is.desktop
const is_mobile = $q.platform.is.mobile
const clear = () => {
  inputCode.value = ''
  outputCode.value = ''
}
const copyOutput = () => {
  copyText(outputCode.value)
}

;<div v-pre></div>
