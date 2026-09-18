import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

export { handle_init_table_data }
export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
