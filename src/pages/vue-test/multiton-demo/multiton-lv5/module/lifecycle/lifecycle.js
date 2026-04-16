import { loadData } from '../../api-request/loadData.js'

export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')
  const { pagination } = payload
  pagination.value.pageSize = 200
}
export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')
  loadData(payload)
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
