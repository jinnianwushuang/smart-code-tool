import { getAllJsFilePaths, writeFile } from '../../file-util/file-util.js'

let all_files = []

const scan_folders = ['src/composable/']

const check_file_path = (filePath) => {
  filePath = filePath.replace(/\\/g, '/')
  // 1. 拆分路径和文件名
  const pathParts = filePath.split('/')
  const fileName = pathParts.pop().toLowerCase() // 获取文件名并转小写
  const dirName = pathParts.join('/').toLowerCase() // 获取目录部分并转小写

  // 2. 定义匹配规则
  const nameKeywords = ['state', 'index', 'variable', 'assemble', 'use']
  const dirKeywords = ['composable', 'assembler']

  // 3. 执行判断
  const isMatch =
    nameKeywords.some((key) => fileName.includes(key)) && // 文件名包含关键词之一
    dirKeywords.some((key) => dirName.includes(key)) // 目录名包含关键词之一

  return isMatch
}

for (let i = 0; i < scan_folders.length; i++) {
  const folder = scan_folders[i]
  const files = await getAllJsFilePaths(folder, { relative: true })

  // console.log(files.length)

  all_files.push(...files.filter((file) => check_file_path(file)))
}

console.log('Composable files found:', all_files.length, all_files)

writeFile('src/output/json/composable-common-files.json', JSON.stringify(all_files, null, 2))

let export_statements = all_files
  .map((file) => {
    return `export * from  '${file}'`
  })
  .join('\n')

writeFile('src/output/common/composable-common.js', export_statements)
