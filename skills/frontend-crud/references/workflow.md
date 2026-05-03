# CRUD 开发流程

## 1. 先确认数据契约来源

- 先看 `openapi.json` 或已经落在 `src/types/api/*.d.ts` 的类型命名空间。
- 如果接口类型还没同步进仓库，先补类型来源，再开始页面开发。
- 页面代码只依赖已有的 `Api.xxx` 命名空间，不在组件里重新定义接口响应体。

## 2. 建立 API 封装

目标文件通常是：

```text
src/api/<feature>.ts
```

要求：

- 一个函数对应一个接口动作。
- 命名统一用 `fetchGet...`、`fetchCreate...`、`fetchUpdate...`、`fetchDelete...`。
- 查询接口优先 `request.get`
- 新增接口优先 `request.post`
- 修改接口优先 `request.put`
- 删除接口优先 `request.del`

如果页面只是消费已有接口，先检查是否已经有相邻的 API 文件，不要重复造轮子。

## 3. 建立页面本地类型

目标文件通常是：

```text
src/views/system/<feature>/types.ts
```

这里存放的是“前端本地视图模型”，不是后端契约副本。

典型内容：

- 列表项别名：`type XxxListItem = Api.Xxx.XxxVo`
- 详情别名：`type XxxDetailVo = Api.Xxx.XxxDetailVo`
- 搜索表单模型：把日期范围、布尔筛选、级联值转换成更适合前端组件绑定的结构
- 表单模型：只放弹窗/抽屉真正需要双向绑定的字段

如果页面内有大量常量、枚举映射、默认值工厂，再新增 `constants.ts`。

## 4. 先搭骨架，再补细节

推荐顺序：

1. `index.vue` 搭出搜索区 + 列表容器
2. 接上 `useTable` 跑通列表数据
3. 拆 `modules/<feature>-search.vue`
4. 拆 `modules/<feature>-dialog.vue` 或 `modules/<feature>-form-panel.vue`
5. 补删除、详情、状态切换、更多操作
6. 最后补边角交互和空状态

不要一开始就把所有弹窗、所有表单规则、所有细节都写进一个超长 `index.vue`。

## 5. 搜索和列表联动

标准写法：

- 页面维护一个 `searchForm`
- `useTable` 提供 `searchParams`、`getData()`、`resetSearchParams()`、`refreshCreate()`、`refreshUpdate()`、`refreshRemove()`
- 搜索组件通过 `@search` 把筛选值抛给页面
- 页面里 `Object.assign(searchParams, params)` 后再 `getData()`

日期范围场景要在页面层先把范围拆成后端需要的 `start/end` 字段，再赋值给 `searchParams`。

## 6. 表单动作统一收敛

新增和编辑尽量共用一个表单组件：

- 通过 `panelMode` 或 `type` 区分 `add` / `edit`
- 打开时判断是否需要拉详情
- 提交成功后向父组件抛 `success` 或 `submit`
- 父页面决定调用 `refreshCreate()` 还是 `refreshUpdate()`

## 7. 页面开发完成后再补外围

如果这是一个新页面，而不是旧页面增量修改，还要继续检查：

- `src/router/modules/*.ts` 是否需要挂新路由
- `src/locales/langs/zh.json`、`src/locales/langs/en.json` 是否需要新增菜单和按钮文案
- 是否需要按钮权限 `authList`
- 是否需要在头部、菜单、工作台标签中暴露入口
- 是否需要通过 MCP 菜单工具把页面插入后端菜单树
- 菜单 `title` 是否使用了 i18n key，例如 `menus.ai.vendor`

## 8. 最终验证

- 类型是否都来自 `Api.xxx` 命名空间或本地 `types.ts`
- 页面是否拆成合理模块
- 提交前至少运行一次 `pnpm build`
