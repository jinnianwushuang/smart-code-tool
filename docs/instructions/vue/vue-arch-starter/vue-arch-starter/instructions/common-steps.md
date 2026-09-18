# 通用步骤

> 以下步骤被多个任务指令复用。任务指令通过引用步骤编号来调用。

## Step A：确认配置

1. 读取 `config.md`，检查所有必填项
2. 如有缺失，列出缺失项并请用户补充
3. 确认 `ui_framework` 选择，后续步骤据此调整

## Step B：安装依赖

1. 读取 `code-template/dependencies.md`
2. 根据 `config.md` 中的 `ui_framework` 和 `package_manager` 生成安装命令
3. 输出安装命令供用户执行

```
# 示例输出（pnpm + quasar）：
pnpm add vue vue-router mitt change-case quasar @quasar/vite-plugin ant-design-vue
pnpm add -D vite @vitejs/plugin-vue sass-embedded
```

## Step C：复制代码

1. 将 `code-template/` 目录下的所有内容复制到项目 `src/` 目录
2. 确认目录结构正确：
   ```
   src/
   ├── standardization/
   ├── common/
   ├── composable/
   └── css/
   ```

## Step D：配置 Vite

1. 参考 `code-template/vite.config.template.js`
2. 确保 `resolve.alias` 中有 `src` 指向项目 src 目录
3. 如使用 Quasar，配置 quasar 插件的 `sassVariables`
4. 如使用 Element Plus，替换为对应插件配置

## Step E：验证集成

1. 建议用户在路由中添加一个测试路由，指向 `standardization/multiton-template/index.vue`
2. 启动开发服务器
3. 访问测试页面，确认装配器正常工作
4. 确认无控制台报错

## Step F：清理验证页面

1. 集成验证通过后，删除或替换 `component-demo/` 验证页面
2. 清理测试路由
3. 开始开发实际业务组件
