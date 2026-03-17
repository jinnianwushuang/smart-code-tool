import { trim } from 'lodash-es'
/**
 * 提取变量名
 * 规则：匹配 ! 或 : 或 @ 开头，直到遇到 ?. 或 . 或 " 为止
 * @param {string} str
 * @returns {string|null}
 */
export const extract_base_variable1 = (str) => {
  // 正则解析：
  // [!:@]          匹配前缀符号
  // ([a-zA-Z_$][\w$]*) 捕获组：匹配合法的变量名
  // (?=\??\.|")    正向断言：后面跟着 ?. 或 . 或 "
  const regex = /[!:@]([a-zA-Z_$][\w$]*)(?=\??\.|")/

  if (str.includes('.')) {
    console.log('包含点')
  }

  const match = str.match(regex)
  return match ? match[1] : str
}

// // --- 测试 ---
// console.log(extract_base_variable('!formattedResult?.aa"')) // "formattedResult"
// console.log(extract_base_variable('!user.name"')) // "user"
// console.log(extract_base_variable(':isPending"')) // "isPending"

export const extract_base_variable = (str = '') => {
  str = trim(str, ' !:@') // 去除前后可能的符号和空格
  if (!str) return ''

  if (str.includes('.')) {
    console.log('包含点')
    str = str.split('.')[0]
  }

  return str
}
