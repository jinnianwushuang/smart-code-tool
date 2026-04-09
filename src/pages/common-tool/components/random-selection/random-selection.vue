<template>
  <div class="q-pa-md bg-grey-1">
    <div class="row q-col-gutter-md justify-center">
      <!-- 左侧：治理与抽取控制 -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-2">
          <q-card-section class="bg-indigo-9 text-white row items-center">
            <q-icon name="fact_check" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">随机抽取</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <!-- 原始输入 -->
            <q-input
              v-model="rawInput"
              type="textarea"
              filled
              label="1. 原始数据输入"
              placeholder="粘贴任意包含分隔符的内容..."
              rows="5"
              @update:model-value="processAll"
            />

            <!-- 治理配置 -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="blacklistInput"
                  dense
                  filled
                  label="黑名单 (排除项)"
                  placeholder="屏蔽这些项"
                  type="textarea"
                  rows="2"
                  @update:model-value="processAll"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="whitelistInput"
                  dense
                  filled
                  label="白名单 (准入项)"
                  placeholder="仅从中抽取"
                  type="textarea"
                  rows="2"
                  @update:model-value="processAll"
                />
              </div>
            </div>

            <!-- [核心增强] 标准预览、一键复制、多格式导出 -->
            <div
              v-if="processedList.length > 0"
              class="bg-indigo-0 q-pa-sm rounded-borders border-indigo-1"
            >
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-indigo-9 text-weight-bold">
                  标准数据预览 (共 {{ processedList.length }} 项):
                </div>
                <div class="row q-gutter-x-xs">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    size="sm"
                    icon="content_copy"
                    label="复制"
                    @click="copy(processedList.join(', '))"
                  >
                    <q-tooltip>以逗号分隔复制</q-tooltip>
                  </q-btn>
                  <!-- 导出菜单 -->
                  <q-btn-dropdown
                    flat
                    dense
                    color="indigo-7"
                    size="sm"
                    icon="download"
                    label="导出标准项"
                  >
                    <q-list style="min-width: 120px">
                      <q-item clickable v-close-popup @click="exportStandard('txt')">
                        <q-item-section avatar
                          ><q-icon name="description" color="grey-8"
                        /></q-item-section>
                        <q-item-section>导出 .txt (每行一项)</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="exportStandard('csv')">
                        <q-item-section avatar
                          ><q-icon name="grid_on" color="green-7"
                        /></q-item-section>
                        <q-item-section>导出 .csv (Excel单列)</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
              <div class="row q-gutter-xs overflow-hidden" style="max-height: 60px">
                <q-badge v-for="item in processedList" :key="item" outline color="indigo-4">{{
                  item
                }}</q-badge>
              </div>
            </div>

            <div class="row q-col-gutter-sm items-center">
              <div class="col-4">
                <q-input
                  v-model.number="drawCount"
                  type="number"
                  filled
                  label="抽取数"
                  dense
                  :max="processedList.length"
                />
              </div>
              <div class="col-8">
                <q-btn
                  class="full-width"
                  color="primary"
                  label="执行随机抽取"
                  icon="bolt"
                  :disable="!processedList.length || drawCount <= 0"
                  @click="doDraw"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 结果展示 -->
        <q-card
          v-if="drawResults.length"
          flat
          bordered
          class="q-mt-md bg-amber-1 border-amber animate__animated animate__fadeIn"
        >
          <q-card-section class="row items-center">
            <div class="text-h6 text-amber-10 text-weight-bold">
              🎉 结果: {{ drawResults.join(' / ') }}
            </div>
            <q-space />
            <q-btn
              flat
              round
              icon="content_copy"
              color="amber-10"
              @click="copy(drawResults.join('、'))"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：快照库 -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="full-height-card shadow-1">
          <q-card-actions class="bg-grey-3 q-mb-md">
            <q-input v-model="libName" dense filled label="快照名称" class="col q-mr-sm" />
            <q-btn
              color="indigo"
              label="保存快照"
              icon="save"
              @click="saveToDB"
              :disable="!processedList.length"
            />
          </q-card-actions>
          <q-card-section class="bg-blue-grey-9 text-white row items-center">
            <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
            <span>治理快照库</span>
            <q-space />
            <q-btn flat dense icon="file_upload" @click="triggerImport"
              ><q-tooltip>恢复备份</q-tooltip></q-btn
            >
            <q-btn flat dense icon="file_download" @click="exportHistory"
              ><q-tooltip>备份全库</q-tooltip></q-btn
            >
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept=".json"
              @change="handleFileRestore"
            />
          </q-card-section>

          <q-card-section class="scroll-area">
            <q-list separator>
              <q-item
                v-for="item in historyList"
                :key="item.id"
                clickable
                v-ripple
                @click="loadFromHistory(item)"
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-primary">{{ item.name }}</q-item-label>
                  <q-item-label caption lines="1"
                    >标准数据: {{ item.standardData.length }} 项</q-item-label
                  >
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="grey-3"
                    size="sm"
                    @click.stop="deleteHistory(item.id)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { useQuasar, copyToClipboard, exportFile } from 'quasar'
