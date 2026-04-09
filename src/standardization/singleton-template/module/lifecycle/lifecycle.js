import { handle_query_demo } from '../../api-request/index.js'
import { handle_xxx_demo } from '../other-method/index.js'
export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')
  handle_xxx_demo(payload)
}
export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')
  handle_query_demo(payload)
}

export const lifecycle_onBeforeUnmount = (payload) => {
  console.log('lifecycle_onBeforeUnmount')
}

export const lifecycle_onUnmounted = (payload) => {
  console.log('')
}

export const lifecycle_onActivated = (payload) => {
  console.log('lifecycle_onActivated')
}

export const lifecycle_onDeactivated = (payload) => {
  console.log('lifecycle_onDeactivated')
}
