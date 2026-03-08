# 字典系统使用文档

## 概述

字典系统提供了一个集中管理枚举值和选项数据的解决方案，避免在代码中硬编码选项值。

## 架构设计

### 1. Store 层（`src/store/modules/dict.ts`）

- **职责**：仅负责状态管理，不调用 HTTP
- **方法**：
  - `setDictData(data)` - 设置所有字典数据
  - `setDictByType(dictType, data)` - 设置单个字典类型
  - `clearDict()` - 清空字典数据
  - `getDict(dictType)` - 获取字典数据
  - `getDictLabel(dictType, value)` - 获取标签文本
  - `getDictClass(dictType, value)` - 获取样式类名

### 2. API 层（`src/api/dict-manage.ts`）

- **职责**：HTTP 请求
- **方法**：
  - `fetchGetAllDictData()` - 获取所有字典数据
  - `fetchGetDictDataByType(dictType)` - 获取单个字典类型
  - 字典类型和字典数据的 CRUD 操作

### 3. 工具层（`src/utils/dict.ts`）

- **职责**：提供便捷的访问方法
- **方法**：
  - `useDict()` - 组合式函数，返回字典访问方法
  - `dictClassToTagType(listClass)` - 转换样式类名为 Element Plus Tag type

### 4. 路由守卫（`src/router/guards/beforeEach.ts`）

- **职责**：在用户登录后自动加载字典数据
- **流程**：
  1. 获取用户信息
  2. 加载字典数据（调用 API，存入 Store）
  3. 获取菜单数据
  4. 注册路由

## 使用示例

### 1. 在组件中使用字典（下拉框）

```vue
<template>
  <ElSelect v-model="formData.status">
    <ElOption
      v-for="item in statusOptions"
      :key="item.value"
      :label="item.label"
      :value="Number(item.value)"
    />
  </ElSelect>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'

  const { getDict } = useDict()

  // 获取字典数据
  const statusOptions = computed(() => getDict('user_status'))

  const formData = reactive({
    status: undefined
  })
</script>
```

### 2. 显示字典标签（表格列）

```vue
<template>
  <ElTag :type="getStatusTagType(row.status)">
    {{ getDictLabel('user_status', row.status) }}
  </ElTag>
</template>

<script setup lang="ts">
  import { useDict, dictClassToTagType } from '@/utils/dict'

  const { getDictLabel, getDictClass } = useDict()

  const getStatusTagType = (status: number) => {
    const listClass = getDictClass('user_status', status)
    return dictClassToTagType(listClass)
  }
</script>
```

### 3. 在搜索表单中使用

```typescript
import { useDict } from '@/utils/dict'

const { getDict } = useDict()

const formItems = computed(() => [
  {
    label: '状态',
    key: 'status',
    type: 'select',
    props: {
      placeholder: '请选择状态',
      options: getDict('user_status').map((item) => ({
        label: item.label,
        value: item.value
      }))
    }
  }
])
```

## 后台配置

### 1. 配置字典类型

在后台管理界面创建字典类型：

- **字典类型编码**：`user_status`（用于代码中引用）
- **字典名称**：`用户状态`（显示名称）
- **状态**：启用

### 2. 配置字典数据

为字典类型添加数据项：

| 标签 | 值  | 样式类  | 排序 |
| ---- | --- | ------- | ---- |
| 启用 | 1   | success | 1    |
| 禁用 | 2   | warning | 2    |
| 注销 | 3   | danger  | 3    |

**样式类说明**：

- `success` - 绿色（成功）
- `warning` - 橙色（警告）
- `danger` - 红色（危险）
- `info` - 蓝色（信息）

## 常见字典类型

建议在后台配置以下常用字典：

- `user_status` - 用户状态
- `user_gender` - 用户性别
- `menu_type` - 菜单类型
- `yes_no` - 是/否
- `enable_disable` - 启用/禁用

## 优势

1. **集中管理**：所有枚举值统一在后台配置
2. **灵活调整**：无需修改代码即可调整选项
3. **一致性**：全系统使用统一的数据源
4. **可维护性**：减少硬编码，提高代码质量
5. **国际化友好**：可为不同语言配置不同字典

## 注意事项

1. **字典类型编码**：必须在代码中保持一致
2. **字典值**：建议使用数字，与后端枚举值对应
3. **样式类**：使用 Element Plus 支持的类型
4. **性能**：字典数据在登录时一次性加载，缓存在内存中
5. **登出清理**：用户登出时会自动清空字典数据

## API 文档

### 获取所有字典数据

```typescript
GET / api / dict / all
Response: Record<string, DictDataSimpleVo[]>
```

### 根据类型获取字典数据

```typescript
GET /api/dict/data/{dictType}
Response: DictDataSimpleVo[]
```

### 字典数据结构

```typescript
interface DictDataSimpleVo {
  label: string // 显示标签
  value: string // 字典值
  listClass: string // 样式类名
}
```
