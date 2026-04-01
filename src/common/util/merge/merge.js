import { global_log } from "src/common/util/log/log.js";
/**
 *  合并数据到 payload 中，并记录冲突日志
 *  @param {Object} payload - 目标对象，数据将被合并到此对象中
 *  @param {Object} dataToMerge - 待合并的数据对象
 *  @param {String} file_path - 数据来源的文件路径，用于日志记录
 *  @returns {void}
 *  @description
 *    1. 遍历 dataToMerge 中的每个键值对。
 *    2. 如果 payload 中已存在相同的键，则记录冲突日志，包含键名、新旧值来源。
 *    3. 将 dataToMerge 的键值对合并到 payload 中，并更新来源映射。
 *    4. 最后输出所有冲突日志，便于开发者查看和调试。
 */
export const merge_to_payload_with_conflict_logs = ({
  payload,
  dataToMerge,
  file_path,
}) => {
  const sourceMap = {}; // 用于记录 key -> file_path 的映射
  const conflictLogs = []; // 存储冲突详情

  // 2. 检查冲突并合并
  Object.keys(dataToMerge).forEach((key) => {
    if (key in payload) {
      conflictLogs.push(
        `[冲突] 键 "${key}"  , 新值来源： ${file_path}   , 旧值来源： ${sourceMap[key]}`,
      );
    }

    payload[key] = dataToMerge[key];
    sourceMap[key] = file_path; // 更新或记录来源
  });

  if (conflictLogs.length > 0) {
    global_log("[警告]: 键来源冲突报告");
    console.group("[警告]: 键来源冲突报告");
    conflictLogs.forEach((log) => console.warn(log));
    console.groupEnd();
  }
};
