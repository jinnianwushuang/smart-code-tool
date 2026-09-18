import * as changeCase from "change-case";

/**
 * 传入文件路径，返回文件名的各种命名格式对象
 * @param {string} filePath - 例如: "src/components/MyHeader.test.js"
 * @return {Object} 包含 original、camel、pascal、kebab、snake、constant、sentence 等格式的对象
 * @description
 * 1. 从完整路径中提取纯文件名（去除路径和所有后缀）。
 * 2. 使用 change-case 库将文件名转换为多种命名格式，方便在不同场景下使用。
 * 3. 返回一个对象，包含 original（原始文件名）和各种转换后的命名格式。
 */
export const get_file_name_cases = (filePath) => {
  // 1. 提取纯文件名（去除路径和所有后缀）
  // 逻辑：取最后一段，然后去掉第一个点之后的所有内容
  const baseName = filePath.split(/[\\/]/).pop().split(".")[0];

  // 2. 返回各种转换结果
  return {
    original: baseName,
    camel: changeCase.camelCase(baseName), // myHeader
    pascal: changeCase.pascalCase(baseName), // MyHeader
    kebab: changeCase.kebabCase(baseName), // my-header
    snake: changeCase.snakeCase(baseName), // my_header
    constant: changeCase.constantCase(baseName), // MY_HEADER
    sentence: changeCase.sentenceCase(baseName), // My header
  };
};

// 测试
// console.log(getFileNameCases("users/admin/project/user_profile.controller.ts"));
  //  const file_cases = get_file_name_cases(path);

  //  // 过滤约定：以 "___" 结尾的文件名不参与聚合
  //  if (file_cases.original.endsWith("___")) return;
