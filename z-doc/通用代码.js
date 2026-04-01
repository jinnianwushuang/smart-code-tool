import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'


const $q = useQuasar()
const isDesktop = $q.platform.is.desktop
const clear = () => {
  inputCode.value = ''
  outputCode.value = ''
}
const copyOutput = () => {
  copyText(outputCode.value)
}
