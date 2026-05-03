# 文件布局

## 标准后台 CRUD 页面

推荐目录：

```text
src/api/<feature>.ts
src/views/system/<feature>/
  index.vue
  types.ts
  constants.ts               # 只有在需要时新增
  modules/
    <feature>-search.vue
    <feature>-dialog.vue
    <feature>-detail-dialog.vue
```

## 复杂表单页面

当表单字段很多、存在富文本、图片上传、分组联动时，优先用 `form-panel` 命名：

```text
src/views/system/<feature>/
  index.vue
  types.ts
  modules/
    <feature>-search.vue
    <feature>-form-panel.vue
    <feature>-detail-dialog.vue
```

这类页面更接近：

- `src/views/system/notice`
- `src/views/system/config`

## 卡片型管理页

如果主体不是表格，而是分组卡片、内容块、配置面板，也仍然建议保留同样的目录分层：

```text
src/views/system/<feature>/
  index.vue
  types.ts
  modules/
    <feature>-search.vue
    <feature>-form-panel.vue
    <feature>-value-display.vue   # 按需
```

## 文件职责

### `src/api/<feature>.ts`

- 只做接口封装
- 不写页面逻辑
- 不写组件状态

### `index.vue`

- 负责页面编排
- 负责 `useTable`
- 负责弹窗显隐
- 负责将搜索参数转成接口参数
- 负责刷新策略和表格操作回调

### `types.ts`

- 放本地页面模型
- 放前端派生类型
- 放日期范围、表单结构、详情别名

### `modules/<feature>-search.vue`

- 只负责搜索 UI 和 `search/reset` 事件
- 不直接请求接口

### `modules/<feature>-dialog.vue` 或 `modules/<feature>-form-panel.vue`

- 只负责表单展示、校验、提交
- 不负责刷新表格
- 成功后向父层抛事件

### `modules/<feature>-detail-dialog.vue`

- 只负责只读详情、预览、审核信息展示

## 命名建议

- 搜索：`<feature>-search.vue`
- 新增/编辑弹窗：`<feature>-dialog.vue`
- 新增/编辑抽屉：`<feature>-form-panel.vue`
- 详情弹窗：`<feature>-detail-dialog.vue`
- 分组弹窗：`<feature>-group-form-panel.vue`

不要混用一堆 `modal.vue`、`popup.vue`、`temp.vue` 这类不表达职责的名字。
