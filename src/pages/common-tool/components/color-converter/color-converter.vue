<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  BgColorsOutlined,
  CopyOutlined,
  ExportOutlined,
  FormatPainterOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import tinycolor from 'tinycolor2'

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
  navigator.clipboard.writeText(text)
  message.success('已复制')
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
  message.success('JSON 配色方案已导出')
}

watch(colorInput, generateSchemes)
onMounted(generateSchemes)
</script>

<template>
  <div class="color-master-container">
    <a-row :gutter="24">
      <!-- 左侧：主输入与转换 -->
      <a-col :xs="24" :lg="10">
        <a-card title="核心转换" :bordered="false" class="card-shadow">
          <div
            class="main-preview"
            :style="{ backgroundColor: colorInput, color: colorDetails?.isDark ? '#fff' : '#000' }"
          >
            <span class="preview-text">{{ colorDetails?.hex }}</span>
          </div>

          <div class="input-section">
            <a-input-group compact style="display: flex">
              <a-input v-model:value="colorInput" placeholder="#1890ff" style="flex: 1" />
              <input type="color" v-model="colorInput" class="color-picker-input" />
            </a-input-group>
          </div>

          <div class="result-box" v-if="colorDetails">
            <div class="res-item">
              <span class="res-label">Flutter</span>
              <code @click="copy(colorDetails.flutter)">{{ colorDetails.flutter }}</code>
            </div>
            <div class="res-item">
              <span class="res-label">RGB</span>
              <code @click="copy(colorDetails.rgb)">{{ colorDetails.rgb }}</code>
            </div>
          </div>
        </a-card>

        <!-- 变量导出 -->
        <a-card title="代码导出 (CSS/SCSS)" :bordered="false" class="card-shadow mt-24">
          <template #extra>
            <a-button type="link" size="small" @click="copy(variablesCode)"
              ><CopyOutlined /> 复制全部</a-button
            >
          </template>
          <pre class="code-pre"><code>{{ variablesCode }}</code></pre>
        </a-card>
      </a-col>

      <!-- 右侧：配色方案 -->
      <a-col :xs="24" :lg="14">
        <a-card title="配色方案生成" :bordered="false" class="card-shadow">
          <template #extra><FormatPainterOutlined /></template>

          <div v-for="scheme in schemes" :key="scheme.label" class="scheme-group">
            <div class="scheme-label">{{ scheme.label }}</div>
            <div class="scheme-palette">
              <div
                v-for="(c, idx) in scheme.colors"
                :key="idx"
                class="palette-item"
                :style="{ backgroundColor: c.toHexString() }"
                @click="applyColor(c)"
                :title="c.toHexString()"
              >
                <span class="hex-tip">{{ c.toHexString().toUpperCase() }}</span>
              </div>
            </div>
          </div>

          <div class="hint"><ThunderboltOutlined /> 点击上方色块可直接切换主颜色</div>
        </a-card>
        <!-- 右侧：配色方案卡片头部 -->
        <a-card title="配色方案生成" :bordered="false" class="card-shadow">
          <template #extra>
            <a-space>
              <a-button size="small" @click="exportToJson">
                <template #icon><ExportOutlined /></template>
                导出 JSON
              </a-button>
              <FormatPainterOutlined />
            </a-space>
          </template>

          <!-- ... 方案列表内容保持不变 ... -->
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.color-master-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.card-shadow {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.mt-24 {
  margin-top: 24px;
}

/* 预览区 */
.main-preview {
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: 0.3s;
}
.preview-text {
  font-family: monospace;
  font-size: 20px;
  font-weight: bold;
}

/* 输入与结果 */
.color-picker-input {
  width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid #d9d9d9;
  cursor: pointer;
}
.result-box {
  margin-top: 20px;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
}
.res-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}
.res-item code {
  cursor: pointer;
  color: #1890ff;
}
.res-label {
  color: #8c8c8c;
}

/* 配色方案 */
.scheme-group {
  margin-bottom: 24px;
}
.scheme-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-weight: bold;
}
.scheme-palette {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.palette-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.palette-item:hover .hex-tip {
  opacity: 1;
}
.hex-tip {
  opacity: 0;
  color: #fff;
  font-size: 10px;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 3px;
  pointer-events: none;
  transition: 0.2s;
}

/* 代码区域 */
.code-pre {
  background: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
}
.hint {
  margin-top: 16px;
  font-size: 12px;
  color: #bfbfbf;
  text-align: center;
}
</style>
