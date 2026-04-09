import { assemble_lifecycle_centralized } from "./module/centralized/index.js";
/**
 * 通过配置 解析组装生命周期
 */
export const useConfigLifecycleAssembler = (all_params) => {
  assemble_lifecycle_centralized({
    ...all_params,
    assemble_type: "by_config",
  });
};

// const config = {
//   listener:(payload)=>[],
//   AllExceptEventListener:(payload)=>[]
// };
