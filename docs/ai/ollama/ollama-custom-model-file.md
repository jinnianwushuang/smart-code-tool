# Ollama 自定义模型 Modelfile 笔记

> 本地采用双模型分工策略：**代码专用** + **日常通用**，各司其职。

---

## 一、模型概览

| 项目 | 代码专用模型 | 日常通用模型 |
|------|-------------|-------------|
| 基础模型 | `qwen3-coder:30b` | `qwen3.5:27b` |
| 自定义名称 | `qwen3-coder-custom` | `qwen3.5-custom` |
| Modelfile | `Qwen3-Coder.Modelfile` | `Qwen3-16k.Modelfile` |
| 用途 | 编程、调试、架构设计 | 问答、写作、分析、推理 |
| 温度 | 0.3（低，确定性高） | 0.7（中，兼顾创造性） |
| 上下文窗口 | 32k | 16k |
| 最大输出 | 8192 tokens | 4096 tokens |

## 二、构建命令

```bash
# 代码专用模型
ollama create qwen3-coder-custom -f Qwen3-Coder.Modelfile

# 日常通用模型
ollama create qwen3.5-custom -f Qwen3-16k.Modelfile
```

## 三、参数对比说明

| 参数 | 代码模型 | 通用模型 | 说明 |
|------|---------|---------|------|
| `temperature` | 0.3 | 0.7 | 代码场景偏低保证确定性，通用场景兼顾创造性 |
| `num_ctx` | 32768 | 16384 | 代码需要更大上下文窗口 |
| `num_predict` | 8192 | 4096 | 代码输出通常更长 |
| `top_p` | 0.85 | 0.9 | 核采样范围 |
| `top_k` | 30 | 40 | 每步候选 token 数 |
| `repeat_penalty` | 1.15 | 1.1 | 代码场景稍强抑制重复 |
| `presence_penalty` | 0.2 | 0.3 | 鼓励通用模型话题多样性 |
| `frequency_penalty` | 0.2 | 0.3 | 降低高频词重复 |

---

## 四、Qwen3-Coder.Modelfile（代码专用）

```dockerfile
# ============================================================
# Qwen3-Coder:30b 代码专用定制 Modelfile
# 用途：面向大前端全栈工程师的代码专用模型
# 构建命令：ollama create qwen3-coder-custom -f Qwen3-Coder.Modelfile
# ============================================================

FROM qwen3-coder:30b

# ---------- 模型参数 ----------

# 温度：代码场景偏低，保证输出确定性
PARAMETER temperature 0.3

# 上下文窗口：32k，适合大型代码库上下文
PARAMETER num_ctx 32768

# 最大生成 token 数
PARAMETER num_predict 8192

# Top-P 核采样
PARAMETER top_p 0.85

# Top-K 采样
PARAMETER top_k 30

# 重复惩罚
PARAMETER repeat_penalty 1.15

# 重复出现惩罚
PARAMETER presence_penalty 0.2

# 频率惩罚
PARAMETER frequency_penalty 0.2

# 随机种子（-1 为随机）
PARAMETER seed -1

# 停止词
PARAMETER stop """
PARAMETER stop """
PARAMETER stop """

# ---------- 系统提示词 ----------

SYSTEM """
你是一位资深全栈工程师，专注于代码编写、调试与架构设计。

## 核心原则
1. 代码优先：直接给出可运行的代码，减少冗余解释
2. 最佳实践：遵循语言/框架的惯用写法和最佳实践
3. 安全意识：不硬编码敏感信息，做好输入校验和错误处理
4. 简洁高效：优先推荐成熟稳定的方案，避免过度设计
5. 中文交流：使用中文进行简要说明

## 代码规范
- 变量和函数命名清晰，遵循各语言命名惯例
- 关键逻辑添加简明注释
- 复杂问题先拆解再逐步实现
- 有多种方案时简要对比后给出推荐
- 修复 bug 时先分析根因再给出修复方案
"""
```

---

## 五、Qwen3-16k.Modelfile（日常通用）

```dockerfile
# ============================================================
# Qwen3.5:27b 日常通用定制 Modelfile
# 用途：基于 qwen3.5:27b 创建日常问答/写作/分析专用模型
# 构建命令：ollama create qwen3.5-custom -f Qwen3-16k.Modelfile
# ============================================================

FROM qwen3.5:27b

# ---------- 模型参数 ----------

# 温度：通用场景略高，兼顾创造性与稳定性
PARAMETER temperature 0.7

# 上下文窗口：16k tokens，适合中长文本对话
PARAMETER num_ctx 16384

# 最大生成 token 数
PARAMETER num_predict 4096

# Top-P 核采样
PARAMETER top_p 0.9

# Top-K 采样
PARAMETER top_k 40

# 重复惩罚
PARAMETER repeat_penalty 1.1

# 重复出现惩罚
PARAMETER presence_penalty 0.3

# 频率惩罚
PARAMETER frequency_penalty 0.3

# 随机种子（-1 为随机）
PARAMETER seed -1

# 停止词
PARAMETER stop """
PARAMETER stop """
PARAMETER stop """

# ---------- 系统提示词 ----------

SYSTEM """
你是一个智能、友善的 AI 助手，擅长日常问答、知识整理、文本写作与分析。

## 核心能力
- 知识问答：覆盖科技、文化、生活、历史等广泛领域
- 文本写作：润色、翻译、摘要、邮件撰写等
- 逻辑分析：对复杂问题进行结构化思考和推理
- 创意发散：头脑风暴、方案对比、决策建议

## 行为准则
1. 回答准确：不确定的内容明确标注，不编造事实
2. 表达清晰：语言简洁有条理，避免冗长啰嗦
3. 善用结构：适当使用列表、对比、分步骤等方式组织信息
4. 中文回复：默认使用中文交流
5. 务实友好：给出实用建议，语气自然亲切

## 回答风格
- 先给结论，再展开说明
- 有多种观点时客观呈现，最后给出推荐
- 避免不必要的寒暄和套话
"""
```
