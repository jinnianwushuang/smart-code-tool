import path from 'path';
import {
  setLogging,
  getWorkspaceRoot,
  getFullPath,
  createDir,
  writeFile,
  writeJson,
  createFile,
  readFile,
  readJson,
  remove,
  getAllJsFilePaths,
} from './file-util.js';

async function main() {
  console.log('--- Starting File Utility Demo (ESM) ---');
  setLogging(true);

  // --- Path Helpers ---
  console.log(`\n1. Workspace Root: ${getWorkspaceRoot()}`);
  
  const tempDirPath = 'job/file-util/temp-demo-2';
  console.log(`2. Full path for temp dir: ${getFullPath(tempDirPath)}`);

  // --- Directory and File Creation ---
  console.log('\n3. Creating sample files for scanning...');
  await createDir(tempDirPath);
  await writeFile(path.join(tempDirPath, 'a.js'), '// A');
  await createDir(path.join(tempDirPath, 'sub'));
  await writeFile(path.join(tempDirPath, 'sub', 'b.mjs'), '// B');
  await writeFile(path.join(tempDirPath, 'sub', 'c.ts'), '// C');
  await writeFile(path.join(tempDirPath, 'sub', 'd.txt'), 'not a js file');
  
  // --- Recursive Scan ---
  console.log('\n4. Scanning for JS files...');
  const allFiles = await getAllJsFilePaths(tempDirPath);
  console.log('   - Found absolute paths:', allFiles);
  
  const relativeFiles = await getAllJsFilePaths(tempDirPath, { relative: true });
  console.log('   - Found relative paths:', relativeFiles);

  // --- Deletion ---
  console.log('\n5. Cleaning up...');
  await remove(tempDirPath); 

  console.log('\n--- Demo Finished ---');
}

main().catch(error => {
  console.error('An error occurred during the demo:', error);
});
