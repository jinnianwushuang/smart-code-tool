# ComfyUI 工作流

> 这是程序员在 AIGC 领域最大的优势所在。

---

## 一、ComfyUI 是什么？

ComfyUI 是一个**节点式**的 AI 图像工作流工具。

不用写代码，通过拖拽节点、连线来搭建图像处理流程。

```
传统方式：打开 PS → 手动操作 → 导出
ComfyUI：搭建工作流 → 一键运行 → 批量输出
```

---

## 二、为什么程序员应该学 ComfyUI

| 普通人             | 程序员                          |
| ------------------ | ------------------------------- |
| 看到节点界面 → 懵  | 看到节点界面 → 这不就是数据流吗 |
| 需要理解"节点思维" | 天生就有节点思维                |
| 只能手动操作       | 能写 API 自动化                 |
| 一个工作流用很久   | 快速迭代优化工作流              |

---

## 三、核心概念

### 节点类型

| 节点             | 作用                         | 前端类比      |
| ---------------- | ---------------------------- | ------------- |
| Load Checkpoint  | 加载 AI 模型                 | import 依赖   |
| CLIP Text Encode | 把提示词转为模型能理解的向量 | 参数序列化    |
| KSampler         | 采样器，核心生成引擎         | render 函数   |
| VAE Decode       | 把潜空间数据解码为图片       | 编译器        |
| Save Image       | 保存图片到本地               | fs.writeFile  |
| Load Image       | 加载本地图片                 | fs.readFile   |
| ControlNet       | 精准控制生成内容             | 中间件/拦截器 |

### 最小工作流

```
┌─────────────────┐
│ Load Checkpoint  │──→ CLIP Encode (正向) ──→ ┐
│  (加载模型)      │                            │
└─────────────────┘                            ├─→ KSampler → VAE Decode → Save Image
┌─────────────────┐                            │
│ CLIP Text Encode │──→ (负向提示词) ──────────→ ┘
│  (负面提示词)    │
└─────────────────┘
```

---

## 四、安装

### 方案 1：comfy-cli 命令行工具（⭐⭐ 最推荐，开发者首选）

**comfy-cli 是什么**：ComfyUI 官方命令行工具，一行命令完成安装、启动、更新、插件管理，支持云端运行。

**核心优势**：
- 🚀 一行命令安装启动
- 🔧 自动管理 Python 环境和依赖
- 📦 一键安装/更新自定义节点
- ☁️ 支持云端运行（无需本地 GPU）
- 🤖 AI 助手友好（支持 JSON 输出）
- 💻 跨平台（Windows / macOS / Linux）

**安装步骤**：
```bash
# 1. 安装 comfy-cli（需要 Python 3.10+）
pip install comfy-cli

# 2. 交互式安装（推荐新手）
comfy setup
# 按提示选择：本地/云端、GPU 类型、安装路径等

# 3. 或者一键安装
comfy install

# 4. 启动 ComfyUI
comfy launch

# 5. 访问：http://127.0.0.1:8188
```

**常用命令**：
```bash
# 安装与管理
comfy install                    # 安装 ComfyUI
comfy update                     # 更新到最新版
comfy update comfy --version 0.3.0  # 切换到指定版本
comfy launch                     # 启动
comfy launch --background        # 后台启动

# 自定义节点管理
comfy node install comfyui-impact-pack    # 安装节点
comfy node update all                     # 更新所有节点
comfy node show installed                 # 查看已安装节点

# 模型管理
comfy model download --url <URL>          # 下载模型
comfy model list                          # 列出模型

# 云端运行（无需本地 GPU）
comfy cloud login                         # 登录云端账号
comfy run --workflow workflow.json --where cloud  # 云端运行工作流
comfy jobs wait <prompt_id> --where cloud       # 等待任务完成
comfy download <prompt_id> --where cloud        # 下载结果

# 环境检查
comfy env                              # 查看环境信息
comfy system-stats                     # 查看 VRAM/RAM 使用
```

