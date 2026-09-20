import { copyFile, remove } from '../file-util/file-util.js'

await copyFile(
  'dist/code-tool-app/project/code-tool-app/index.html',
  'dist/code-tool-app/index.html',
)
await copyFile('dist/vue-test-app/project/vue-test-app/index.html', 'dist/vue-test-app/index.html')
await copyFile(
  'dist/react-test-app/project/react-test-app/index.html',
  'dist/react-test-app/index.html',
)
await remove('dist/code-tool-app/project/code-tool-app/index.html')
await remove('dist/vue-test-app/project/vue-test-app/index.html')
await remove('dist/react-test-app/project/react-test-app/index.html')
