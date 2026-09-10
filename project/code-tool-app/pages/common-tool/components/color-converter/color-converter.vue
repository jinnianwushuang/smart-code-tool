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
          <SchemeDisplay
            :schemes="schemes"
            :exportToJson="exportToJson"
            :applyColor="applyColor"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import SchemeDisplay from './components/scheme-display.vue'
import { useColorConverter } from './composables/use-color-converter.js'

const {
  colorInput,
  schemes,
  colorDetails,
  variablesCode,
  copy,
  applyColor,
  exportToJson,
} = useColorConverter()
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

.code-wrapper {
  background: rgba(40, 44, 52, 0.95);
  border-radius: 8px;
  padding: 16px;
  color: #9cdcfe;
  font-size: 12px;
}
</style>
