# 后端菜单管理 API 字段规范

## ⚠️ 前后端字段差异标注

### 问题 1: menuType 类型 ✅ 已确认

**后端实际接受**: `menuType` 是 **number** 类型，值为 `1`（菜单）或 `2`（按钮）

**前端当前定义** (`src/types/api/system.d.ts:127`):

```typescript
type MenuType = 1 | 2 // ✅ 正确：使用数字类型
```

**文档中的字符串类型是错误的**，后端实际只支持数字类型。

---

### 问题 2: 菜单页面重复定义类型且字段不匹配 ❌❌❌ 严重问题

**位置**: `src/views/system/menu/index.vue:401-408`

**问题描述**: 页面中定义了 `MenuFormData` 接口，但字段与后端 API 不匹配，且与全局类型定义 `Api.SystemManage.CreateMenuParams` 重复。

#### 字段对比表

| MenuFormData (页面定义) | CreateMenuParams (后端 API) | 状态 | 说明                   |
| ----------------------- | --------------------------- | ---- | ---------------------- |
| `id: number`            | -                           | ❌   | 创建时不需要，后端忽略 |
| `label: string`         | `title: string`             | ❌   | **字段名不匹配**       |
| `isEnable: boolean`     | `enabled: boolean`          | ❌   | **字段名不匹配**       |
| `isMenu: boolean`       | `menuType: 1\|2`            | ❌   | **字段类型完全不同**   |
| `roles: string[]`       | -                           | ❌   | 后端忽略此字段         |
| `authLabel: string`     | -                           | ❌   | 后端没有此字段         |
| `authIcon: string`      | -                           | ❌   | 后端没有此字段         |
| `authSort: number`      | -                           | ❌   | 后端没有此字段         |
| -                       | `parentId?: number`         | ❌   | **MenuFormData 缺少**  |
| -                       | `redirect?: string`         | ❌   | **MenuFormData 缺少**  |
| -                       | `isFirstLevel?: boolean`    | ❌   | **MenuFormData 缺少**  |
| -                       | `authMark?: string`         | ❌   | **MenuFormData 缺少**  |

#### 解决方案

**删除 `MenuFormData` 接口，直接使用全局类型定义 `Api.SystemManage.CreateMenuParams`**

---

## 创建菜单/按钮 API

**接口**: `POST /api/system/menu`

**Content-Type**: `application/json`

---

## 请求字段说明

### 通用字段（菜单和按钮都需要）

| 字段名     | 类型    | 必填 | 说明                            | 验证规则 |
| ---------- | ------- | ---- | ------------------------------- | -------- |
| `menuType` | number  | ✅   | 类型：`1`（菜单）或 `2`（按钮） | 枚举值   |
| `parentId` | number  | ❌   | 父菜单ID，顶级菜单传 0 或不传   | -        |
| `sort`     | number  | ❌   | 排序号，默认 0                  | -        |
| `enabled`  | boolean | ❌   | 是否启用，默认 true             | -        |

---

### 菜单类型（menuType = "menu"）专用字段

