import { create_multiton_variable } from '../state/multiton.js'
import { create_computed_variable } from '../state/computed.js'

export const src_composable_demo_use_user_time_composable_state = (payload) => {
  const all_multition = create_multiton_variable(payload)
  const all_computed = create_computed_variable({
    ...all_multition,
    ...payload,
  })

  return {
    ...all_multition,
    ...all_computed,
  }
}
