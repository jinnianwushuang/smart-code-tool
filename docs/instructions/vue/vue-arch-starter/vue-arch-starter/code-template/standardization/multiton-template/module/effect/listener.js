import { handle_resize } from '../other-method/event-listener.js'
//已核对
export const cleanup_effect_listener = (payload) => {
  // return [];
  return [
    {
      target: window,
      type: 'resize',
      handler: (event) => handle_resize(payload, event),
    },
  ]
}
