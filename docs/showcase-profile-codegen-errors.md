# showcase_profile 自动生成代码 - 问题清单

> **模块**: 展示档案 (showcase_profile) **生成工具**: summerrs_admin MCP `generate_frontend_bundle_from_table` **检查时间**: 2026-03-16 **状态**: 格式问题已前端临时修复，逻辑问题需后端修复生成器模板

---

## 问题总览

| # | 问题 | 严重级别 | 分类 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | 字典字段类型不匹配，编辑弹窗显示原始数字而非字典标签 | **Critical** | 逻辑 BUG | 待修复 |
| 2 | Dialog 双 watch 导致详情接口重复调用 | **Critical** | 逻辑 BUG | 待修复 |
| 3 | `initForm` 无竞态保护，快速操作可能数据错乱 | **Critical** | 逻辑 BUG | 待修复 |
| 4 | `handleSubmit` 中 `validate` 回调模式未正确 await | **High** | 逻辑 BUG | 待修复 |
| 5 | Create/Update DTO 包含不应由前端提交的审计字段 | **High** | 类型设计 | 待修复 |
| 6 | `SearchFormModel` 在父子组件重复定义 | **Medium** | 代码质量 | 待修复 |
| 7 | 列表 avatar 列 `if (!src)` 死代码 | **Low** | 代码质量 | 待修复 |
| 8 | 列配置同时设置 `width` 和 `minWidth` | **Medium** | UI 问题 | 已修复 |
| 9 | `metadata` 类型 `unknown \| null` 冗余 | **Low** | 类型设计 | 已修复 |
| 10 | Prettier 格式化（多余空行/空格） | **Low** | 格式 | 已修复 |
| 11 | 空接口 `ShowcaseProfileDetailVo extends ShowcaseProfileVo {}` | **Low** | 格式 | 已修复 |

> **验证说明**: 上述问题均已与项目中 user、role、dict 等手写模块进行对比，确认为生成器独有问题：
>
> - user-dialog 使用**单一合并 watch**（`watch(() => [props.visible, props.type, props.userData], ...)`），不会重复触发
> - role-edit-dialog 的 `handleSubmit` 使用 **Promise 模式**（`await validate()`），而非回调模式
> - user 模块搜索组件用 `Record<string, any>`，**未重复定义** SearchFormModel type
> - user 模块 avatar 列**没有** `if (!src) return '-'` 死代码
> - role-edit-dialog 的 `initForm` 是**同步函数**，不存在竞态风险

---

## Critical 级别

### 问题 1: 字典字段类型不匹配 — 编辑弹窗显示原始数字

**影响范围**: Dialog 弹窗、Search 搜索栏中所有使用字典的 `ElSelect` / `radiogroup`

**现象**: 编辑展示档案时，`联系人性别` 显示 `0`，`状态` 显示 `1`，而非字典标签（如"男"、"已发布"）。

**根因分析**:

后端返回数据中，字典字段的值是 **数字类型**：

```json
{
  "contactGender": 0,
  "status": 1
}
```

前端字典存储中，`item.value` 是 **字符串类型**（`"0"`、`"1"`），因为字典接口 `DictDataSimpleVo.value` 定义为 `string`。

生成器在 Dialog 和 Search 模板中，将字典值直接传给 `ElOption`：

```html
<!-- 生成器输出的代码 -->
<ElOption
  v-for="item in getDict('showcase_gender').map((item) => ({
    label: item.label,
    value: item.value          ← 字符串 "0"
  }))"
  :value="item.value"          ← 字符串 "0"
/>
```

而 `v-model="form.contactGender"` 绑定的是后端返回的 **数字 `0`**。

**ElSelect 使用严格相等 (`===`) 匹配 v-model 和 option value**：

```
0 === "0"  →  false  →  无法匹配  →  显示原始数字
```

**对比**: 列表页的 `getDictLabel('showcase_gender', row.contactGender)` 能正常工作，是因为 `getDictLabel` 内部做了 `String(value)` 转换：

