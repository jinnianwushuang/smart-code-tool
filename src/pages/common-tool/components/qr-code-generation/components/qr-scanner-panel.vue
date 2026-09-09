<template>
  <q-tab-panel name="scan" class="column items-center q-gutter-y-md">
    <div class="row q-col-gutter-md full-width justify-center">
      <!-- 摄像头扫描 -->
      <div class="col-12 col-md-6">
        <div class="video-box relative-position bg-black rounded-borders overflow-hidden shadow-10">
          <video ref="videoRef" class="full-width full-height object-cover"></video>
          <div class="scanner-line" v-if="isScanning"></div>
        </div>
        <div class="row justify-center q-mt-md">
          <q-btn
            v-if="!isScanning"
            color="primary"
            icon="videocam"
            label="开启摄像头"
            @click="startScanner"
          />
          <q-btn
            v-else
            color="negative"
            icon="videocam_off"
            label="停止扫描"
            @click="stopScanner"
          />
        </div>
      </div>

      <!-- 图片识别 -->
      <div class="col-12 col-md-6">
        <q-file
          v-model="scanFile"
          filled
          label="上传图片识别"
          accept="image/*"
          @update:model-value="scanFromImage"
        >
          <template v-slot:prepend><q-icon name="image" /></template>
        </q-file>
        <canvas ref="imgScanCanvas" class="hidden"></canvas>
      </div>
    </div>

    <q-card v-if="scanResult" flat bordered class="full-width bg-green-1 border-green">
      <q-card-section class="row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">识别结果:</div>
        <q-btn flat dense icon="content_copy" color="primary" @click="copyText(scanResult)" />
      </q-card-section>
      <q-card-section class="q-pt-none font-mono text-break text-body2">{{
        scanResult
      }}</q-card-section>
    </q-card>
  </q-tab-panel>
</template>

<script setup>
defineProps({
  videoRef: Object,
  isScanning: Object,
  scanResult: Object,
  scanFile: Object,
  imgScanCanvas: Object,
  startScanner: Function,
  stopScanner: Function,
  scanFromImage: Function,
  copyText: Function,
})
</script>
