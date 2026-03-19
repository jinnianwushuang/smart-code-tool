<script setup>
import { ref, computed } from 'vue'
import {
  SearchOutlined,
  FilePdfOutlined,
  CopyOutlined,
  BugOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import Fuse from 'fuse.js'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// --- 1. 核心数据库：状态码、含义及开发场景 ---
const httpStatusDb = [
  {
    code: 200,
    title: 'OK',
    desc: '请求成功',
    color: '#52c41a',
    scenario: 'Axios: response.status === 200。数据正常返回，业务逻辑正常。',
  },
  {
    code: 201,
    title: 'Created',
    desc: '已创建',
    color: '#52c41a',
    scenario: 'RESTful: POST 请求成功创建资源（如注册、新增条目）。',
  },
  {
    code: 400,
    title: 'Bad Request',
    desc: '请求参数错误',
    color: '#faad14',
    scenario: '前端传参类型不符或缺少必填项。检查 Axios 传的 params 或 data。',
  },
  {
    code: 401,
    title: 'Unauthorized',
    desc: '未授权',
    color: '#ff4d4f',
    scenario: 'Vue 拦截器: Token 过期或 Header 缺少 Authorization。需跳转登录页。',
  },
  {
    code: 403,
    title: 'Forbidden',
    desc: '禁止访问',
    color: '#ff4d4f',
    scenario: '权限系统: 已登录但无此操作权限（RBAC 权限不足）。',
  },
  {
    code: 404,
    title: 'Not Found',
    desc: '资源不存在',
    color: '#ff4d4f',
    scenario: '路径错误: 检查请求 URL 是否拼写错误，或后端路由未定义。',
  },
  {
    code: 405,
    title: 'Method Not Allowed',
    desc: '方法不允许',
    color: '#faad14',
    scenario: '开发错误: 接口要求 POST，你用了 GET。',
  },
  {
    code: 422,
    title: 'Unprocessable Entity',
    desc: '语义错误/验证失败',
    color: '#faad14',
    scenario: '表单校验: 后端返回的具体字段验证失败提示。',
  },
  {
    code: 500,
    title: 'Internal Error',
    desc: '服务器内部错误',
    color: '#722ed1',
    scenario: '后端崩溃: 后端代码报错（空指针、数据库异常等）。',
  },
  {
    code: 502,
    title: 'Bad Gateway',
    desc: '网关错误',
    color: '#722ed1',
    scenario: '运维问题: Nginx 找不到后端服务，或服务程序已挂。',
  },
  {
    code: 503,
    title: 'Service Unavailable',
    desc: '服务过载/维护',
    color: '#722ed1',
    scenario: '系统限流或临时停机维护。',
  },
  {
    code: 504,
    title: 'Gateway Timeout',
    desc: '网关超时',
    color: '#722ed1',
    scenario: '性能问题: 后端查询太慢，超过了代理服务器的超时限制。',
  },
]

// --- 2. 搜索逻辑 (Fuse.js) ---
const searchText = ref('')
const pdfArea = ref(null)
const isExporting = ref(false)

const fuse = new Fuse(httpStatusDb, {
  keys: ['code', 'title', 'desc'],
  threshold: 0.3,
})

const filteredStatus = computed(() => {
  if (!searchText.value) return httpStatusDb
  return fuse.search(searchText.value).map((r) => r.item)
})

// --- 3. 操作方法 ---
const copyCode = (code) => {
  navigator.clipboard.writeText(code.toString())
  message.success(`状态码 ${code} 已复制`)
}

const downloadPdf = async () => {
  if (filteredStatus.value.length === 0) return
  isExporting.value = true
  const hide = message.loading('正在生成 PDF...', 0)

  try {
    const element = pdfArea.value
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.text('HTTP Status Manual - DevTools', 10, 10)
    pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight)
    pdf.save(`HTTP_Manual_${new Date().getTime()}.pdf`)
    message.success('PDF 导出成功')
  } catch (err) {
    message.error('导出失败')
  } finally {
    isExporting.value = false
    hide()
  }
}
</script>

<template>
  <div class="manual-wrapper">
    <a-card :bordered="false" class="manual-card">
      <template #title>
        <div class="header-flex">
          <span class="title-text"><InfoCircleOutlined /> HTTP 状态码开发手册</span>
          <a href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status"
            >MDN HTTP 响应状态码</a
          >
          <a-button type="primary" danger @click="downloadPdf" :loading="isExporting">
            <template #icon><FilePdfOutlined /></template>导出 PDF
          </a-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索代码(如404)或关键词(如'权限')..."
          size="large"
          allow-clear
        >
          <template #prefix><SearchOutlined style="color: #bfbfbf" /></template>
        </a-input-search>
      </div>

      <!-- 列表区域 (PDF 导出引用此 DOM) -->
      <div ref="pdfArea" class="status-list">
        <div v-if="filteredStatus.length === 0" class="empty-box">
          <a-empty description="未找到相关状态码" />
        </div>

        <div
          v-for="item in filteredStatus"
          :key="item.code"
          class="status-item"
          :style="{ borderLeftColor: item.color }"
        >
          <div class="item-main">
            <div class="code-badge" :style="{ backgroundColor: item.color }">
              {{ item.code }}
            </div>
            <div class="info-zone">
              <div class="name-row">
                <span class="status-name">{{ item.title }}</span>
                <span class="status-desc">{{ item.desc }}</span>
              </div>
              <div class="scenario-card">
                <div class="scenario-tag"><BugOutlined /> 开发实战场景:</div>
                <div class="scenario-text">{{ item.scenario }}</div>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <a-button type="text" @click="copyCode(item.code)">
              <template #icon><CopyOutlined /></template>
            </a-button>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.manual-wrapper {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.manual-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-bar {
  margin-bottom: 24px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-left-width: 5px;
  border-radius: 4px 8px 8px 4px;
  transition: all 0.3s;
}

.status-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.item-main {
  display: flex;
  gap: 20px;
  flex: 1;
}

.code-badge {
  color: #fff;
  font-family: 'Monaco', monospace;
  font-size: 22px;
  font-weight: bold;
  height: fit-content;
  padding: 4px 12px;
  border-radius: 6px;
  min-width: 70px;
  text-align: center;
}

.name-row {
  margin-bottom: 10px;
}
.status-name {
  font-size: 18px;
  font-weight: bold;
  color: #262626;
  margin-right: 12px;
}
.status-desc {
  color: #8c8c8c;
  font-size: 14px;
}

.scenario-card {
  background: #fafafa;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px dashed #e8e8e8;
}

.scenario-tag {
  font-size: 12px;
  color: #595959;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.scenario-text {
  color: #434343;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.footer-note {
  margin-top: 32px;
  padding: 12px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  color: #0050b3;
}

code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.empty-box {
  padding: 40px 0;
}
</style>
