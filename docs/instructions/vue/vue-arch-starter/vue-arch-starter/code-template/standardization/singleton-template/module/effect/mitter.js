


import { EMITTER } from 'src/common/architecture-design/mitt-kit/mitt.js';
//已核对
export const cleanup_effect_mitter = (payload) => {
    const { current_time } = payload;

    return [EMITTER.on("custom-event", () => {
        console.log("custom-event received at", current_time.value);
    })];

}
