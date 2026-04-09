# AI 组件库全景调研报告

> 调研时间：2026-03-20 调研目的：全面调研各框架（Vue / React / Svelte / Angular / 跨框架）的 AI 交互组件库，为项目选型提供参考数据来源：GitHub API 实时查询 + 网络搜索 + MCP 检索

---

## 一、全景总览（按 Stars 排序）

| 组件库 | Stars | 框架 | 出品方 | 协议 | 类型 |
| --- | --- | --- | --- | --- | --- |
| [CopilotKit](https://github.com/CopilotKit/CopilotKit) | 29,564 | React + Angular | CopilotKit (YC) | MIT | 全栈 Agent 框架 |
| [Vercel AI SDK](https://github.com/vercel/ai) | 22,798 | React / Vue / Svelte / Angular | Vercel | - | 数据层 SDK |
| [HuggingFace chat-ui](https://github.com/huggingface/chat-ui) | 10,596 | SvelteKit | Hugging Face | Apache-2.0 | 完整应用 |
| [assistant-ui](https://github.com/assistant-ui/assistant-ui) | 8,919 | React | 社区 (YC) | MIT | UI 组件库 |
| [Ant Design X](https://github.com/ant-design/x) | 4,393 | React | 蚂蚁集团 | - | UI 组件库 |
| [ChatUI 3.0](https://github.com/alibaba/ChatUI) | 4,323 | React | 阿里达摩院 | MIT | UI 组件库 |
| [Deep Chat](https://github.com/OvidijusParsiunas/deep-chat) | 3,560 | **全框架** (Web Component) | 社区 | MIT | Web Component |
| [prompt-kit](https://github.com/ibelick/prompt-kit) | 2,698 | React (shadcn) | 社区 | MIT | UI 组件库 |
| [TanStack AI](https://github.com/TanStack/ai) | 2,431 | React（主）/ 跨框架 | TanStack | MIT | 数据层 SDK |
| [TDesign AI Chat](https://github.com/Tencent/tdesign-vue-next) | 2,062 (主仓库) | Vue 3 | 腾讯 | MIT | UI 组件库 |
| [Ant Design X Vue](https://github.com/wzc520pyfm/ant-design-x-vue) | 1,746 | Vue 3 | 社区 | MIT | UI 组件库 |
| [Element Plus X](https://github.com/element-plus-x/Element-Plus-X) | 1,351 | Vue 3 | 社区 | MIT | UI 组件库 |
| [AI Elements Vue](https://github.com/vuepont/ai-elements-vue) | 967 | Vue 3 (shadcn-vue) | 社区 | - | UI 组件库 |
| [@llamaindex/chat-ui](https://github.com/run-llama/chat-ui) | 573 | React (shadcn) | LlamaIndex | MIT | UI 组件库 |

---

## 二、React 生态

### 1. CopilotKit

| 属性         | 详情                                                              |
| ------------ | ----------------------------------------------------------------- |
| GitHub       | [CopilotKit/CopilotKit](https://github.com/CopilotKit/CopilotKit) |
| Stars        | 29,564                                                            |
| Forks        | 3,834                                                             |
| 协议         | MIT                                                               |
| npm 周下载量 | ~126,000 (`@copilotkit/react-ui`)                                 |
| 最后更新     | 2026-03-19                                                        |
| 官网         | https://www.copilotkit.ai                                         |

#### 核心特性

- **全栈 Agent 框架**：不仅仅是 UI 组件，是完整的 AI Agent 集成方案
- AG-UI 协议发起者，被 Google、LangChain、AWS、Microsoft 等采纳
- Chat UI + Backend Tool Rendering + Generative UI + Shared State
- Human-in-the-Loop：Agent 可暂停等待用户确认
- 支持 React + Angular（2026 年扩展）
- v1.54 版本，API 稳定

#### 主要包

- `@copilotkit/react-core` - 核心 hooks 和 context
- `@copilotkit/react-ui` - 预构建 Chat UI 组件
- `@copilotkit/react-textarea` - AI 增强文本框

#### 适用场景

- 需要 AI Agent 深度集成到应用中（不仅仅是聊天）
- 需要 Generative UI（Agent 动态生成界面）
- 大型企业级应用

#### 注意事项

- React 专用（Angular 支持为新增）
- 生态锁定较强，对后端有一定要求
- 不支持 Vue

---

### 2. assistant-ui

| 属性     | 详情                                                                      |
| -------- | ------------------------------------------------------------------------- |
| GitHub   | [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) |
| Stars    | 8,919                                                                     |
| Forks    | 928                                                                       |
| 协议     | MIT                                                                       |
| 最后更新 | 2026-03-19                                                                |
| 官网     | https://www.assistant-ui.com                                              |

#### 核心特性

- **React AI Chat 组件库的标杆**，Y Combinator 背书
- Radix UI 风格的可组合原语（非单一组件）
- 完全控制每个像素的外观，auto-scrolling / LLM streaming / 无障碍由库处理
- 内置 Markdown + 代码高亮 + 文件附件 + 键盘快捷键
- 支持 Generative UI：LLM 工具调用映射到自定义 UI 组件
- Human-in-the-Loop 审批工作流

#### 集成支持

- Vercel AI SDK
- LangGraph / LangGraph Cloud
- Mastra
- 自定义后端

#### 适用场景

- 构建高度定制的 ChatGPT 级别对话界面
- 对 UI 有精细控制需求的团队

#### 注意事项

- React 专用，不支持 Vue
- 学习曲线比"开箱即用"型更陡

---

### 3. Ant Design X (React 原版)

| 属性       | 详情                                            |
| ---------- | ----------------------------------------------- |
| GitHub     | [ant-design/x](https://github.com/ant-design/x) |
| Stars      | 4,393                                           |
| Forks      | 1,041                                           |
| 框架       | React 18+                                       |
| 最新大版本 | 2.0                                             |
| 官网       | https://x.ant.design                            |

#### 核心特性

- 蚂蚁集团官方出品，RICH 交互范式
- v2.0 monorepo 结构：
  - `@ant-design/x` - UI 组件
  - `@ant-design/x-markdown` - 流式 Markdown 渲染器
  - `@ant-design/x-sdk` - 数据流管理
  - `@ant-design/x-skill` - 智能技能库
- 内置 DeepSeek / OpenAI Provider

#### 主要组件

- Bubble / BubbleList、Conversations、Sender、Suggestion
- Attachments、ThoughtChain、Prompts、XProvider

---

### 4. ChatUI 3.0 (阿里达摩院)

| 属性   | 详情                                                |
| ------ | --------------------------------------------------- |
| GitHub | [alibaba/ChatUI](https://github.com/alibaba/ChatUI) |
| Stars  | 4,323                                               |
| Forks  | 419                                                 |
| 协议   | MIT                                                 |
| 框架   | React                                               |

#### 核心特性

- 阿里达摩院出品，50+ 基础组件
- 覆盖电商、零售、餐饮、出行等行业场景
- 意图识别、对话历史、消息流等丰富功能

#### 注意事项

- **官方仅支持 React**，无 Vue 版本

---

### 5. prompt-kit

| 属性     | 详情                                                        |
| -------- | ----------------------------------------------------------- |
| GitHub   | [ibelick/prompt-kit](https://github.com/ibelick/prompt-kit) |
| Stars    | 2,698                                                       |
| Forks    | 145                                                         |
| 协议     | MIT                                                         |
| 最后更新 | 2026-03-18                                                  |
| 官网     | https://www.prompt-kit.com                                  |

#### 核心特性

- 基于 shadcn/ui + Tailwind CSS 的 AI 应用组件集
- 设计理念与 shadcn 一致：组件安装到你的代码中，完全可定制
- Markdown 渲染（GFM）、ChatContainer（智能滚动）、Response Stream、File Upload
- 兼容 Vercel AI SDK / OpenAI SDK / Mistral 等

#### 适用场景

- 使用 shadcn/ui 生态的 React 项目
- 需要轻量、可定制的 AI 界面组件

---

### 6. @llamaindex/chat-ui

| 属性     | 详情                                                      |
| -------- | --------------------------------------------------------- |
| GitHub   | [run-llama/chat-ui](https://github.com/run-llama/chat-ui) |
| Stars    | 573                                                       |
| Forks    | 56                                                        |
| 协议     | MIT                                                       |
| 最后更新 | 2026-03-16                                                |

#### 核心特性

- LlamaIndex 官方出品的 React Chat UI 组件库
- 基于 Shadcn UI 构建
- 支持自定义 LLM 输出渲染器
- 与 Vercel AI 后端集成
- 代码高亮 (highlight.js) + LaTeX (KaTeX)

---

## 三、Vue 生态

### 7. Element Plus X

> **与本项目 (art-design-pro) 兼容性最佳，项目基于 Element Plus。**

| 属性     | 详情                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| GitHub   | [element-plus-x/Element-Plus-X](https://github.com/element-plus-x/Element-Plus-X) |
| Stars    | 1,351                                                                             |
| Forks    | 189                                                                               |
| 协议     | MIT                                                                               |
| npm 包名 | `vue-element-plus-x`                                                              |
| 最后更新 | 2026-03-19                                                                        |
| 官网     | https://element-plus-x.com                                                        |

#### 核心特性

- 基于 Element Plus 设计语言，与现有 Element Plus 项目无缝集成
- 企业级 AI 组件库前端解决方案
- 零配置集成，开箱即用
- 支持 Tree Shaking 按需加载
- TypeScript 全类型支持

#### 主要组件

- **XChat** - AI 对话窗口组件
- **XBubble** - 消息气泡组件
- **XMarkdown** - 流式 Markdown 渲染
- **XInput** - 增强版输入框（支持语音、附件等）
- **XThinking** - AI 思考过程展示
- **XLoading** - AI 加载动画

#### 安装使用

```bash
npm install vue-element-plus-x
```

```js
import ElementPlusX from 'vue-element-plus-x'
app.use(ElementPlusX)
```

#### 配套模板

- [ruoyi-element-ai](https://github.com/element-plus-x/ruoyi-element-ai) - 基于 Vue3.5 + Element-Plus-X 的企业级 AI 应用模板（仿豆包/通义）

---

### 8. Ant Design X Vue

| 属性     | 详情                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| GitHub   | [wzc520pyfm/ant-design-x-vue](https://github.com/wzc520pyfm/ant-design-x-vue) |
| Stars    | 1,746                                                                         |
| Forks    | 126                                                                           |
| 协议     | MIT                                                                           |
| npm 包名 | `ant-design-x-vue`                                                            |
| 最后更新 | 2026-03-17                                                                    |
| 官网     | https://antd-x-vue.com                                                        |

#### 核心特性

- 基于蚂蚁 Ant Design X 设计规范的 Vue 实现
- 遵循 RICH 交互范式（意图识别 → 信息获取 → 内容创作 → 人类确认）
- 轻松对接 OpenAI 标准兼容的推理服务
- TypeScript 全类型覆盖
- 支持精细化样式调整

#### 主要组件

- **Bubble** / **BubbleList** - 消息气泡与列表
- **Conversations** - 会话管理
- **Sender** - 消息发送器
- **Suggestion** - 智能建议
- **Attachments** - 附件管理
- **ThoughtChain** - 思维链展示
- **Prompts** - 提示词组件
- **XProvider** - 全局配置提供者

#### 安装使用

```bash
npm install ant-design-vue ant-design-x-vue
```

```vue
<script setup>
  import { Bubble, XProvider } from 'ant-design-x-vue'
</script>
<template>
  <XProvider>
    <Bubble content="Hello AI" />
  </XProvider>
</template>
```

#### 注意事项

- 依赖 `ant-design-vue`，如果项目使用 Element Plus 需额外引入 Ant Design Vue

---

### 9. TDesign AI Chat

| 属性     | 详情                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| GitHub   | [Tencent/tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)（主仓库） |
| Stars    | 2,062（主仓库）                                                                   |
| Forks    | 602                                                                               |
| 协议     | MIT                                                                               |
| npm 包名 | `@tdesign-vue-next/chat`                                                          |
| 最新版本 | 0.5.0                                                                             |
| 官网     | https://tdesign.tencent.com/chat                                                  |

#### 核心特性

- 腾讯出品，专为 AIGC 对话场景设计
- 内置轻量 Markdown 渲染（highlight.js + marked.js）
- 内置 XSS 防护（HTML 内容过滤）
- 支持思考过程展示
- 多语言能力（i18n）内置
- MIT 协议，商用无忧

#### 主要组件

- **Chat** (`TChat`) - 完整聊天窗口
- **ChatItem** (`TChatItem`) - 单条消息
- **ChatContent** (`TChatContent`) - 消息内容（内置 Markdown）
- **ChatInput** (`TChatInput`) - 增强输入框
- **ChatAction** (`TChatAction`) - 操作按钮组
- **ChatLoading** - 加载动画

#### 安装使用

```bash
npm install @tdesign-vue-next/chat
```

```js
import TDesignChat from '@tdesign-vue-next/chat'
import '@tdesign-vue-next/chat/es/style/index.css'
app.use(TDesignChat)
```

#### 注意事项

- Chat 组件是 TDesign 的独立扩展包，不需要完整安装 tdesign-vue-next
- 版本 0.5.0，API 可能还在调整中

---

### 10. AI Elements Vue

| 属性     | 详情                                                                  |
| -------- | --------------------------------------------------------------------- |
| GitHub   | [vuepont/ai-elements-vue](https://github.com/vuepont/ai-elements-vue) |
| Stars    | 967                                                                   |
| Forks    | 90                                                                    |
| 协议     | -                                                                     |
| 创建时间 | 2025-08-27                                                            |
| 最后更新 | 2026-03-19                                                            |
| 基础依赖 | shadcn-vue                                                            |

#### 核心特性

- 基于 shadcn-vue 构建的 AI 原生应用组件库
- 组件安装到项目代码中，完全可定制
- 提供预构建的对话、消息等 AI 交互组件
- 支持 CLI 安装方式

#### 安装使用

```bash
npx ai-elements-vue@latest
# 或
npx shadcn-vue@latest add https://registry.ai-elements-vue.com/all.json
```

#### 注意事项

- 依赖 shadcn-vue 生态，与 Element Plus 设计体系不同
- 项目较新（2025 年 8 月创建），生态仍在成长中

---

### Vue 轻量级 / 独立聊天组件

| 组件名 | GitHub | Stars | 说明 |
| --- | --- | --- | --- |
| vue-bot-ui | [juzser/vue-bot-ui](https://github.com/juzser/vue-bot-ui) | 227 | 可定制的聊天机器人 UI，支持表情、附件 |
| vue3-beautiful-chat | [Sitronik/vue3-beautiful-chat](https://github.com/Sitronik/vue3-beautiful-chat) | 129 | 类 Intercom 风格聊天窗口 |
| vue3-chatgpt-ai | [mustafacagri/vue3-chatgpt-ai](https://github.com/mustafacagri/vue3-chatgpt-ai) | 117 | ChatGPT 集成，Vue 3 + Vuetify 3 |
| @aivue/chatbot | [npm](https://www.npmjs.com/package/@aivue/chatbot) | - | 多 Provider 支持（OpenAI/Claude/Gemini） |

---

## 四、跨框架 / 框架无关

### 11. Vercel AI SDK

| 属性       | 详情                                               |
| ---------- | -------------------------------------------------- |
| GitHub     | [vercel/ai](https://github.com/vercel/ai)          |
| Stars      | 22,798                                             |
| Forks      | 4,016                                              |
| npm 包名   | `@ai-sdk/vue` / `@ai-sdk/react` / `@ai-sdk/svelte` |
| 最新大版本 | AI SDK 6                                           |
| 月下载量   | 2000 万+                                           |
| 官网       | https://ai-sdk.dev                                 |

#### 核心特性

- **业界标准** AI 前端 SDK，Vercel 出品
- **全框架支持**：React / Vue / Svelte / Angular 完全功能对等（SDK 5+）
- 提供 Composables/Hooks 而非 UI 组件（纯数据层）
- 统一 API 对接任意 AI Provider（OpenAI / Claude / Gemini / DeepSeek 等）
- 流式渲染、工具调用、结构化输出、Agent 抽象
- SDK 6：Human-in-the-Loop、ToolLoopAgent

#### Vue 3 Composables

- **useChat** - 实时流式聊天管理
- **useCompletion** - 文本补全
- **useObject** - 流式 JSON 对象
- **useAssistant** - 交互式助手

#### 安装使用

```bash
npm install @ai-sdk/vue
```

#### 注意事项

- **不提供 UI 组件**，只提供数据管理层
- 通常与 UI 组件库配合使用

---

### 12. Deep Chat (Web Component)

| 属性     | 详情                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| GitHub   | [OvidijusParsiunas/deep-chat](https://github.com/OvidijusParsiunas/deep-chat) |
| Stars    | 3,560                                                                         |
| Forks    | 429                                                                           |
| 协议     | MIT                                                                           |
| 最后更新 | 2026-03-19                                                                    |
| 官网     | https://deepchat.dev                                                          |

#### 核心特性

- **Web Component 实现，真正的全框架通用**
- 一行代码嵌入：`<deep-chat></deep-chat>`
- 支持 React / Vue 3 / Svelte / Angular / Solid / Vanilla JS
- 内置对接：OpenAI / Azure / HuggingFace / 浏览器本地模型
- 语音输入、TTS、文件上传、多模态
- 高度可定制（CSS 类名覆盖）

#### 安装使用

```bash
npm install deep-chat
```

```vue
<!-- Vue 3 中使用 -->
<template>
  <deep-chat
    directConnection='{"openAI": {"key": "...", "chat": {}}}'
    style="border-radius: 10px"
  />
</template>
```

#### 适用场景

- 需要快速集成 AI 聊天功能到任何框架
- 原型开发、内部工具、嵌入式 Chat 小部件
- **Vue 3 项目可直接使用**，无需额外 UI 库

#### 注意事项

- 单组件配置式，非可组合式系统
- 深度定制灵活性不如 assistant-ui 等
- 对于"聊天是核心功能"的场景可能不够灵活

---

### 13. TanStack AI

| 属性     | 详情                                          |
| -------- | --------------------------------------------- |
| GitHub   | [TanStack/ai](https://github.com/TanStack/ai) |
| Stars    | 2,431                                         |
| Forks    | 151                                           |
| 协议     | MIT                                           |
| 创建时间 | 2025-10-08                                    |
| 最后更新 | 2026-03-19                                    |
| 官网     | https://tanstack.com/ai                       |

#### 核心特性

- TanStack 团队出品（TanStack Query / Router / Table 同门）
- 无头（Headless）聊天状态管理 + 适配器（SSE、HTTP Stream、自定义）
- 同构类型安全工具（服务端/客户端执行）
- 与 TanStack Start 深度集成
- 支持实时语音对话（OpenAI Realtime / ElevenLabs）

#### 主要包

- `@tanstack/ai-react` - React hooks
- 框架无关的 headless client 核心

#### 注意事项

- 项目较新（2025 年 10 月创建）
- 目前 React 适配最成熟，其他框架支持在路线图中
- 无预构建 UI，专注于状态管理层

---

### 14. Google A2UI (Agent-to-UI)

| 属性   | 详情        |
| ------ | ----------- |
| 出品方 | Google      |
| 类型   | 协议/规范   |
| 状态   | 2026 年发布 |

#### 核心特性

- **框架完全无关的 UI 描述协议**
- Agent 输出结构化 JSON，客户端映射到原生组件
- 同一 A2UI JSON 可渲染到 Lit / Angular / Flutter / React / SwiftUI
- 与 CopilotKit AG-UI 协议联合使用
- Oracle Agent Spec + Google A2UI + CopilotKit AG-UI = 标准化 Agent 前端方案

#### 注意事项

- 是协议/规范，非组件库
- 需要配合具体框架的渲染实现

---

### 15. OpenAI ChatKit

| 属性     | 详情                  |
| -------- | --------------------- |
| 出品方   | OpenAI                |
| 发布时间 | DevDay 2025 (2025-10) |
| 状态     | 早期访问              |

#### 核心特性

- OpenAI 官方嵌入式聊天界面工具包
- AgentKit 四大组件之一（Agent Builder / ChatKit / Connector Registry / Evals）
- 对话历史、工具调用展示、自定义 Widget 渲染
- 免费使用（包含在标准 API 定价中）

#### 注意事项

- **尚未发布 NPM 包**，仅有 GitHub starter repo
- 非生产就绪状态
- 早期 star 数 255-374，生态待成长

---

## 五、Svelte / SvelteKit 生态

### 16. HuggingFace chat-ui

| 属性     | 详情                                                          |
| -------- | ------------------------------------------------------------- |
| GitHub   | [huggingface/chat-ui](https://github.com/huggingface/chat-ui) |
| Stars    | 10,596                                                        |
| Forks    | 1,611                                                         |
| 协议     | Apache-2.0                                                    |
| 框架     | SvelteKit                                                     |
| 最后更新 | 2026-03-19                                                    |

#### 核心特性

- HuggingChat 的开源代码库
- 支持 OpenAI 兼容 API
- 完整的聊天应用（非组件库）
- 可自部署

#### 其他 Svelte AI 资源

- **svelte-ai-chat** - Svelte 5 的极简 AI Chat widget（Vercel AI SDK 驱动）
- **ai-chatbot-svelte** - Vercel 官方 SvelteKit AI 聊天模板
- `@ai-sdk/svelte` - Vercel AI SDK 的 Svelte 绑定

---

## 六、商业/SaaS 方案

| 方案 | 说明 | 框架支持 | 定价 |
| --- | --- | --- | --- |
| [Telerik Conversational UI](https://www.telerik.com/conversational-ui) | .NET/JS 聊天框架，支持 Microsoft Bot Framework 等 | 跨框架 | 商业授权 |
| [Stream Chat AI](https://getstream.io/chat/solutions/ai-integration/) | 对接 OpenAI/Claude/Gemini，React/RN/Flutter/Android/iOS | 全平台 | 商业授权 |

---

## 七、对比矩阵

### 按维度对比

| 维度 | CopilotKit | assistant-ui | Deep Chat | Vercel AI SDK | Element Plus X | Ant Design X Vue | TDesign Chat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Stars | 29,564 | 8,919 | 3,560 | 22,798 | 1,351 | 1,746 | 2,062 |
| 框架 | React | React | 全框架 | 全框架 | Vue 3 | Vue 3 | Vue 3 |
| 提供 UI | 是 | 是 | 是 | 否(仅数据层) | 是 | 是 | 是 |
| 流式渲染 | 是 | 是 | 是 | 是 | 是 | 是 | 是 |
| Markdown | 是 | 是 | 是 | 否 | 是 | 是 | 是(内置) |
| 思考过程 | 是 | 是 | 否 | 否 | 是 | 是 | 是 |
| 文件附件 | 是 | 是 | 是 | 否 | 是 | 是 | 是 |
| Generative UI | 是 | 是 | 否 | 否 | 否 | 否 | 否 |
| 多 Provider | 是 | 是 | 是 | 是 | 否 | 是(OpenAI标准) | 否 |
| 可组合性 | 高 | 极高 | 低(配置式) | 极高 | 中 | 高 | 中 |
| 中文生态 | 弱 | 弱 | 中 | 中 | 强 | 强 | 强 |

---

## 八、针对本项目 (art-design-pro) 的推荐方案

本项目基于 **Vue 3 + Element Plus + TypeScript + Pinia**，推荐以下方案：

### 方案 A：Element Plus X（最佳兼容性）-- 推荐

```
优点：
- 与现有 Element Plus 设计语言完全一致
- 零额外设计系统成本
- MIT 协议，商用友好
- 有配套企业级 AI 应用模板 (ruoyi-element-ai)
- 中文社区活跃

缺点：
- 社区驱动，非 Element Plus 官方
- Stars 相对较少（1,351），生态仍在成长

安装：npm install vue-element-plus-x
```

### 方案 B：Deep Chat（全框架 Web Component）

```
优点：
- Web Component 实现，Vue 3 可直接使用
- 3,560 Stars，社区成熟
- 一行代码集成，开发速度最快
- 内置多 Provider 对接

缺点：
- 配置式而非可组合式，深度定制受限
- 与 Element Plus 设计风格可能不一致

安装：npm install deep-chat
```

### 方案 C：Vercel AI SDK + 自建 UI（最大灵活性）

```
优点：
- Stars 最多（22,798），生态最成熟
- 多 Provider 支持，模型切换方便
- UI 完全自定义，与 Element Plus 风格统一

缺点：
- 不提供 UI 组件，需要自行开发
- 开发成本较高

安装：npm install @ai-sdk/vue
```

### 方案 D：Element Plus X + Vercel AI SDK（组合方案）

```
优点：
- Element Plus X 负责 UI 渲染
- @ai-sdk/vue 负责数据层和流式传输
- 两者各取所长

安装：npm install vue-element-plus-x @ai-sdk/vue
```

### 方案 E：TDesign AI Chat（功能最完善的独立 Chat 组件）

```
优点：
- 腾讯出品，质量有保证
- Chat 组件独立打包，不强依赖 TDesign 全家桶
- 内置 Markdown 渲染、XSS 防护、思考过程展示

缺点：
- 与 Element Plus 设计风格不同
- 版本 0.5.0，API 可能不稳定

安装：npm install @tdesign-vue-next/chat
```

---

## 九、数据来源

### GitHub 仓库

- [CopilotKit](https://github.com/CopilotKit/CopilotKit) | [assistant-ui](https://github.com/assistant-ui/assistant-ui) | [Vercel AI SDK](https://github.com/vercel/ai)
- [Ant Design X](https://github.com/ant-design/x) | [Ant Design X Vue](https://github.com/wzc520pyfm/ant-design-x-vue)
- [Element Plus X](https://github.com/element-plus-x/Element-Plus-X) | [TDesign Vue Next](https://github.com/Tencent/tdesign-vue-next)
- [Deep Chat](https://github.com/OvidijusParsiunas/deep-chat) | [TanStack AI](https://github.com/TanStack/ai)
- [HuggingFace chat-ui](https://github.com/huggingface/chat-ui) | [ChatUI](https://github.com/alibaba/ChatUI)
- [prompt-kit](https://github.com/ibelick/prompt-kit) | [@llamaindex/chat-ui](https://github.com/run-llama/chat-ui)
- [AI Elements Vue](https://github.com/vuepont/ai-elements-vue)

### 文章与评测

- [I Evaluated Every AI Chat UI Library in 2026 - DEV Community](https://dev.to/alexander_lukashov/i-evaluated-every-ai-chat-ui-library-in-2026-heres-what-i-found-and-what-i-built-4p10)
- [Top AI Libraries for React Developers in 2026 - DEV Community](https://dev.to/puckeditor/top-ai-libraries-for-react-developers-in-2026-nmb)
- [The Complete Guide to Generative UI Frameworks in 2026 - Medium](https://medium.com/@akshaychame2/the-complete-guide-to-generative-ui-frameworks-in-2026-fde71c4fa8cc)
- [2025最全AI组件库盘点 - CSDN](https://blog.csdn.net/weixin_41644392/article/details/148535806)
- [TDesign AI Chat 介绍 - 知乎](https://zhuanlan.zhihu.com/p/1907799040999002986)
- [Google A2UI 发布 - Google Developers Blog](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [OpenAI DevDay 2025 AgentKit](https://openai.com/index/introducing-agentkit/)

### 官网

- [CopilotKit](https://www.copilotkit.ai) | [assistant-ui](https://www.assistant-ui.com) | [Vercel AI SDK](https://ai-sdk.dev)
- [TDesign AI Chat](https://tdesign.tencent.com/chat) | [Element Plus X](https://element-plus-x.com) | [Deep Chat](https://deepchat.dev)
- [prompt-kit](https://www.prompt-kit.com) | [TanStack AI](https://tanstack.com/ai) | [Ant Design X](https://x.ant.design)
