<template>
  <q-tab-panel name="single" class="row q-col-gutter-lg">
    <div class="col-12 col-md-7 q-gutter-y-md">
      <q-input
        v-model="singleText"
        type="textarea"
        filled
        label="二维码内容 (URL/文本)"
        rows="10"
        @update:model-value="refreshCanvas"
      />

      <div class="row q-col-gutter-sm">
        <div class="col-6 col-sm-3">
          <q-input filled v-model="foreground" label="前景" dense>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-menu><q-color v-model="foreground" /></q-menu>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-input filled v-model="background" label="背景" dense>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-menu><q-color v-model="background" /></q-menu>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-6 col-sm-3">
          <q-select v-model="level" :options="['L', 'M', 'Q', 'H']" filled dense label="容错" />
        </div>
        <div class="col-6 col-sm-3">
          <q-input v-model.number="size" type="number" filled dense label="尺寸(px)" />
        </div>
      </div>

      <q-file
        v-model="logoFile"
        label="叠加中心 Logo"
        filled
        dense
        accept="image/*"
        @update:model-value="handleLogoUpload"
      >
        <template v-slot:prepend><q-icon name="add_photo_alternate" /></template>
        <template v-slot:append v-if="logoFile">
          <q-icon name="close" @click.stop="clearLogo" class="cursor-pointer" />
        </template>
      </q-file>

      <div class="row q-gutter-md q-mt-md">
        <q-btn color="indigo-7" icon="download" label="下载图片" @click="downloadQR" class="col" />
        <q-btn
          color="deep-purple-6"
          icon="content_copy"
          label="复制图片"
          @click="copyQRImage"
          class="col"
        />
      </div>
    </div>

    <div class="col-12 col-md-5 flex flex-center column">
      <div class="qr-preview-box q-pa-md shadow-5 rounded-borders transition-base">
        <qrcode-vue
          class="hidden"
          :value="singleText || ' '"
          :size="size"
          :level="level"
          :foreground="foreground"
          :background="background"
          render-as="svg"
          ref="qrcodeRef"
        />
        <canvas ref="mainCanvas" :width="size" :height="size" class="responsive-canvas"></canvas>
      </div>
      <div class="text-caption q-mt-md text-center">支持实时预览及图片合成</div>
    </div>
  </q-tab-panel>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

defineProps({
  singleText: Object,
  size: Object,
  level: Object,
  foreground: Object,
  background: Object,
  logoFile: Object,
  qrcodeRef: Object,
  mainCanvas: Object,
  refreshCanvas: Function,
  handleLogoUpload: Function,
  clearLogo: Function,
  downloadQR: Function,
  copyQRImage: Function,
})
</script>
