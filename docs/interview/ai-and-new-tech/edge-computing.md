---
title: "Edge Computing 前端场景 [P8]"
level: "senior"
tags: ["Edge SSR", "Deno Deploy", "Cloudflare Workers", "Edge Runtime"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Edge Computing 前端场景 [P8]

> Edge Computing 将计算推向离用户最近的节点。2026 年，Edge Runtime 成为全栈框架的标配，Vercel Edge Functions、Cloudflare Workers、Deno Deploy 提供了全球化的计算能力。

## 核心概念（What）

### Edge Computing 架构

```
传统架构：
用户 → CDN（静态）→ 中心服务器（动态）→ 数据库
延迟：50-200ms

Edge 架构：
用户 → Edge Node（动态 + 静态）→ 数据库
延迟：5-20ms

Edge Runtime 限制：
├── 启动时间：< 5ms（V8 Isolate，非容器）
├── 内存：128MB（典型限制）
├── CPU 时间：30s（单次请求）
├── 无文件系统（只有 KV 存储）
└── 有限的 Node.js API 支持
```

### Edge 平台对比

| 平台 | 运行时 | 冷启动 | 定价模型 | 特色 |
|------|--------|--------|---------|------|
| **Cloudflare Workers** | V8 Isolate | < 5ms | 请求数 | 全球 300+ 节点 |
| **Deno Deploy** | Deno/V8 | < 5ms | 请求数 | 原生 TS/ESM |
| **Vercel Edge** | V8 Isolate | < 5ms | 请求数 | Next.js 深度集成 |
| **Deno Edge** | Deno | < 10ms | 资源用量 | 完整 Deno 运行时 |

---

## 底层原理（Why）

### 1. Cloudflare Worker

```typescript
// Cloudflare Worker：边缘计算
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // A/B 测试（在边缘决定）
    const abGroup = request.headers.get('X-AB-Group') || 'control';

    // 地理定位（基于 IP）
    const country = request.headers.get('CF-IPCountry');

    // KV 存储
    const cached = await env.KV.get(`page:${url.pathname}`);
    if (cached) return new Response(cached, { headers: { 'Content-Type': 'text/html' } });

    // 动态渲染
    const html = await renderPage(url.pathname, { abGroup, country });
    await env.KV.put(`page:${url.pathname}`, html, { expirationTtl: 60 });

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  },
};
```

### 2. Edge SSR

```typescript
// Next.js Edge SSR
export const runtime = 'edge'; // 在 Edge Runtime 运行

export default async function Page({ params }: { params: { slug: string } }) {
  // 在边缘节点渲染（全球低延迟）
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // ISR
  });

  return <DataView data={data} />;
}

// Edge SSR 优势：
// ├── 全球低延迟（离用户最近的节点渲染）
// ├── 自动扩缩容（无需管理服务器）
// └── 成本更低（按请求计费）
//
// Edge SSR 限制：
// ├── 无法使用 Node.js 完整 API
// ├── 内存限制（128MB）
// └── 无法运行重型计算
```

### 3. 边缘中间件

```typescript
// Next.js Middleware（运行在 Edge）
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 认证检查（在边缘执行，无需回源）
  const token = request.cookies.get('token');
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect('/login');
  }

  // 地理重定向
  const country = request.geo?.country || 'US';
  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/zh' + request.nextUrl.pathname, request.url));
  }

  // 请求头注入
  const response = NextResponse.next();
  response.headers.set('X-Country', country);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### 4. 边缘 AI 推理

```
Edge AI 推理（2026 趋势）：
├── 小型模型在边缘运行（< 100MB）
├── 文本分类、情感分析、实体提取
├── 无需回源，延迟 < 50ms
└── 工具：Cloudflare Workers AI、Vercel AI SDK

场景：
- 内容审核（在边缘过滤违规内容）
- 智能路由（根据用户意图路由到不同后端）
- 实时翻译（边缘推理 + 流式输出）
```

---

## 高频面试题

### Q1: Edge Computing 对前端的影响？

**参考答案要点**：
- SSR 全球低延迟（边缘渲染）
- 中间件在边缘执行（认证、重定向、A/B 测试）
- API 路由在边缘运行（减少回源）
- 限制：无法使用完整 Node.js API
- 趋势：Edge Runtime 能力不断增强

### Q2: Edge Runtime 和传统 Serverless 的区别？

**参考答案要点**：
- Edge：V8 Isolate（毫秒级启动），全球分布
- Serverless：容器（百毫秒级启动），区域部署
- Edge：内存受限（128MB），按请求计费
- Serverless：资源更充裕，按执行时间计费
- 选择：轻量、低延迟 → Edge；重型计算 → Serverless

### Q3: 如何在 Edge 环境做数据缓存？

**参考答案要点**：
- KV 存储（Cloudflare KV、Deno KV）
- 边缘缓存 HTML（CDN 级别）
- 分布式缓存（Redis 边缘节点）
- Cache API（浏览器标准，Edge 支持）
- 策略：Cache-First + TTL + 主动失效

---

## 延伸思考

1. **设计题**：设计一个全球低延迟的电商网站 Edge 架构。
2. **场景题**：Edge Function 超时（30s 限制），如何处理长时间任务？
3. **对比题**：Cloudflare Workers vs Deno Deploy vs Vercel Edge Functions？

---

## 参考资料

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Deno Deploy](https://deno.com/deploy)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/runtimes/edge)
- [Edge Runtime Spec](https://edge-runtime.vercel.app/)
