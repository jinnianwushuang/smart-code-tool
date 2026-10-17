# Midjourney 实战

> AI 绘画的"iPhone"——开箱即用，质感天花板。

---

## 一、注册与订阅

| 计划     | 价格   | 适合                      |
| -------- | ------ | ------------------------- |
| Basic    | $10/月 | 入门体验，约 200 张/月    |
| Standard | $30/月 | 日常创作，15 小时快速生成 |
| Pro      | $60/月 | 商业用途，30 小时快速生成 |

> 建议先买 Basic 体验，确定需要再升级

---

## 二、提示词框架

### 基础公式

```
[主体] + [环境/背景] + [构图] + [光线] + [风格] + [质量词]
```

### 实例

```
# 电商产品图
a minimalist perfume bottle on a marble surface, soft studio lighting,
white background, product photography, 8K, commercial quality

# 个人头像
a young man portrait, anime style, warm smile, casual clothes,
soft lighting, pastel colors, avatar

# 小红书封面
a cozy home office desk setup, plants, laptop, coffee cup,
warm afternoon light, lifestyle photography, aesthetic
```

---

## 三、常用参数

| 参数      | 作用       | 示例                                     |
| --------- | ---------- | ---------------------------------------- |
| `--ar`    | 宽高比     | `--ar 1:1`（头像）、`--ar 3:4`（小红书） |
| `--v`     | 模型版本   | `--v 6.1`（最新版）                      |
| `--style` | 风格       | `--style raw`（减少美化）                |
| `--q`     | 质量       | `--q 2`（高质量，消耗更多算力）          |
| `--s`     | 风格化程度 | `--s 250`（越高越艺术化）                |
| `--no`    | 排除元素   | `--no text, watermark`                   |

### 完整示例

```
a cute corgi dog wearing sunglasses, beach background,
summer vibes, pop art style --ar 1:1 --v 6.1 --s 200
```

---

## 四、商业场景实战

### 场景 1：电商产品主图

```
提示词：
[product name] on [background], studio lighting,
product photography, high detail, commercial

示例：
a sleek wireless earbuds case on white background,
soft shadow, studio lighting, product photography, 8K
```

### 场景 2：小红书封面

```
提示词：
[scene description], aesthetic, lifestyle, warm tones,
soft lighting, magazine style --ar 3:4

示例：
a girl reading book in a cozy cafe, autumn vibes,
warm tones, soft natural light, lifestyle photography --ar 3:4
```

### 场景 3：Logo 设计

```
提示词：
minimalist logo design for [brand], [style],
vector style, clean lines, white background

示例：
minimalist logo design for a coffee shop named "Bean",
simple coffee bean icon, clean lines, black and white, vector
```

### 场景 4：头像定制

```
提示词：
portrait of [description], [style], [expression],
[brightness], avatar style --ar 1:1

示例：
portrait of a professional woman, short hair, confident smile,
soft studio lighting, corporate headshot style --ar 1:1
```

---

## 五、接单定价参考

| 类型             | 建议定价     | 耗时       |
| ---------------- | ------------ | ---------- |
| AI 头像          | 19.9-49.9 元 | 10-15 分钟 |
| 小红书封面       | 9.9-29.9 元  | 5-10 分钟  |
| 电商主图         | 29.9-99.9 元 | 15-30 分钟 |
| Logo 设计        | 49.9-199 元  | 30-60 分钟 |
| 海报设计         | 99-299 元    | 30-60 分钟 |
| 一套写真（10张） | 99-299 元    | 30-60 分钟 |

---

## 六、Midjourney 的局限

- **无法精准控制**：不能指定精确位置、颜色值
- **不开源**：无法本地部署，必须付费
- **文字渲染差**：在图中生成文字效果不好
- **批量生产弱**：没有内置批量处理功能

**需要精准控制/批量生产？→ 用 ComfyUI + Flux**

---

## 下一篇

[03-ComfyUI工作流](./03-ComfyUI工作流.md) — 程序员的主场，节点式工作流详解。
