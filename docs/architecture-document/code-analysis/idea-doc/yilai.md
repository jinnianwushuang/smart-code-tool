---
title: 核心依赖清单
order: 54
---

这为了让你的项目快速起步，这里为你准备了 **重量客户端（Electron + Vue 3 + Rust）** 和 **轻量服务端（NestJS）** 的核心依赖清单。

## 1. 客户端：`package.json` (Electron + Vue 3 + Quasar)

这是前端 UI 与 Electron 壳子的核心配置。

```json
{
  "name": "code-analysis-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "quasar dev -m electron",
    "build": "quasar build -m electron",
    "artifacts:build": "napi build --release"
  },
  "dependencies": {
    "@quasar/extras": "^1.0.0",
    "quasar": "^2.0.0",
    "vue": "^3.0.0",
    "pinia": "^2.0.0",
    "axios": "^1.0.0",
    "echarts": "^5.0.0",
    "@antv/g6": "^4.0.0"
  },
  "devDependencies": {
    "@quasar/app-vite": "^1.0.0",
    "@napi-rs/cli": "^2.0.0",
    "electron": "^28.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## 2. 客户端计算引擎：`Cargo.toml` (Rust + NAPI-RS)

这是 Rust 核心解析引擎的依赖，包含了高性能解析器 **Oxc** 和并发库。

```toml
[package]
name = "analysis-engine"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
# NAPI-RS 桥接
napi = { version = "2.12.2", default-features = false, features = ["napi4"] }
napi-derive = "2.12.2"

# 高性能代码解析 (Oxc)
oxc_parser = "0.13.0"
oxc_allocator = "0.13.0"
oxc_ast = "0.13.0"
oxc_semantic = "0.13.0"

# 并发与 IO
rayon = "1.8.0"       # 多线程并行扫描
walkdir = "2.4.0"     # 快速目录遍历
serde = { version = "1.0", features = ["derive"] } # 序列化上报数据
serde_json = "1.0"

[build-dependencies]
napi-build = "2.0.1"
```

---

## 3. 服务端：`package.json` (NestJS)

这是负责接收数据、存储报表的轻量化后端。

```json
{
  "name": "code-analysis-server",
  "version": "1.0.0",
  "scripts": {
    "start:dev": "nest start --watch"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "puppeteer": "^22.0.0",
    "class-validator": "^0.14.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.1.0"
  }
}
```

---

## 💡 核心启动建议：

1. **Rust 模块初始化**：先进入客户端目录运行 `napi create`，选择你的项目名称，这会生成基础的 Rust 编译环境。
2. **Quasar 桥接**：在 `src-electron/electron-main.js` 中，使用 `require` 引入 Rust 编译后的 `.node` 文件，并通过 `ipcMain` 将方法暴露给 Vue 页面。
3. **CI/CD 预留**：Rust 编译后的二进制文件在不同系统（Win/Mac）下后缀不同，建议在工程初期就建立好 **GitHub Actions** 或本地编译脚本，确保多端可用。

**环境依赖已经齐备，您需要我为您展示一段 Rust 调用 Oxc 解析器提取代码复杂度的核心逻辑代码吗？**