| 字段名          | 类型    | 必填 | 说明                        | 验证规则     |
| --------------- | ------- | ---- | --------------------------- | ------------ |
| `name`          | string  | ❌   | 路由名称（Vue Router name） | 最大长度 64  |
| `path`          | string  | ❌   | 路由路径                    | 最大长度 256 |
| `component`     | string  | ❌   | 组件路径                    | 最大长度 256 |
| `redirect`      | string  | ❌   | 重定向路径                  | 最大长度 256 |
| `icon`          | string  | ❌   | 图标名称                    | 最大长度 64  |
| `title`         | string  | ✅   | 菜单标题（显示名称）        | 长度 1-64    |
| `link`          | string  | ❌   | 外链地址                    | 最大长度 512 |
| `isIframe`      | boolean | ❌   | 是否内嵌 iframe，默认 false | -            |
| `isHide`        | boolean | ❌   | 是否隐藏菜单，默认 false    | -            |
| `isHideTab`     | boolean | ❌   | 是否隐藏标签页，默认 false  | -            |
| `isFullPage`    | boolean | ❌   | 是否全屏页面，默认 false    | -            |
| `isFirstLevel`  | boolean | ❌   | 是否一级菜单，默认 false    | -            |
| `keepAlive`     | boolean | ❌   | 是否缓存页面，默认 false    | -            |
| `fixedTab`      | boolean | ❌   | 是否固定标签页，默认 false  | -            |
| `showBadge`     | boolean | ❌   | 是否显示徽标，默认 false    | -            |
| `showTextBadge` | string  | ❌   | 文字徽标内容                | 最大长度 32  |
| `activePath`    | string  | ❌   | 高亮路径                    | 最大长度 256 |

---

### 按钮类型（menuType = "button"）专用字段

| 字段名     | 类型   | 必填 | 说明                     | 验证规则    |
| ---------- | ------ | ---- | ------------------------ | ----------- |
| `title`    | string | ✅   | 按钮显示名称             | 长度 1-64   |
| `authName` | string | ❌   | 权限名称                 | 最大长度 64 |
| `authMark` | string | ❌   | 权限标识（用于权限控制） | 最大长度 64 |

---

## 请求示例

### 创建菜单示例

```json
{
  "menuType": "menu",
  "parentId": 5,
  "name": "testMenu",
  "path": "/system/test",
  "component": "/system/test/index",
  "redirect": "",
  "icon": "icon-test",
  "title": "测试菜单",
  "link": "",
  "isIframe": false,
  "isHide": false,
  "isHideTab": false,
  "isFullPage": false,
  "isFirstLevel": false,
  "keepAlive": true,
  "fixedTab": false,
  "showBadge": false,
  "showTextBadge": "",
  "activePath": "",
  "sort": 10,
  "enabled": true
}
```

### 创建按钮示例

```json
{
  "menuType": "button",
  "parentId": 100,
  "title": "新增",
  "authName": "新增按钮",
  "authMark": "system:user:add",
  "sort": 1,
  "enabled": true
}
```

---

## 响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "创建成功",
  "data": null
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "菜单标题长度必须在1-64之间",
  "data": null
}
```

---

## 更新菜单/按钮 API

**接口**: `PUT /api/system/menu/{id}`

**说明**: 更新时所有字段都是可选的，只传需要修改的字段即可。字段定义与创建接口相同。

---

## 字段映射说明

如果前端使用了不同的字段名，后端支持以下别名映射：

| 前端字段名 | 后端字段名 | 说明          |
| ---------- | ---------- | ------------- |
| `label`    | `title`    | 菜单/按钮标题 |
| `isEnable` | `enabled`  | 是否启用      |

---

## 忽略字段

后端会忽略以下前端发送的字段（不会报错）：

- `id`：创建时由数据库自动生成
- `isMenu`：前端内部使用
- `roles`：角色信息通过角色菜单关联表管理
- `authLabel`：前端内部使用
- `authIcon`：前端内部使用
- `authSort`：前端内部使用

---

## 注意事项

1. **字段命名**: 所有字段使用 camelCase 命名
2. **必填字段**:
   - `menuType` 必填
   - `title` 必填（菜单和按钮都需要）
3. **类型区分**:
   - 菜单类型主要填写路由相关字段（name, path, component 等）
   - 按钮类型主要填写权限相关字段（authName, authMark）
4. **默认值**:
   - 布尔类型字段默认为 false
   - `parentId` 默认为 0（顶级）
   - `sort` 默认为 0
   - `enabled` 默认为 true
5. **验证**: 所有字符串长度验证会在后端自动执行，超长会返回 400 错误

---

## 问题反馈

如有字段不匹配或需要调整的地方，请及时沟通。
