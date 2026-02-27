import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
// import { process } from 'process'
// --- Global Configuration ---

const config = {
  logEnabled: true,
}

/**
 * Enable or disable global logging for file operations.
 * @param {boolean} enabled - Set to true to enable, false to disable.
 */
export const setLogging = (enabled) => {
  config.logEnabled = !!enabled
  if (config.logEnabled) {
    console.log(chalk.gray('File utility logging is now enabled.'))
  } else {
    console.log(chalk.gray('File utility logging is now disabled.'))
  }
}

// --- Internal Logger ---

const logger = {
  info: (message) => console.log(chalk.blue(`[INFO] ${message}`)),
  success: (message) => console.log(chalk.green(`[SUCCESS] ${message}`)),
  warn: (message) => console.log(chalk.yellow(`[WARN] ${message}`)),
  error: (message) => console.log(chalk.red(`[ERROR] ${message}`)),
}

/**
 * Internal log dispatcher that respects global and local settings.
 */
const log = (type, message, localLogSetting) => {
  if (localLogSetting === false) return
  if (localLogSetting === true || config.logEnabled) {
    logger[type](message)
  }
}

// --- Path Utilities ---

/**
 * Gets the absolute path of the project's working directory.
 * @returns {string} The workspace root path.
 */
export const getWorkspaceRoot = () => {
  return process.cwd()
}

/**
 * Resolves a project-relative path to an absolute path.
 * @param {string} relativePath - The path within the project (e.g., 'src/components').
 * @returns {string} The full, absolute path.
 */
export const getFullPath = (relativePath) => {
  if (path.isAbsolute(relativePath)) {
    return relativePath
  }
  return path.resolve(getWorkspaceRoot(), relativePath)
}

// --- File and Directory Operations ---

export const createDir = async (dirPath, options = {}) => {
  const fullPath = getFullPath(dirPath)
  await fs.ensureDir(fullPath)
  log('success', `Directory created or already exists: ${fullPath}`, options.log)
}

export const readFile = async (filePath, options = {}) => {
  const fullPath = getFullPath(filePath)
  const content = await fs.readFile(fullPath, 'utf-8')
  log('info', `Read file: ${fullPath}`, options.log)
  return content
}

export const writeFile = async (filePath, content, options = {}) => {
  const fullPath = getFullPath(filePath)
  await fs.ensureFile(fullPath)
  await fs.writeFile(fullPath, content, 'utf-8')
  log('success', `Wrote file: ${fullPath}`, options.log)
}

export const createFile = async (filePath, options = {}) => {
  const fullPath = getFullPath(filePath)
  if (await fs.pathExists(fullPath)) {
    log('warn', `File already exists, did not create: ${fullPath}`, options.log)
    return
  }
  await fs.ensureFile(fullPath)
  log('success', `Created empty file: ${fullPath}`, options.log)
}

export const readJson = async (filePath, options = {}) => {
  const fullPath = getFullPath(filePath)
  const json = await fs.readJson(fullPath)
  log('info', `Read JSON file: ${fullPath}`, options.log)
  return json
}

export const writeJson = async (filePath, data, options = { space: 2 }) => {
  const fullPath = getFullPath(filePath)
  await fs.writeJson(fullPath, data, { spaces: options.space ?? 2 })
  log('success', `Wrote JSON file: ${fullPath}`, options.log)
}

export const remove = async (targetPath, options = {}) => {
  const fullPath = getFullPath(targetPath)
  await fs.remove(fullPath)
  log('success', `Removed: ${fullPath}`, options.log)
}

/**
 * Recursively finds all JavaScript-related files in a directory.
 * @param {string} dirPath - The directory to start scanning from.
 * @param {{relative?: boolean, ignore?: string[], extensions?: string[]}} [options] - Options object.
 * @returns {Promise<string[]>} A list of file paths.
 */
export const getAllJsFilePaths = async (dirPath, options = {}) => {
  const rootPath = getFullPath(dirPath)
  const defaultOptions = {
    relative: false,
    ignore: ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'],
    extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'],
  }
  const finalOptions = { ...defaultOptions, ...options }

  const files = []

  const walk = async (currentPath) => {
    const entries = await fs.readdir(currentPath)
    for (const entry of entries) {
      const fullEntryPath = path.join(currentPath, entry)

      if (finalOptions.ignore.includes(entry)) {
        continue
      }

      const stat = await fs.stat(fullEntryPath)

      if (stat.isDirectory()) {
        await walk(fullEntryPath)
      } else if (stat.isFile() && finalOptions.extensions.includes(path.extname(fullEntryPath))) {
        if (finalOptions.relative) {
          files.push(path.relative(getWorkspaceRoot(), fullEntryPath))
        } else {
          files.push(fullEntryPath)
        }
      }
    }
  }

  await walk(rootPath)
  log('info', `Found ${files.length} JS files in ${rootPath}`, options.log)
  return files
}

export const getAllFilePaths = async (dirPath, options = {}) => {
  const rootPath = getFullPath(dirPath)
  const defaultOptions = {
    relative: false,
    ignore: ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'],
  }
  const finalOptions = { ...defaultOptions, ...options }

  const files = []

  const walk = async (currentPath) => {
    const entries = await fs.readdir(currentPath)
    for (const entry of entries) {
      const fullEntryPath = path.join(currentPath, entry)

      if (finalOptions.ignore.includes(entry)) {
        continue
      }

      const stat = await fs.stat(fullEntryPath)

      if (stat.isDirectory()) {
        await walk(fullEntryPath)
      } else if (stat.isFile()) {
        if (finalOptions.relative) {
          files.push(path.relative(getWorkspaceRoot(), fullEntryPath))
        } else {
          files.push(fullEntryPath)
        }
      }
    }
  }

  await walk(rootPath)
  log('info', `Found ${files.length} files in ${rootPath}`, options.log)
  return files
}
export const getAllFilePathsWithExt = async (dirPath, options = {}) => {
  const rootPath = getFullPath(dirPath)
  const defaultOptions = {
    relative: false,
    ignore: ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'],
    extensions: [],
  }
  const finalOptions = { ...defaultOptions, ...options }

  const files = []
  const walk = async (currentPath) => {
    const entries = await fs.readdir(currentPath)
    for (const entry of entries) {
      const fullEntryPath = path.join(currentPath, entry)

      if (finalOptions.ignore.includes(entry)) {
        continue
      }

      const stat = await fs.stat(fullEntryPath)

      if (stat.isDirectory()) {
        await walk(fullEntryPath)
      }
    }
  }
  await walk(rootPath)
  for (const filePath of files) {
    if (finalOptions.extensions.includes(path.extname(filePath))) {
      if (finalOptions.relative) {
        files.push(path.relative(getWorkspaceRoot(), filePath))
      } else {
        files.push(filePath)
      }
    }
  }
  log('info', `Found ${files.length} files with extensions in ${rootPath}`, options.log)
  return files
}

/**
 * 获取文件路径信息
 * @param {string} inputPath 用户输入的路径
 */
export function getPathInfo(inputPath) {
  // 1. 获取工作空间（当前运行目录）
  const workspacePath = process.cwd()

  // 2. 获取全路径（绝对路径）
  // resolve 会自动处理 ../ 或 ./ 并结合当前工作空间
  const fullPath = path.resolve(inputPath)

  // 3. 获取相对于工作空间的路径
  // relative 会计算从第一个路径到第二个路径的相对差异
  const relativePath = path.relative(workspacePath, fullPath)

  return {
    workspace: workspacePath,
    fullPath: fullPath,
    relativePath: relativePath || '.', // 如果是当前目录，返回 '.'
  }
}