```typescript
// store/modules/dict.ts:97
const item = dict.find((item) => item.value === String(value))
//                                                ^^^^^^ 手动转换
```

但 ElSelect 的匹配机制不经过 `getDictLabel`，直接用 `===` 比较，所以不匹配。

**影响的组件和字段**:

| 组件                        | 字段          | 控件类型   | 现象                      |
| --------------------------- | ------------- | ---------- | ------------------------- |
| showcase-profile-dialog.vue | contactGender | ElSelect   | 显示数字 `0` 而非"男"     |
| showcase-profile-dialog.vue | status        | ElSelect   | 显示数字 `1` 而非"已发布" |
| showcase-profile-search.vue | contactGender | radiogroup | 无法选中正确的选项        |
| showcase-profile-search.vue | status        | ElSelect   | 无法选中正确的选项        |

**修复建议**: 生成器模板在输出字典选项时，对数据库整数字段使用 `Number(item.value)`：

```html
<!-- 修复后 -->
<ElOption
  v-for="item in getDict('showcase_gender').map((item) => ({
    label: item.label,
    value: Number(item.value)    ← 转为数字，与后端返回类型一致
  }))"
  :value="item.value"
/>
```

---

### 问题 2: Dialog 双 watch 导致详情接口重复请求

**文件**: `showcase-profile-dialog.vue`

**现象**: 每次点击编辑按钮，`fetchGetShowcaseProfileDetail` 接口被调用 **2 次**。

**原因**: 存在两个 watch，都会调用 `initForm()`:

```typescript
// Watch 1: 监听弹窗打开
watch(
  () => props.modelValue,
  (open) => {
    if (open) void initForm()
  }
)

// Watch 2: 监听数据变化
watch(
  () => props.showcaseProfileData,
  () => {
    if (props.modelValue) void initForm()
  },
  { deep: true }
)
```

父组件 `showDialog` 中两个赋值在同一同步块内，Vue nextTick flush 时两个 watch 同时触发。

**对比**: `user-dialog.vue` 使用**单一合并 watch**，只触发一次：

```typescript
watch(
  () => [props.visible, props.type, props.userData],
  async ([visible]) => {
    if (visible) {
      await Promise.all([loadRoleList(), initFormData()])
    }
  },
  { immediate: true }
)
```

**修复建议**: 改为单一合并 watch，或删除 Watch 2 只保留 Watch 1。

---

### 问题 3: `initForm` 无竞态保护

**文件**: `showcase-profile-dialog.vue`

**问题**: `initForm` 是 async 函数，内部有 `await fetchGetShowcaseProfileDetail(id)`。由于问题 2 的双 watch 会触发两次，加上用户可能快速关闭/重新打开弹窗，多个 `initForm` 可能并行执行。

**风险场景**:

1. 用户点击编辑 A → 请求 A 发出
2. 用户快速关闭，点击编辑 B → 请求 B 发出
3. 请求 A 晚于请求 B 返回 → 表单数据被错误覆盖为 A 的数据

**对比**: `role-edit-dialog.vue` 的 `initForm` 是**同步函数**（直接从 props 赋值，无 API 调用），不存在此风险。

**修复建议**: 加入竞态控制：

```typescript
let requestId = 0
const initForm = async () => {
  const currentRequestId = ++requestId
  // ... fetch ...
  if (currentRequestId !== requestId) return // 过期请求，丢弃
  // ... 赋值 ...
}
```

---

## High 级别

### 问题 4: `handleSubmit` 中 validate 回调未正确 await

**文件**: `showcase-profile-dialog.vue`

**当前代码**:

```typescript
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    // ← 问题
    if (!valid) return
    submitLoading.value = true
    try {
      /* ... API 调用 ... */
    } finally {
      submitLoading.value = false
    }
  })
}
```

**问题**: `el-form.validate(callback)` 传入回调时返回 `undefined`，不是 Promise。`await undefined` 立即 resolve，不会等待回调内的 async 操作完成。导致 `submitLoading` 状态可能提前结束。

