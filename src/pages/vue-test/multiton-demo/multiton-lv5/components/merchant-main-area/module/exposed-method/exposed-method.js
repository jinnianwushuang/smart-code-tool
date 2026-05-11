import { loadData } from '../../api-request/loadData.js'

export const handle_on_pagination_change = (payload, ...args) => {
  const { ALL_EVENT_PIPELINE_parent, props } = payload
  loadData(payload)
  ALL_EVENT_PIPELINE_parent.table.loadData({
    ...args,
    area_index: props.index,
  })
}
