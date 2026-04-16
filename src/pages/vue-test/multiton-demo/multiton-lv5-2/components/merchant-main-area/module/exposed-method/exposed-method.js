import { loadData } from '../../api-request/loadData.js'

export const handle_on_pagination_change = (payload, ...args) => {
  const { all_event_pipeline_parent, props } = payload
  loadData(payload)
  all_event_pipeline_parent.table.loadData({
    ...args,
    area_index: props.index,
  })
}
