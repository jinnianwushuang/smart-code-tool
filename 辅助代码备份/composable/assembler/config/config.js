


export const genarate_event_listener = {
  file_path: "/effect/listener.js",
  method_name: "cleanup_effect_listener",
  config_key: "listener",

};


// 事件通道生成器的函数配置
export const genarate_event_pipeline = {
  file_path: "/module/event-pipeline/event-pipeline.js",
  method_name: "create_event_pipeline",
  config_key: "emit",
  use_payload: true,
  default: () => {},
};
//  单例初始化的函数配置
export const genarate_singleton = {
  file_path: "/variable/singleton.js",
  method_name: "init_all_singleton",
  config_key: "singleton",
  use_payload: false,
  default: () => {
    return () => {};
  },
};
