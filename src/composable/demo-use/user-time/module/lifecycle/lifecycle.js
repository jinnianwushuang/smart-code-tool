
import { when_mounted } from '../other-method/index.js'
export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')

}
export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')

  when_mounted(payload)
}

export const lifecycle_onBeforeUnmount = (payload) => {
  console.log('lifecycle_onBeforeUnmount')
}

export const lifecycle_onUnmounted = (payload) => {
  console.log('lifecycle_onUnmounted')
}

export const lifecycle_onActivated = (payload) => {
  console.log('lifecycle_onActivated')
}

export const lifecycle_onDeactivated = (payload) => {
  console.log('lifecycle_onDeactivated')
}
