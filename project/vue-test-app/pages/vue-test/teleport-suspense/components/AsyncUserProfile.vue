<template>
  <div class="async-user-profile">
    <div class="profile-header">
      <div class="profile-avatar">{{ user.avatar }}</div>
      <div class="profile-info">
        <div class="profile-name">{{ user.name }}</div>
        <div class="profile-role">{{ user.role }}</div>
      </div>
      <a-tag color="green">✓ 已加载</a-tag>
    </div>

    <div class="profile-stats">
      <div v-for="stat in statList" :key="stat.label" class="stat-item">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <div class="profile-bio">{{ user.bio }}</div>

    <div class="profile-hint">
      ✅ 数据已就绪 —— 此组件的 <code>&lt;script setup&gt;</code> 使用了顶层
      <code>await</code>，Suspense 自动处理了加载状态，无需任何 loading 变量
    </div>
  </div>
</template>

<script setup>
// ⚡ 顶层 await —— 必须由 <Suspense> 包裹才能正常渲染
// 模拟一个耗时 2s 的接口请求
const user = await new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      name: '张三',
      role: '高级前端工程师 · Vue.js 方向',
      avatar: '👨‍💻',
      bio: '专注于 Vue 3 生态与前端工程化，热爱开源，喜欢在代码中寻找优雅。曾主导多个大型 SPA 项目的架构设计与性能优化。',
      stats: { projects: 42, commits: 1337, reviews: 256 },
    })
  }, 2000)
})

const statList = [
  { label: '参与项目', value: user.stats.projects },
  { label: '代码提交', value: user.stats.commits },
  { label: '代码审查', value: user.stats.reviews },
]
</script>

<style scoped>
.async-user-profile {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.profile-avatar {
  font-size: 36px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f4ff, #f0f5ff);
  border-radius: 50%;
  flex-shrink: 0;
}
.profile-info {
  flex: 1;
}
.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}
.profile-role {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}
.profile-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.stat-item {
  flex: 1;
  text-align: center;
  padding: 10px 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1677ff;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.profile-bio {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #1677ff;
  margin-bottom: 12px;
}
.profile-hint {
  font-size: 12px;
  color: #52c41a;
  line-height: 1.6;
}
.profile-hint code {
  background: #f0fff0;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

/* 暗色模式 */
body.body--dark .async-user-profile {
  background: #1e1e1e;
  border-color: #333;
}
body.body--dark .profile-avatar {
  background: linear-gradient(135deg, #112a45, #0e305a);
}
body.body--dark .profile-name {
  color: #eee;
}
body.body--dark .profile-role {
  color: #888;
}
body.body--dark .stat-item {
  background: #2a2a2a;
  border-color: #3a3a3a;
}
body.body--dark .profile-bio {
  background: #2a2a2a;
  color: #aaa;
  border-left-color: #3b82f6;
}
body.body--dark .profile-hint {
  color: #4ade80;
}
body.body--dark .profile-hint code {
  background: #0d2b0d;
}
</style>
