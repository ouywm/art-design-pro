# 组件与 Hook 选型

## 列表骨架

### `useTable`

适用：

- 标准分页列表
- 搜索后刷新
- 新增、编辑、删除后的局部刷新

优先使用它提供的：

- `searchParams`
- `getData()`
- `resetSearchParams()`
- `refreshData()`
- `refreshCreate()`
- `refreshUpdate()`
- `refreshRemove()`

### `ArtTableHeader`

适用：

- 搜索栏显隐
- 刷新按钮
- 全屏
- 左侧主操作按钮插槽

### `ArtTable`

适用：

- 标准后台表格
- 搭配 `useTable` 的分页响应

## 搜索区

### `ArtSearchBar`

优先用于：

- 两个及以上搜索项
- 需要响应式折叠
- 需要统一按钮样式和表单布局

不要重复手写一整套 `ElForm + ElRow + ElCol` 搜索区，除非当前交互明显超出 `ArtSearchBar` 能力。

## 行内操作

### `ArtButtonMore`

适用：

- 行内操作超过两个
- 需要“更多操作”收纳
- 不同操作带图标和颜色区分

### 直接按钮

适用：

- 只有一个主要动作
- 操作极少且需要直观暴露

## 表单容器

### `ElDialog`

适用：

- 字段较少
- 宽度可控
- 没有长内容和富文本

参考：

- `src/views/system/user/modules/user-dialog.vue`

### `ElDrawer`

适用：

- 字段较多
- 需要长表单
- 需要富文本、图片上传、复杂联动

参考：

- `src/views/system/notice/modules/notice-form-panel.vue`

## 状态与字典展示

### `useDict`

适用：

- 状态、等级、范围、类型等后端字典字段

配合：

- `getDict`
- `getDictLabel`
- `getDictClass`
- `dictClassToTagType`

如果某个字段已经有字典，不要在页面里重新写一套硬编码映射。

## 富文本与媒体

### `ArtWangEditor`

适用：

- 公告正文
- 富文本描述
- 后台内容录入

### `ArtFileUpload` / `ArtChunkedUpload`

适用：

- 需要附件、图片、分片上传时

## 空状态与反馈

- 成功提示：`ElMessage.success`
- 危险确认：`ElMessageBox.confirm`
- 无数据：`ElEmpty`
- 加载：页面区块 `v-loading`

## 选型口诀

- 列表就先想 `useTable`
- 搜索就先想 `ArtSearchBar`
- 表格工具栏就先想 `ArtTableHeader`
- 行操作多就先想 `ArtButtonMore`
- 表单简单用 `Dialog`
- 表单复杂用 `Drawer`
