---
name: frontend-crud
description: >
  Use when adding or modifying a CRUD-style admin page in this Art Design Pro workspace and repo-specific conventions determine API wrapper placement, OpenAPI-derived type usage, search/list/form/detail composition, route or i18n wiring, and verification.
---

# Frontend CRUD

这份 skill 用来约束本仓库里“后台 CRUD 页面”的开发方式。重点不是解释通用 Vue 知识，而是统一本项目里该怎么落文件、怎么拼页面、该优先用哪些组件，以及每次提一个新功能时不要漏掉哪些步骤。

## When To Use

- 新增一个后台管理页面，例如渠道、账号、价格、请求记录、供应商、字典、配置。
- 现有列表页要补搜索、新增、编辑、删除、详情、批量操作或状态切换。
- 要判断一个功能应该落在 `src/api`、`src/types/api`、`src/views/system/<feature>`、 `src/router/modules/*`、多语言文件中的哪里。

## When Not To Use

- 纯展示型页面，没有搜索、列表、表单、详情这些 CRUD 结构。
- 登录页、仪表盘、Socket 页面、富交互可视化页面。
- 只是在已有页面上改一句文案、调一个颜色、改一个按钮顺序。

## Core Rule

本 skill 的数据契约来源不是手写文档，而是 `openapi.json` 与仓库现有的 `src/types/api/*` 类型定义。开发 CRUD 页面时，不要在页面里重新发明请求字段和响应字段。

## Task Routing

- 完整开发顺序：读 [references/workflow.md](./references/workflow.md)
- 文件应该怎么拆：读 [references/file-layout.md](./references/file-layout.md)
- 页面形态和事件流：读 [references/page-patterns.md](./references/page-patterns.md)
- 组件和 Hook 选型：读 [references/component-selection.md](./references/component-selection.md)
- 最小代码骨架：读 [references/examples.md](./references/examples.md)
- 提交前核对：读 [references/checklists.md](./references/checklists.md)

## Hard Constraints

- API 封装统一放在 `src/api/*.ts`，通过 `@/utils/http` 暴露 `request.get/post/put/del`。
- 接口字段和响应结构以 OpenAPI 生成类型为准，不在页面里手写“后端应该返回什么”。
- 页面入口尽量保持薄，业务拆到 `modules/*.vue`、本地 `types.ts`、必要时 `constants.ts`。
- 标准列表页优先使用 `useTable + ArtTable + ArtTableHeader + ArtSearchBar`。
- 搜索区域、表单弹窗/抽屉、详情弹窗都应拆成独立子模块，而不是全部堆在 `index.vue`。
- 枚举、状态、字典类字段优先复用 `useDict`、`dictClassToTagType` 等现有能力。
- 用户可见的新页面，除了页面本身，还要检查路由、菜单标题、多语言、按钮权限是否需要补齐。
- 如果新页面需要落后端菜单数据，优先使用 MCP 菜单工具插入，不手写 SQL。
- 菜单标题优先使用国际化 key，例如 `menus.ai.vendor`，不要直接写死中文标题。
- 删除、危险操作统一走 `ElMessageBox.confirm`；成功反馈统一走 `ElMessage.success`。
- 提交前至少跑一次 `pnpm build`，确认类型检查和打包都通过。

## Preferred Flow

1. 先确认 OpenAPI 类型是否已存在；没有的话先补类型来源，不要直接硬写接口结构。
2. 在 `src/api` 建立功能 API 封装。
3. 在页面目录建立 `types.ts`，只补前端本地视图模型和表单模型。
4. 先做搜索和列表骨架，再做新增/编辑，再做详情与删除。
5. 表单简单用 `ElDialog`，表单复杂或富文本较多用 `ElDrawer`。
6. 页面可访问后，再补路由、多语言和页面入口联动。

## Key Anchors

- 搜索组件模式：`src/views/system/user/modules/user-search.vue`
- 标准列表页模式：`src/views/system/user/index.vue`
- 复杂卡片型 CRUD：`src/views/system/config/index.vue`
- 抽屉表单模式：`src/views/system/notice/modules/notice-form-panel.vue`
- 表格数据 Hook：`src/hooks/core/useTable.ts`
- 搜索栏基础组件：`src/components/core/forms/art-search-bar/index.vue`

## Verification

- 页面开发完成后，按 [references/checklists.md](./references/checklists.md) 自查。
- 最少运行：`pnpm build`
- 如果改了路由或页面入口，再做一次本地点击流检查。
