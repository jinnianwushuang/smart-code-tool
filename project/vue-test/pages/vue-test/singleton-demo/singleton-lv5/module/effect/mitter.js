


import { EMITTER } from "src/output/common/project-common.js";
//已核对
export const cleanup_effect_mitter = (payload) => {
    const { current_time } = payload;

    return [EMITTER.on("custom-event", () => {
        console.log("custom-event received at", current_time.value);
    })];

}