import Dexie from 'dexie'

const $q = useQuasar()
const db = new Dexie('FinalDataGovernanceDB')
db.version(1).stores({ history: '++id, name, time' })

const rawInput = ref('')
const blacklistInput = ref('')
const whitelistInput = ref('')
const processedList = ref([])
const drawCount = ref(1)
const drawResults = ref([])
const libName = ref('')
const historyList = ref([])
const fileInput = ref(null)

const splitText = (text) => {
  if (!text) return []
  const regex = /[,，:："'““”‘’”;；\s\n]+/
  return [
    ...new Set(
      text
        .split(regex)
        .map((i) => i.trim())
        .filter((i) => i.length > 0),
    ),
  ]
}

const processAll = () => {
  const raw = splitText(rawInput.value)
  const black = splitText(blacklistInput.value)
  const white = splitText(whitelistInput.value)
  let result = raw.filter((item) => !black.includes(item))
  if (white.length > 0) result = result.filter((item) => white.includes(item))
  processedList.value = result
}

// [新增] 按格式导出标准项函数
const exportStandard = (type) => {
  if (processedList.value.length === 0) return

  let content = ''
  let fileName = `standard_data_${Date.now()}`
  let mimeType = 'text/plain'

  if (type === 'txt') {
    content = processedList.value.join('\r\n') // 每行一项
    fileName += '.txt'
  } else if (type === 'csv') {
    // CSV 格式：添加 BOM 头防止 Excel 打开乱码，并在首行加标题
    const header = 'Standard_Item\n'
    content = header + processedList.value.join('\n')
    fileName += '.csv'
    mimeType = 'text/csv'
  }

  const status = exportFile(fileName, content, mimeType)
  if (status === true) {
    $q.notify({ message: `成功导出 ${processedList.value.length} 条数据`, color: 'positive' })
  }
}

const doDraw = () => {
  const pool = [...processedList.value]
  const count = Math.min(drawCount.value, pool.length)
  const picked = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1))
  }
  drawResults.value = picked
}

const saveToDB = async () => {
  const name = libName.value || `快照_${new Date().toLocaleTimeString()}`

  try {
    await db.history.add({
      name,
      // 2. 使用 toRaw 或 [...array] 强制转换 Proxy 为普通数组
      originalRaw: rawInput.value,
      standardData: toRaw(processedList.value),
      blacklist: toRaw(splitText(blacklistInput.value)),
      whitelist: toRaw(splitText(whitelistInput.value)),
      time: Date.now(),
    })

    libName.value = ''
    await refreshHistory()
    $q.notify({ message: '治理状态已保存', color: 'positive' })
  } catch (error) {
    console.error('存储失败:', error)
    $q.notify({ message: '存储失败: 数据无法被克隆', color: 'negative' })
  }
}

const loadFromHistory = (item) => {
  rawInput.value = item.originalRaw || item.standardData.join(', ')
  blacklistInput.value = item.blacklist?.join(', ') || ''
  whitelistInput.value = item.whitelist?.join(', ') || ''
  processAll()
  $q.notify({ message: '已载入历史快照', color: 'info' })
}

const refreshHistory = async () => {
  historyList.value = await db.history.reverse().toArray()
}
const deleteHistory = async (id) => {
  await db.history.delete(id)
  refreshHistory()
}
const triggerImport = () => fileInput.value.click()
const handleFileRestore = (e) => {
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      await db.history.bulkAdd(data.map(({ id, ...rest }) => rest))
      refreshHistory()
    } catch {
      $q.notify({ message: '解析失败', color: 'negative' })
    }
  }
  reader.readAsText(e.target.files)
}

const exportHistory = () =>
  exportFile(
    `governance_backup.json`,
    JSON.stringify(historyList.value, null, 2),
    'application/json',
  )
const copy = (txt) =>
  copyToClipboard(txt).then(() => $q.notify({ message: '已复制到剪贴板', color: 'indigo' }))

onMounted(refreshHistory)
</script>

<style scoped>
.full-height-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
}
.border-amber {
  border: 2px dashed #ffa000;
}
.border-indigo-1 {
  border: 1px solid #e8eaf6;
}
.rounded-borders {
  border-radius: 8px;
}
.bg-indigo-0 {
  background: #f5f7ff;
}
</style>
