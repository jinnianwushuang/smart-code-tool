import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

export function useTextSegmentation() {
  const inputText = ref('')
  const loading = ref(false)
  const results = ref([])

  const config = reactive({
    type: 'length',
    length: 5000,
    count: 5,
    regexPreset: '\\n\\n+',
    regexStr: '',
  })

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      inputText.value = e.target.result
      message.success('文件读取成功')
    }
    reader.readAsText(file)
    return false
  }

  const applyPreset = (val) => {
    if (val !== 'custom') config.regexStr = val
  }

  const handleSplit = () => {
    if (!inputText.value) return message.error('请提供文本内容')
    loading.value = true

    setTimeout(() => {
      const text = inputText.value
      let res = []

      try {
        if (config.type === 'length') {
          for (let i = 0; i < text.length; i += config.length) {
            res.push(text.substring(i, i + config.length))
          }
        } else if (config.type === 'count') {
          const size = Math.ceil(text.length / config.count)
          for (let i = 0; i < text.length; i += size) {
            res.push(text.substring(i, i + size))
          }
        } else if (config.type === 'regex') {
          const pattern = new RegExp(config.regexStr || config.regexPreset, 'g')
          res = text.split(pattern).filter((s) => s.trim().length > 0)
        }

        results.value = res
        message.success(`切割完成，共 ${res.length} 段`)
      } catch (e) {
        message.error('正则语法错误，请检查')
      } finally {
        loading.value = false
      }
    }, 100)
  }

  const downloadAsZip = async () => {
    const zip = new JSZip()
    const folder = zip.folder('split_results')

    results.value.forEach((content, index) => {
      folder.file(`part_${index + 1}.txt`, content)
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `text_parts_${Date.now()}.zip`)
    message.success('ZIP 打包导出成功')
  }

  const downloadAsTxt = () => {
    const blob = new Blob([results.value.join('\n\n---NEXT_PART---\n\n')], { type: 'text/plain' })
    saveAs(blob, 'combined_parts.txt')
  }

  const copyToClipboard = (text) => {
    projectCopyText(text)
  }

  return {
    inputText,
    loading,
    results,
    config,
    handleFileUpload,
    applyPreset,
    handleSplit,
    downloadAsZip,
    downloadAsTxt,
    copyToClipboard,
  }
}
