import { ref, computed, watch, onMounted } from 'vue'
import tinycolor from 'tinycolor2'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

export function useColorConverter() {
  const colorInput = ref('#1890ff')
  const schemes = ref([])

  const colorDetails = computed(() => {
    const c = tinycolor(colorInput.value)
    if (!c.isValid()) return null

    const rgb = c.toRgb()
    const aHex = Math.round(rgb.a * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
    const flutter = `Color(0x${aHex}${c.toHex().toUpperCase()})`

    return {
      hex: c.toHexString().toUpperCase(),
      rgb: c.toRgbString(),
      flutter: flutter,
      isDark: c.isDark(),
    }
  })

  const generateSchemes = () => {
    const c = tinycolor(colorInput.value)
    if (!c.isValid()) return

    schemes.value = [
      { label: '互补色 (Complement)', colors: [c.complement()] },
      { label: '三色系 (Triad)', colors: c.triad() },
      { label: '相邻色 (Analogous)', colors: c.analogous() },
      { label: '分裂互补 (Split Complement)', colors: c.splitcomplement() },
      { label: '单色系 (Monochromatic)', colors: c.monochromatic() },
    ]
  }

  const variablesCode = computed(() => {
    if (!colorDetails.value) return ''
    const hex = colorDetails.value.hex
    return `/* CSS Variables */
:root {
  --primary-color: ${hex};
  --primary-bg: ${tinycolor(hex).lighten(40).toHexString()};
}

/* SCSS Variables */
$primary-color: ${hex};
$primary-light: lighten($primary-color, 20%);
$primary-dark: darken($primary-color, 15%);`
  })

  const copy = (text) => {
    if (!text) return
    projectCopyText(text)
  }

  const applyColor = (c) => {
    colorInput.value = c.toHexString()
  }

  const exportToJson = () => {
    if (!colorDetails.value) return

    const data = {
      metadata: {
        generatedAt: new Date().toISOString(),
        tool: 'DevTools Color Master',
      },
      primaryColor: {
        hex: colorDetails.value.hex,
        rgb: colorDetails.value.rgb,
        flutter: colorDetails.value.flutter,
      },
      schemes: schemes.value.map((s) => ({
        name: s.label,
        colors: s.colors.map((c) => c.toHexString().toUpperCase()),
      })),
      variables: {
        css: variablesCode.value.split('/* SCSS Variables */')[0].trim(),
        scss: '/* SCSS Variables */' + variablesCode.value.split('/* SCSS Variables */')[1].trim(),
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `color-scheme-${colorDetails.value.hex}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  watch(colorInput, generateSchemes)
  onMounted(generateSchemes)

  return {
    colorInput,
    schemes,
    colorDetails,
    variablesCode,
    copy,
    applyColor,
    exportToJson,
  }
}
