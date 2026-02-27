import { ref } from 'vue'

/**
 * Processes non-nested key-value pairs into variable declarations.
 * @param {import('vue').Ref<string>} inputText - The input text containing key-value pairs.
 * @param {import('vue').Ref<boolean>} useExport - Option to add 'export'.
 * @param {import('vue').Ref<boolean>} useSemicolon - Option to add ';'.
 * @param {import('vue').Ref<boolean>} useRefWrap - Option to wrap value in ref().
 * @returns {{outputText: import('vue').Ref<string>, process: () => void}}
 */
export function useNonNestedProcessor(inputText, useExport, useSemicolon, useRefWrap) {
  const outputText = ref('')

  const process = () => {
    const lines = inputText.value.split('\n').filter((line) => line.trim() !== '')
    const processedLines = lines.map((line) => {
      line = line.trim()
      // Remove trailing comma if it exists
      if (line.endsWith(',')) {
        line = line.slice(0, -1)
      }

      const parts = line.split(':')
      if (parts.length < 2) return `// Invalid line: ${line}`

      const key = parts[0].trim()
      const value = parts.slice(1).join(':').trim()

      let finalValue = value
      if (useRefWrap.value) {
        finalValue = `ref(${value})`
      }

      const prefix = useExport.value ? 'export const' : 'const'
      const suffix = useSemicolon.value ? ';' : ''

      return `${prefix} ${key} = ${finalValue}${suffix}`
    })
    outputText.value = processedLines.join('\n')
  }

  return {
    outputText,
    process,
  }
}

/**
 * Processes a single nested object into a const declaration for the innermost value.
 * @param {import('vue').Ref<string>} inputText - The input text containing a single nested object.
 * @returns {{outputText: import('vue').Ref<string>, process: () => void}}
 */
export function useNestedProcessor(inputText) {
  const outputText = ref('')

  const process = () => {
    try {
      const input = inputText.value.trim()
      // Attempt to make it a valid object literal if it's not already
      const objStr = `({${input.endsWith(',') ? input.slice(0, -1) : input}})`

      // Using a function constructor for safe evaluation
      const getObject = new Function(`return ${objStr}`)
      const obj = getObject()

      let current = obj
      const path = []
      let lastKey = ''

      // Traverse the object to find the deepest path
      while (typeof current === 'object' && current !== null && Object.keys(current).length > 0) {
        const keys = Object.keys(current)
        if (keys.length > 1) {
          outputText.value =
            '// Error: More than one key found at a level. Please provide a single path of nested objects.'
          return
        }
        lastKey = keys[0]
        path.push(lastKey)
        current = current[lastKey]
      }

      if (path.length === 0) {
        outputText.value = '// Error: Could not parse a valid object path.'
        return
      }

      // The last key in the path is the variable name we want
      const varName = path[path.length - 1]
      // The full path is the accessor
      const accessPath = path.join('.')

      outputText.value = `const ${varName} = ${accessPath};`
    } catch (e) {
      outputText.value = `// Error parsing input: ${e.message}`
    }
  }

  return {
    outputText,
    process,
  }
}
