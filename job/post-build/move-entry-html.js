import { copyFile, remove } from '../file-util/file-util.js'

await copyFile(
  'dist/code-tool-app/entries/code-tool-app/index.html',
  'dist/code-tool-app/index.html',
)
await copyFile('dist/vue-test-app/entries/vue-test-app/index.html', 'dist/vue-test-app/index.html')
await remove('dist/code-tool-app/entries/code-tool-app/index.html')
await remove('dist/vue-test-app/entries/vue-test-app/index.html')
