<template>
  <a-config-provider :theme="antTheme" :locale="antLocale">
    <RouterView />
  </a-config-provider>
</template>
<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// --- 1. 全局主题切换逻辑 ---
// 自动响应 Quasar 的深色模式状态并同步给 Ant Design Vue
const antTheme = computed(() => ({
  algorithm: $q.dark.isActive ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    // 你可以在这里统一配置 Ant Design 的品牌色
    // colorPrimary: '#1976d2',
  },
}))

// --- 2. 国际化切换逻辑 ---
// currentLocale 可以后续接入 Pinia 或 localStorage 实现持久化
const currentLocale = ref('zh')

const antLocale = computed(() => {
  return currentLocale.value === 'en' ? enUS : zhCN
})

// 暴露给全局的切换方法（如果需要）
const toggleLanguage = () => {
  currentLocale.value = currentLocale.value === 'zh' ? 'en' : 'zh'
  // 同步切换 Quasar 的语言包 (如果已配置)
  // $q.lang.set(currentLocale.value === 'zh' ? 'zh-CN' : 'en-US')
}

onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>
<style lang="scss">
// 全局样式微调
</style>

<style lang="scss" scoped></style>
