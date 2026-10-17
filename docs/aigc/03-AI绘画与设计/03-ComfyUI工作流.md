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

### 本地安装（推荐）

```bash
# 1. 安装 Python 3.10+
# 2. 克隆仓库
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# 3. 安装依赖
pip install -r requirements.txt

# 4. 下载模型放到 models/checkpoints/ 目录
# 推荐新手模型：sd_xl_base_1.0.safetensors

# 5. 启动
python main.py
```

### 使用秋叶一键整合包（Windows）

搜索"秋叶 ComfyUI 整合包"，下载解压即用。

### Mac 用户

```bash
# Mac 需要额外配置
pip install torch torchvision torchaudio
python main.py --force-fp16
```

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
