<template>
  <div>
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
</template>

<script setup>
defineProps({
  schemes: Object,
  exportToJson: Function,
  applyColor: Function,
})
</script>

<style scoped>
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

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
</style>
