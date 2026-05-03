# 页面模式

## 模式一：标准搜索 + 表格 + 弹窗 CRUD

适用场景：

- 用户、角色、日志、供应商、渠道账号

结构：

```text
Search -> TableHeader -> Table -> Dialog
```

典型职责：

- 搜索组件发出 `search` / `reset`
- 页面使用 `useTable`
- 行内操作用 `ArtButtonMore`
- 新增/编辑复用同一个 `dialog`
- 删除后调用 `refreshRemove()`

参考：

- `src/views/system/user/index.vue`
- `src/views/system/user/modules/user-search.vue`

## 模式二：搜索 + 表格 + 抽屉表单

适用场景：

- 表单字段较多
- 富文本、上传、目标选择、联动项较多

结构：

```text
Search -> TableHeader -> Table -> Drawer(FormPanel) -> DetailDialog
```

推荐原因：

- 抽屉可承载更复杂的布局
- 不会把弹窗挤得很窄
- 适合长表单和富文本编辑

参考：

- `src/views/system/notice/modules/notice-form-panel.vue`

## 模式三：搜索 + 卡片/分组内容管理

适用场景：

- 配置中心
- 分组资源
- 不适合纯表格展示的内容管理

结构：

```text
Search -> Toolbar -> CardSection -> FormPanel
```

参考：

- `src/views/system/config/index.vue`

## 搜索模块约定

搜索模块应做到：

- `v-model="formData"` 透传父层表单
- 点击搜索时先校验，再 `emit('search', params)`
- 点击重置时只抛 `reset`，不直接请求接口

## 表单模块约定

表单模块应做到：

- `v-model` 或 `v-model:visible` 控制显隐
- 通过 `panelMode/type` 区分新增和编辑
- 编辑模式可按需拉详情
- 自己处理 `loading`、`submitLoading`、表单校验
- 提交成功后只抛 `success/submit`

父页面负责：

- 打开/关闭表单
- 选择 `refreshCreate()`、`refreshUpdate()`、`refreshRemove()`
- 保存当前行数据

## 删除模式

统一建议：

- `ElMessageBox.confirm(...)`
- 成功后 `ElMessage.success(...)`
- 列表页调用 `refreshRemove()`

如果删除会影响当前页码，由 `useTable` 接管翻页边界，不在页面里手写复杂分页修正。

## 详情模式

优先级：

1. 信息少：`detail-dialog`
2. 信息中等：只读抽屉
3. 需要独立导航：详情路由页

不要把只读详情和可编辑表单强塞在一个组件里，除非字段完全一致且维护成本更低。
