import { EMITTER } from 'src/output/common/project-common.js'
import { onSearch, onReset, handleTableChange, handleEdit, handleDelete } from '../module/table.js'
import { handleAdd, handleModalOk } from '../module/dialog.js'
import { loadData } from '../api-request/loadData.js'
import { wrap_with_payload_pipeline } from 'src/output/common/project-common.js'
export const mitt_register = (payload) => {
  return EMITTER.on('src_pages_vue_test_singleton_demo_singleton_lv4_mitt_mitt_emit', (...args) => {
    console.log('回调1:', args)

    const [event_name, ...rest_params] = args

    // const fn_obj = {
    //   onSearch: () => onSearch(payload, ...rest_params),
    //   onReset: () => onReset(payload, ...rest_params),
    //   loadData: () => loadData(payload, ...rest_params),
    //   handleTableChange: () => handleTableChange(payload, ...rest_params),
    //   handleEdit: () => handleEdit(payload, ...rest_params),
    //   handleDelete: () => handleDelete(payload, ...rest_params),
    //   handleAdd: () => handleAdd(payload, ...rest_params),
    //   handleModalOk: () => handleModalOk(payload, ...rest_params),
    // }

    const fn_obj = wrap_with_payload_pipeline(payload, rest_params, {
      onSearch,
      onReset,
      handleTableChange,
      handleEdit,
      handleDelete,
      handleAdd,
      handleModalOk,
    })

    if (fn_obj[event_name]) {
      return fn_obj[event_name]()
    }
  })
}