**对比**: `role-edit-dialog.vue` 使用 Promise 模式（正确写法）：

```typescript
await formRef.value.validate() // 无回调，返回 Promise
```

**修复建议**: 改用 Promise 模式：

```typescript
const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    /* ... */
  } finally {
    submitLoading.value = false
  }
}
```

---

### 问题 5: Create/Update DTO 包含不应由前端提交的审计字段

**文件**: `src/types/api/showcase-profile.d.ts`

**问题**: `CreateShowcaseProfileParams` 和 `UpdateShowcaseProfileParams` 中包含了 `createdAt` 和 `updatedAt` 字段。

**对比**: 项目中 user、role、dict 模块的 Create/Update DTO 均**不包含**这两个审计字段。

**修复建议**: 生成器模板应将 `createdAt`、`updatedAt` 等审计字段从 Create/Update DTO 中排除。

---

## Medium 级别

### 问题 6: `SearchFormModel` 在父子组件重复定义

**文件**:

- `index.vue` 第 61-98 行
- `showcase-profile-search.vue` 第 30-67 行

完全相同的 `SearchFormModel` 类型在两个文件中各定义了一次。

**对比**: `user` 模块的 search 组件使用 `Record<string, any>` 接收 props，`index.vue` 用 inline ref 类型，**没有重复定义**。

**修复建议**: 将 `SearchFormModel` 提取到 `showcase-profile.d.ts` 中统一定义，或从 search 组件 export。

---

## Low 级别

### 问题 7: 列表 avatar 列 `if (!src)` 死代码

**文件**: `index.vue`

```typescript
formatter: (row) => {
  const src = row.avatar || defaultAvatar   // defaultAvatar 永远为 truthy
  if (!src) return '-'                       // ← 永远不执行
  return h(ElImage, { ... })
}
```

**对比**: `user/index.vue` 的 avatar 列写法为 `const avatarSrc = row.avatar || defaultAvatar`，然后**直接使用**，没有多余的 `if (!src)` 判断。

**修复建议**: 删除 `if (!src) return '-'` 这行死代码。

---

## 已修复问题（仅供参考）

| #   | 问题                                   | 修复方式                                  |
| --- | -------------------------------------- | ----------------------------------------- |
| 8   | 列配置 width/minWidth 同时设置         | 图片列删除 minWidth，链接列删除冗余 width |
| 9   | `metadata` 类型 `unknown \| null` 冗余 | 改为 `Record<string, unknown> \| null`    |
| 10  | Prettier 格式化（199 个错误）          | `npx eslint --fix` 自动修复               |
| 11  | 空接口继承                             | `interface X extends Y {}` → `type X = Y` |

---

## 需要后端生成器修复的模板汇总

| 优先级 | 模板位置 | 问题 | 修复方式 |
| --- | --- | --- | --- |
| **Critical** | dialog / search 模板字典 ElOption | 字典 value 类型不匹配 | 整数字段使用 `Number(item.value)` |
| **Critical** | dialog 模板 watch 逻辑 | 双 watch 重复触发 | 改为单一合并 watch（参考 user-dialog） |
| **Critical** | dialog 模板 initForm | 无竞态保护 | 添加请求序列号或 AbortController |
| **High** | dialog 模板 handleSubmit | validate 回调模式不正确 | 改用 Promise 模式（参考 role-edit-dialog） |
| **High** | d.ts 模板 Create/Update DTO | 包含 createdAt/updatedAt | 排除审计字段 |
| **Medium** | search + index 模板 | SearchFormModel 重复定义 | 提取到 d.ts 统一定义 |
| **Low** | index.vue 列表模板 avatar 列 | `if (!src)` 死代码 | 删除多余判断 |
| **Low** | 全部模板 | 字段间双空行 | 分隔符 `\n\n` → `\n` |
| **Low** | d.ts 模板 | 空接口继承 | DetailVo 改用 `type X = Y` |
