<template>
  <q-card flat bordered class="shadow-2 sticky-card transition-base">
    <!-- 面板头部 -->
    <q-card-section class="bg-indigo-8 text-white row items-center q-py-sm">
      <q-icon name="assignment" size="xs" class="q-mr-xs" />
      <div class="text-subtitle2">备注管理</div>
      <q-space />
      <q-badge :color="noteCount >= 55 ? 'red' : 'cyan-3'" text-color="black">
        {{ noteCount }} / 60
      </q-badge>
    </q-card-section>

    <!-- 选中日期信息 + 内联编辑 -->
    <q-card-section class="q-pb-sm">
      <div class="selected-date-header row items-center q-mb-sm">
        <q-badge color="indigo" :label="selectedDateStr" class="q-mr-sm" />
        <span class="text-caption text-grey-6">{{ lunarDetail }}</span>
      </div>

      <q-input
        :model-value="editContent"
        @update:model-value="$emit('update:editContent', $event)"
        type="textarea"
        filled
        dense
        placeholder="输入备注后点击保存，或 Ctrl+Enter..."
        rows="3"
        maxlength="100"
        counter
        @keydown="$emit('editor-keydown', $event)"
      />
      <div class="row justify-end q-gutter-x-sm q-mt-sm">
        <q-btn
          flat
          dense
          size="sm"
          label="清空"
          @click="$emit('update:editContent', '')"
          color="grey"
        />
        <q-btn
          flat
          dense
          size="sm"
          label="保存"
          icon="save"
          color="indigo"
          @click="$emit('save')"
        />
      </div>
    </q-card-section>

    <q-separator />

    <!-- 近期提醒 -->
    <q-card-section class="q-py-sm" v-if="upcomingNotes.length > 0">
      <div class="text-caption text-grey-6 q-mb-xs row items-center">
        <q-icon name="notifications_active" size="xs" class="q-mr-xs" />
        近期提醒（未来 7 天）
      </div>
      <div
        v-for="item in upcomingNotes"
        :key="item.date"
        class="upcoming-item cursor-pointer row items-center q-py-xs"
        @click="$emit('go-to-date', item.date)"
      >
        <q-badge color="orange" :label="item.date.slice(5)" class="q-mr-sm" />
        <span class="text-caption ellipsis">{{ item.content }}</span>
      </div>
    </q-card-section>

    <q-separator />

    <!-- 全部备注列表 -->
    <q-card-section class="q-pt-sm">
      <q-input
        :model-value="searchQuery"
        @update:model-value="$emit('update:searchQuery', $event)"
        placeholder="搜索备注..."
        filled
        dense
        clearable
        class="q-mb-sm"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <div class="scroll-list">
        <a-list item-layout="horizontal" :data-source="filteredNotes" size="small">
          <template #renderItem="{ item }">
            <a-list-item
              class="cursor-pointer note-list-item"
              @click="$emit('go-to-date', item.date)"
            >
              <a-list-item-meta :description="item.content">
                <template #title>
                  <span
                    :class="item.date === selectedDateStr ? 'text-primary text-weight-bold' : ''"
                  >
                    {{ item.date }}
                  </span>
                </template>
              </a-list-item-meta>
              <template #actions>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="grey-4"
                  size="sm"
                  @click.stop="$emit('delete-note', item.date)"
                />
              </template>
            </a-list-item>
          </template>
        </a-list>
        <div v-if="filteredNotes.length === 0" class="text-center text-grey-5 text-caption q-py-md">
          {{ searchQuery ? '无匹配结果' : '暂无备注' }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  selectedDateStr: String,
  lunarDetail: String,
  editContent: String,
  searchQuery: String,
  noteCount: Number,
  upcomingNotes: Array,
  filteredNotes: Array,
})

defineEmits([
  'update:editContent',
  'update:searchQuery',
  'save',
  'editor-keydown',
  'go-to-date',
  'delete-note',
])
</script>

<style scoped>
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.selected-date-header {
  background: rgba(63, 81, 181, 0.05);
  padding: 6px 10px;
  border-radius: 6px;
}

.upcoming-item {
  border-left: 3px solid #ff9800;
  padding-left: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s;
  border-radius: 0 4px 4px 0;
}
.upcoming-item:hover {
  background: rgba(255, 152, 0, 0.08);
}

.scroll-list {
  max-height: calc(100vh - 420px);
  min-height: 200px;
  overflow-y: auto;
}
.sticky-card {
  position: sticky;
  top: 16px;
}
.note-list-item:hover {
  background: rgba(0, 0, 0, 0.02);
}
</style>
