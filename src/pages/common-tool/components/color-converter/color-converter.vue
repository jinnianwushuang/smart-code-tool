<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base shadow-2">
      <!-- 统一头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="colorize" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">色彩转换与配色大师</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：核心转换与输入 -->
        <div class="col-12 col-md-5 q-gutter-y-md border-right-adaptive">
          <div class="text-subtitle2 text-grey-8">核心预览与转换</div>

          <div
            class="main-preview transition-base shadow-inner"
            :style="{ backgroundColor: colorInput, color: colorDetails?.isDark ? '#fff' : '#000' }"
          >
            <span class="preview-text font-mono">{{ colorDetails?.hex }}</span>
          </div>

          <div class="row items-center q-gutter-x-sm">
            <q-input
              v-model="colorInput"
              filled
              dense
              label="颜色输入 (#Hex, RGB, Name)"
              class="col"
            />
            <input type="color" v-model="colorInput" class="color-picker-input cursor-pointer" />
          </div>

          <div class="result-box rounded-borders control-panel q-pa-md" v-if="colorDetails">
            <div class="res-item row items-center justify-between">
              <span class="text-caption">Flutter (ARGB)</span>
              <code
                class="font-mono cursor-pointer text-primary"
                @click="copy(colorDetails.flutter)"
                >{{ colorDetails.flutter }}</code
              >
            </div>
            <div class="res-item row items-center justify-between q-mt-sm">
              <span class="text-caption">RGB / RGBA</span>
              <code class="font-mono cursor-pointer text-primary" @click="copy(colorDetails.rgb)">{{
                colorDetails.rgb
              }}</code>
            </div>
          </div>

          <!-- 变量导出 -->
          <div class="q-mt-lg">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2 text-grey-8">代码变量导出</div>
              <q-btn
                flat
                dense
                color="primary"
                icon="content_copy"
                size="sm"
                label="复制全部"
                @click="copy(variablesCode)"
              />
            </div>
            <div class="code-wrapper font-mono">
              <pre class="q-ma-none"><code>{{ variablesCode }}</code></pre>
            </div>
          </div>
        </div>

        <!-- 右侧：配色方案 -->
        <div class="col-12 col-md-7">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2 text-grey-8">配色方案生成</div>
            <q-btn
              color="indigo"
              size="sm"
              label="导出方案 (JSON)"
              icon="download"
              @click="exportToJson"
            />
          </div>

          <div v-for="scheme in schemes" :key="scheme.label" class="scheme-group q-mb-lg">
            <div class="scheme-label text-caption q-mb-xs font-bold">
              {{ scheme.label }}
            </div>
            <div class="scheme-palette shadow-1">
              <div
                v-for="(c, idx) in scheme.colors"
                :key="idx"
                class="palette-item transition-base relative-position"
                :style="{ backgroundColor: c.toHexString() }"
                @click="applyColor(c)"
              >
                <q-tooltip class="bg-black">{{ c.toHexString().toUpperCase() }}</q-tooltip>
                <span class="hex-tip">{{ c.toHexString().toUpperCase() }}</span>
              </div>
            </div>
          </div>

          <div class="hint q-mt-xl text-grey-6 text-center text-caption">
            <q-icon name="info" class="q-mr-xs" /> 点击上方任意色块可快速切换主颜色
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import tinycolor from 'tinycolor2'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

// --- 状态定义 ---
const colorInput = ref('#1890ff')
const schemes = ref([])

// --- 核心逻辑：转换与配色生成 ---
const colorDetails = computed(() => {
  const c = tinycolor(colorInput.value)
  if (!c.isValid()) return null

  const rgb = c.toRgb()
  // Flutter 格式: Color(0x + AlphaHex + RGBHex)
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

// 生成配色方案
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

// 导出变量
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

// --- 导出 JSON 功能 ---
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
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.max-w-1200 {
  max-width: 1200px;
}

.control-panel {
  background-color: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

/* 预览区 */
.main-preview {
  height: 120px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-text {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 输入与结果 */
.color-picker-input {
  width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
}

/* 配色方案 */
.scheme-palette {
  display: flex;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.palette-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.palette-item:hover {
  transform: scaleY(1.1);
  z-index: 1;
}
.hex-tip {
  opacity: 0;
  color: #fff;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}
.palette-item:hover .hex-tip {
  opacity: 1;
}

.code-wrapper {
  background: rgba(40, 44, 52, 0.95);
  border-radius: 8px;
  padding: 16px;
  color: #9cdcfe;
  font-size: 12px;
}
</style>
