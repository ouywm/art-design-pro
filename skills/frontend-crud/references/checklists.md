# 检查清单

## 一、开始开发前

- [ ] 这个页面是不是标准 CRUD 页
- [ ] OpenAPI / `src/types/api` 中是否已有对应类型
- [ ] 需要新建还是复用 `src/api/*.ts`
- [ ] 页面属于哪个路由分组，是否是 `src/views/system/*`
- [ ] 需要搜索、列表、新增、编辑、删除、详情中的哪些能力
- [ ] 表单适合 `ElDialog` 还是 `ElDrawer`
- [ ] 是否存在字典字段，需要接 `useDict`

## 二、开发过程中

- [ ] API 封装已落在 `src/api/<feature>.ts`
- [ ] 页面目录已建立 `types.ts`
- [ ] `index.vue` 没有塞进全部实现细节
- [ ] 搜索模块已拆到 `modules/<feature>-search.vue`
- [ ] 表单模块已拆到 `modules/<feature>-dialog.vue` 或 `modules/<feature>-form-panel.vue`
- [ ] 行内更多操作已评估是否用 `ArtButtonMore`
- [ ] 搜索提交后通过 `Object.assign(searchParams, ...)` 再 `getData()`
- [ ] 新增/编辑成功后父页面使用 `refreshCreate()` 或 `refreshUpdate()`
- [ ] 删除成功后使用 `refreshRemove()`
- [ ] 危险操作有确认弹窗

## 三、新页面补外围

- [ ] 路由是否已加入 `src/router/modules/*.ts`
- [ ] 菜单标题、多语言是否已加入 `zh.json` / `en.json`
- [ ] 后端菜单是否需要通过 MCP 菜单工具插入
- [ ] 菜单标题是否使用 i18n key，而不是直接写中文
- [ ] 是否需要 `authList` 按钮权限
- [ ] 是否需要隐藏详情路由或 `activePath`
- [ ] 是否需要在表头、通知区、工作台或其他入口暴露跳转

## 四、提交前

- [ ] 没有在页面里重复手写接口字段定义
- [ ] 本地类型只承担前端派生结构，不复制后端契约
- [ ] 没有把搜索、表格、表单、详情全堆在一个文件
- [ ] 组件选型符合项目已有模式
- [ ] 成功提示、错误确认、空状态交互一致
- [ ] 跑过 `pnpm build`

## 五、如果你拿不准

按下面顺序找参照：

1. 标准表格 CRUD： `src/views/system/user/index.vue`
2. 复杂抽屉表单： `src/views/system/notice/modules/notice-form-panel.vue`
3. 卡片型配置页： `src/views/system/config/index.vue`