**Shell 自动补全**：
```bash
# 安装命令自动补全
comfy --install-completion
```

**注意事项**：
- ✅ 推荐使用虚拟环境（venv 或 conda）
- ✅ 默认安装路径：`~/comfy`
- ✅ 支持快速依赖解析：`comfy install --fast-deps`

---

### 方案 2：官方便携版（⭐ 推荐，新手友好）

**优势**：自带独立 Python 环境，不跟系统冲突，解压即用，永远保持最新版。

**下载地址**（二选一）：
- GitHub 发布页：https://github.com/comfyanonymous/ComfyUI/releases
  - 选择 `ComfyUI_windows_portable_nvidia.7z`（约 7GB）
- 国内镜像：搜索"YanWenKun ComfyUI 便携包"

**显卡选择**：
| 显卡 | 下载版本 |
|------|----------|
| RTX 20/30/40/50 系 | 标准 nvidia 版（CUDA 13.0 + Python 3.13） |
| GTX 10 系或更老 | cu126 旧版（CUDA 12.6 + Python 3.12） |

**安装步骤**：
```bash
# 1. 用 7-Zip 解压到英文路径（不要有中文！）
#    例如：D:\AI\ComfyUI_windows_portable

# 2. 目录结构
ComfyUI_windows_portable/
├── ComfyUI/              # 主程序目录
├── python_embeded/       # 独立 Python 环境（不要动）
├── run_cpu.bat           # 无独显时使用
└── run_nvidia_gpu.bat    # NVIDIA 显卡双击这个

# 3. 双击 run_nvidia_gpu.bat 启动
# 4. 浏览器访问：http://127.0.0.1:8188
```

**注意事项**：
- ❌ 不要放在桌面、C 盘、中文路径
- ✅ 解压路径纯英文，如 `D:\AI\ComfyUI`
- ✅ 首次启动会下载依赖，保持网络连接

---

### 方案 3：官方桌面版（⭐ 最简单，适合纯新手）

**特点**：图形化安装界面，一键安装，内置 ComfyUI Manager。

**下载**：
- 访问 https://www.comfy.org/download
- 选择对应系统版本（Windows / macOS / Linux）

**安装**：
```bash
# Windows
1. 双击安装包
2. 选择安装路径（建议 D 盘，预留 300GB+ 空间）
3. 点击"安装"，等待完成
4. 桌面双击 ComfyUI 图标启动
5. 首次启动选择 GPU 类型（NVIDIA CUDA）
```

**优势**：
- 自动配置环境
- 内置 Manager 插件管理器
- 自动更新机制
- 可视化启动器

---

### 方案 4：源码安装（适合高级开发者）

```bash
# 1. 安装 Python 3.10+
# 2. 克隆仓库
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# 3. 创建虚拟环境（推荐）
python -m venv venv
# Windows 激活：venv\Scripts\activate
# macOS/Linux 激活：source venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt

# 5. 下载模型放到 models/checkpoints/ 目录
# 推荐新手模型：
# - SDXL: sd_xl_base_1.0.safetensors
# - Flux: flux1-dev.safetensors（新架构，效果更好）

# 6. 启动
python main.py
# 访问：http://127.0.0.1:8188
```

---

### 方案 5：秋叶整合包（Windows 备选）

**适用人群**：一看命令行就头疼的纯新手。

**获取方式**：
- B 站搜索"秋叶 ComfyUI 整合包"
- 下载解压即用，内置启动器

**注意**：
- ⚠️ 认准作者：秋叶（aki）
- ⚠️ 通过官方渠道下载，避免第三方篡改版本
- ⚠️ 当前最新版本：aki-V3.7（2026 年）

---

### Mac 用户

```bash
# 方案 A：使用桌面版（推荐）
# 直接下载 macOS 版本，拖入应用程序文件夹

# 方案 B：源码安装
# 1. 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装依赖
brew install python@3.10
pip3 install torch torchvision torchaudio

# 3. 克隆并启动
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip3 install -r requirements.txt
python3 main.py --force-fp16  # Mac 必须加 --force-fp16
```

