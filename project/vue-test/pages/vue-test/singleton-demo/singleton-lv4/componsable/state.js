import * as all_singleton from '../variable/singleton.js'

import { create_computed_variable } from '../computed/index.js'
import * as all_config from '../config/config.js'

import { src_composable_demo_use_user_time_composable_state } from 'src/output/common/composable-common.js'
export const composable_state = (payload) => {
  const all_computed = create_computed_variable({
    ...payload,
    ...all_config,
    ...all_singleton,
  })

  const use_time = src_composable_demo_use_user_time_composable_state(payload)

  return {
    ...all_computed,
    ...all_config,
    ...all_singleton,
    ...use_time,
  }
}
