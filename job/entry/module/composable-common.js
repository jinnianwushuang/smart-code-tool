import { getAllJsFilePaths, writeFile } from '../../file-util/file-util.js'

let all_files = []

const scan_folders = ['src/composable/']

for (let i = 0; i < scan_folders.length; i++) {
  const folder = scan_folders[i]
  const files = await getAllJsFilePaths(folder, { relative: true })

  all_files.push(...files.filter((file) => file.includes('/use')))
}

console.log( "Composable files found:", all_files.length, all_files)

writeFile('src/output/json/composable-common-files.json', JSON.stringify(all_files, null, 2))

let export_statements = all_files
  .map((file) => {
    return `export * from  '${file}'`
  })
  .join('\n')

writeFile('src/output/common/composable-common.js', export_statements)

export default all_files