**Mac 注意事项**：
- M1/M2/M3 芯片：原生支持，性能优秀
- Intel 芯片：较慢，建议 16GB+ 内存
- 必须使用 `--force-fp16` 参数

---

### 云端方案（无显卡/低配电脑）

如果本地配置太低，可以使用云端服务：
- **Google Colab**：免费 GPU，需科学上网
- **AutoDL**：国内平台，按小时计费
- **趋动云**：新用户有免费算力

---

### 安装后必做：安装 ComfyUI Manager

**Manager 是什么**：ComfyUI 的"应用商店"，一键安装缺失节点和插件。

**安装方法**：
```bash
# 方法 1：通过 Git 安装（推荐）
cd ComfyUI/custom_nodes
git clone https://github.com/Comfy-Org/ComfyUI-Manager.git
cd comfyui-manager
pip install -r requirements.txt

# 方法 2：便携版用户
# 下载 install-manager-for-portable-version.bat
# 放到 ComfyUI_windows_portable 目录
# 双击运行即可

# 方法 3：桌面版
# 通常已内置，在菜单找 "Manage Extensions"
```

**Manager 功能**：
- 自动检测缺失节点
- 一键安装/更新插件
- 工作流导入导出
- 模型管理器

---

## 五、基础工作流搭建

### 文生图（最基础）

```
步骤：
1. Load Checkpoint → 选择模型
2. CLIP Text Encode (正向) → 写你要生成的
3. CLIP Text Encode (负向) → 写你不想要的
4. Empty Latent Image → 设置图片尺寸
5. KSampler → 设置采样参数
6. VAE Decode → 解码
7. Save Image → 保存

参数建议：
- steps: 20-30
- cfg: 7
- sampler: euler
- scheduler: normal
```

### 图生图

```
在文生图基础上：
1. 把 Empty Latent Image 换成 Load Image
2. 添加 Image to Latent 节点
3. 调整 denoise 强度（0.3-0.7）
```

---

## 六、ControlNet — 精准控制

ControlNet 是 ComfyUI 最强大的能力之一。

| ControlNet 类型 | 作用         | 应用场景       |
| --------------- | ------------ | -------------- |
| OpenPose        | 控制人物姿态 | 写真、电商模特 |
| Depth           | 控制深度信息 | 建筑、室内     |
| Canny           | 控制边缘轮廓 | 产品图、Logo   |
| Scribble        | 从草图生成   | 设计概念图     |
| Style           | 控制风格     | 风格迁移       |

---

## 七、商业工作流模板

### 电商产品主图工作流

```
输入：产品白底图
处理：
1. Load Image → 加载产品图
2. Segment Anything → 自动抠图
3. 背景替换 → 生成场景背景
4. 光影融合 → 让产品和背景自然融合
5. 高清放大 → 输出 3000x3000
输出：电商主图
```

### AI 写真工作流

```
输入：一张面部照片
处理：
1. Face Detection → 检测面部
2. IPAdapter Face → 保持面部特征
3. OpenPose → 控制姿态
4. 风格化 → 应用写真风格
5. 高清修复 → 提升画质
输出：一套写真（多张）
```

---

## 八、API 自动化（程序员专属）

```javascript
// ComfyUI 提供了 REST API
const prompt = {
  3: {
    class_type: 'KSampler',
    inputs: {
      cfg: 7,
      denoise: 1,
      latent_image: ['5', 0],
      model: ['4', 0],
      negative: ['7', 0],
      positive: ['6', 0],
      sampler_name: 'euler',
      scheduler: 'normal',
      seed: 8566257,
      steps: 20,
    },
  },
  // ... 其他节点
}

// 批量生成
for (const product of products) {
  prompt['6'].inputs.text = `product shot of ${product.name}`
  await fetch('http://127.0.0.1:8188/prompt', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
}
```

---

## 下一篇

[04-ControlNet精准控制](./04-ControlNet精准控制.md) — 不再"抽卡"，精准控制每一张图。
