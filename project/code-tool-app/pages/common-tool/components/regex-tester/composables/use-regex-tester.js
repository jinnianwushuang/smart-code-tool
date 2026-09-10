import { ref, computed } from 'vue'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'
import { SCHEMA, regexLib } from '../utils/regex-constants.js'

export function useRegexTester() {
  const regexStr = ref('^1[3-9]\\d{9}$')
  const flags = ref(['g'])
  const testText = ref('我的电话是 13800138000，他的电话是 19912345678')

  const explanations = computed(() => {
    if (!regexStr.value) return []
    const result = []

    SCHEMA.forEach((item) => {
      if (item.re.test(regexStr.value)) {
        const matches = regexStr.value.match(new RegExp(item.re.source, 'g'))
        if (matches) {
          result.push({ token: matches[0], desc: item.desc })
        }
      }
    })

    if (/[a-zA-Z0-9]/.test(regexStr.value.replace(/\\[dws]/g, ''))) {
      result.push({ token: 'abc', desc: '匹配字面量字符 (精确匹配)' })
    }

    return result
  })

  const highlightedHtml = computed(() => {
    if (!testText.value || !regexStr.value) return testText.value
    try {
      const re = new RegExp(regexStr.value, flags.value.join(''))
      return testText.value
        .replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])
        .replace(re, (m) => `<span class="regex-match">${m}</span>`)
    } catch {
      return '<span class="text-negative">正则表达式语法有误，请检查</span>'
    }
  })

  const jsSnippet = computed(
    () => `const re = /${regexStr.value}/${flags.value.join('')};\nconsole.log(re.test(text));`,
  )

  const applyLibrary = (item) => {
    regexStr.value = item.pattern
    flags.value = [...item.flags]
    testText.value = item.test
  }

  const copy = (t) => {
    projectCopyText(t)
  }

  return {
    regexStr,
    flags,
    testText,
    explanations,
    highlightedHtml,
    jsSnippet,
    regexLib,
    applyLibrary,
    copy,
  }
}
