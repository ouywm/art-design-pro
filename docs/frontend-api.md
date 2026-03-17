# SummerRS Admin 前端接口文档

## 一、全局约定

### 1.1 响应格式

**成功响应**：直接返回业务数据，**没有统一包装**（无 `code`/`message`/`data` 外壳）。

```
HTTP 200 OK
Content-Type: application/json

// 返回对象
{ "accessToken": "xxx", "refreshToken": "yyy", "expiresIn": 7200 }

// 返回数组
[{ "device": "web", ... }]

// 无返回体（创建/更新/删除操作）
HTTP 200 OK
（空 body）
```

**错误响应**：遵循 [RFC 7807 Problem Details](https://www.rfc-editor.org/rfc/rfc7807) 标准格式。

```json
{
  "type": "forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "无权限"
}
```

| 字段     | 类型     | 说明                                       |
| -------- | -------- | ------------------------------------------ |
| `type`   | `string` | 错误类型标识（见下表）                     |
| `title`  | `string` | 错误类型名称                               |
| `status` | `number` | HTTP 状态码                                |
| `detail` | `string` | 错误详情描述（可选，具体的错误信息在这里） |

**错误类型一览**：

| type                   | status | 含义            |
| ---------------------- | ------ | --------------- |
| `bad-request`          | 400    | 请求参数错误    |
| `not-authenticated`    | 401    | 未登录/登录过期 |
| `forbidden`            | 403    | 无权限          |
| `not-found`            | 404    | 资源不存在      |
| `conflict`             | 409    | 资源冲突        |
| `multipart-incomplete` | 409    | 分片上传不完整  |
| `validation-failed`    | 422    | 参数校验失败    |
| `too-many-requests`    | 429    | 请求过于频繁    |
| `internal-error`       | 500    | 服务器内部错误  |
| `service-unavailable`  | 503    | 服务不可用      |

前端建议统一拦截逻辑：

- `401` → 跳转登录页（或尝试 refresh token）
- `403` → 提示"无权限"
- 其他 → 读取 `detail` 字段展示

### 1.2 认证方式

请求头携带 Access Token：

```
Authorization: Bearer <access_token>
```

### 1.3 分页约定

分页接口使用 Query 参数：

| 参数   | 类型     | 默认值 | 说明                             |
| ------ | -------- | ------ | -------------------------------- |
| `page` | `number` | `1`    | 页码（1-based，即第 1 页传 `1`） |
| `size` | `number` | `20`   | 每页条数（服务端有最大值限制）   |

分页响应结构：

```json
{
  "content": [],
  "page": 1,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5
}
```

### 1.4 时间格式

所有时间字段统一序列化为字符串：`"YYYY-MM-DD HH:mm:ss"`

示例：`"2025-03-15 14:30:00"`

### 1.5 字段命名

所有请求/响应字段均使用 **camelCase** 驼峰命名。

---

## 二、认证模块

### 2.1 管理员登录

`POST /auth/login`

**请求体**：

```json
{
  "userName": "admin",
  "password": "123456"
}
```

**响应**：

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 7200
}
```

| 字段           | 类型     | 说明                          |
| -------------- | -------- | ----------------------------- |
| `accessToken`  | `string` | 访问令牌（短期，默认 2 小时） |
| `refreshToken` | `string` | 刷新令牌（长期，默认 7 天）   |
| `expiresIn`    | `number` | accessToken 有效期（秒）      |

### 2.2 B 端登录

`POST /auth/biz/login`

**请求体**：同管理员登录（`userName` + `password`）

**响应**：同管理员登录

### 2.3 C 端登录

`POST /auth/customer/login`

**请求体**：

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应**：同管理员登录

### 2.4 刷新 Token

`POST /auth/refresh`

> 无需携带 Authorization 头，用 refreshToken 换取新的 token 对。

**请求体**：

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**响应**：

```json
{
  "accessToken": "新的 access token",
  "refreshToken": "新的 refresh token",
  "expiresIn": 7200
}
```

刷新后，旧的 accessToken 和 refreshToken **立即失效**，前端需要用新的 token 替换存储。

### 2.5 退出登录（当前设备）

`POST /auth/logout`

> 需要 Authorization 头

**响应**：空 body，HTTP 200

### 2.6 退出所有设备

`POST /auth/logout/all`

> 需要 Authorization 头

**响应**：空 body，HTTP 200

### 2.7 查看在线设备

`GET /auth/sessions`

> 需要 Authorization 头

**响应**：

```json
[
  {
    "device": "web",
    "loginTime": 1710489600000,
    "lastActiveTime": 1710493200000,
    "loginIp": "192.168.1.100",
    "browser": "Chrome 121",
    "os": "Windows 10"
  }
]
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `device` | `string` | 设备类型：`web` / `android` / `ios` / `mini_program` / `tablet` / `desktop` |
| `loginTime` | `number` | 登录时间（Unix 毫秒时间戳） |
| `lastActiveTime` | `number` | 最后活跃时间（Unix 毫秒时间戳） |
| `loginIp` | `string` | 登录 IP |
| `browser` | `string` | 浏览器信息 |
| `os` | `string` | 操作系统信息 |

### 2.8 踢下指定设备

`DELETE /auth/sessions/{device}`

> 需要 Authorization 头

路径参数 `device` 为设备类型，如 `web`、`android` 等。

**响应**：空 body，HTTP 200

---

## 三、用户管理

### 3.1 获取当前用户信息

`GET /user/info`

> 需要 Authorization 头。登录后调用，获取当前用户的角色和按钮权限。

**响应**：

```json
{
  "userId": 1,
  "userName": "admin",
  "email": "admin@example.com",
  "avatar": "https://...",
  "roles": ["admin", "editor"],
  "buttons": ["system:user:create", "system:user:delete"]
}
```

| 字段       | 类型       | 说明             |
| ---------- | ---------- | ---------------- |
| `userId`   | `number`   | 用户 ID          |
| `userName` | `string`   | 用户名           |
| `email`    | `string`   | 邮箱             |
| `avatar`   | `string`   | 头像 URL         |
| `roles`    | `string[]` | 角色编码列表     |
| `buttons`  | `string[]` | 按钮权限标识列表 |

### 3.2 查询用户列表（分页）

`GET /user/list`

> 需要权限：`system:user:list`

**Query 参数**：

| 参数         | 类型     | 必填 | 说明                             |
| ------------ | -------- | ---- | -------------------------------- |
| `page`       | `number` | 否   | 页码                             |
| `size`       | `number` | 否   | 每页条数                         |
| `userName`   | `string` | 否   | 用户名（模糊）                   |
| `userPhone`  | `string` | 否   | 手机号（模糊）                   |
| `userEmail`  | `string` | 否   | 邮箱（模糊）                     |
| `status`     | `number` | 否   | 状态：`1`=启用 `2`=禁用 `3`=注销 |
| `userGender` | `number` | 否   | 性别：`0`=未知 `1`=男 `2`=女     |

**响应**：`Page<UserVo>`

```json
{
  "content": [
    {
      "id": 1,
      "avatar": "https://...",
      "status": 1,
      "userName": "admin",
      "userGender": "男",
      "nickName": "管理员",
      "userPhone": "13800138000",
      "userEmail": "admin@example.com",
      "createBy": "system",
      "createTime": "2025-01-01 00:00:00",
      "updateBy": "admin",
      "updateTime": "2025-03-15 14:30:00"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 50,
  "totalPages": 3
}
```

### 3.3 获取用户详情

`GET /user/{id}`

**响应**：（UserVo 所有字段 + roles）

```json
{
  "id": 1,
  "avatar": "https://...",
  "status": 1,
  "userName": "admin",
  "userGender": "男",
  "nickName": "管理员",
  "userPhone": "13800138000",
  "userEmail": "admin@example.com",
  "createBy": "system",
  "createTime": "2025-01-01 00:00:00",
  "updateBy": "admin",
  "updateTime": "2025-03-15 14:30:00",
  "roles": [{ "roleId": 1, "roleName": "超级管理员", "roleCode": "admin" }]
}
```

### 3.4 创建用户

`POST /user`

> 需要权限：`system:user:create`

**请求体**：

```json
{
  "userName": "zhangsan",
  "nickName": "张三",
  "gender": 1,
  "phone": "13800138001",
  "email": "zhangsan@example.com",
  "avatar": "https://...",
  "status": 1,
  "roleIds": [1, 2]
}
```

| 字段       | 类型       | 必填 | 说明                                   |
| ---------- | ---------- | ---- | -------------------------------------- |
| `userName` | `string`   | 是   | 用户名（1-64 字符）                    |
| `nickName` | `string`   | 是   | 昵称（1-64 字符）                      |
| `gender`   | `number`   | 否   | 性别：`0`=未知 `1`=男 `2`=女，默认 `0` |
| `phone`    | `string`   | 否   | 手机号（最长 32 字符）                 |
| `email`    | `string`   | 否   | 邮箱（需符合邮箱格式）                 |
| `avatar`   | `string`   | 否   | 头像 URL（最长 512 字符）              |
| `status`   | `number`   | 否   | 状态，默认 `1`（启用）                 |
| `roleIds`  | `number[]` | 否   | 角色 ID 列表                           |

**响应**：空 body，HTTP 200

### 3.5 更新用户

`PUT /user/{id}`

**请求体**：（所有字段均可选，只传需要更新的字段）

```json
{
  "nickName": "新昵称",
  "gender": 2,
  "phone": "13900139001",
  "email": "new@example.com",
  "avatar": "https://...",
  "status": 1,
  "roleIds": [1, 3]
}
```

**响应**：空 body，HTTP 200

### 3.6 删除用户

`DELETE /user/{id}`

**响应**：空 body，HTTP 200

### 3.7 重置用户密码

`PUT /user/{id}/reset-password`

**请求体**：

```json
{
  "newPassword": "new123456"
}
```

| 字段          | 类型     | 必填 | 说明                |
| ------------- | -------- | ---- | ------------------- |
| `newPassword` | `string` | 是   | 新密码（至少 6 位） |

**响应**：空 body，HTTP 200

---

## 四、个人信息

### 4.1 修改个人密码

`PUT /user/profile/password`

> 需要 Authorization 头

**请求体**：

```json
{
  "oldPassword": "当前密码",
  "newPassword": "新密码至少6位"
}
```

**响应**：空 body，HTTP 200

### 4.2 更新个人信息

`PUT /user/profile`

> 需要 Authorization 头

**请求体**：（所有字段均可选）

```json
{
  "nickName": "新昵称",
  "email": "new@example.com",
  "phone": "13900139001",
  "gender": 1,
  "avatar": "https://..."
}
```

**响应**：空 body，HTTP 200

### 4.3 获取个人登录日志

`GET /user/profile/login-logs`

> 需要 Authorization 头

**响应**：当前用户的登录日志列表。

---

## 五、角色管理

### 5.1 查询角色列表（分页）

`GET /role/list`

**Query 参数**：

| 参数          | 类型      | 必填 | 说明                         |
| ------------- | --------- | ---- | ---------------------------- |
| `page`        | `number`  | 否   | 页码                         |
| `size`        | `number`  | 否   | 每页条数                     |
| `roleName`    | `string`  | 否   | 角色名称（模糊）             |
| `roleCode`    | `string`  | 否   | 角色编码（模糊）             |
| `description` | `string`  | 否   | 描述（模糊）                 |
| `enabled`     | `boolean` | 否   | 是否启用                     |
| `startTime`   | `string`  | 否   | 创建时间起始（`YYYY-MM-DD`） |
| `endTime`     | `string`  | 否   | 创建时间截止（`YYYY-MM-DD`） |

**响应**：`Page<RoleVo>`

```json
{
  "content": [
    {
      "roleId": 1,
      "roleName": "超级管理员",
      "roleCode": "admin",
      "description": "系统超级管理员",
      "enabled": true,
      "createTime": "2025-01-01 00:00:00"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 10,
  "totalPages": 1
}
```

### 5.2 创建角色

`POST /role`

**请求体**：

```json
{
  "roleName": "编辑员",
  "roleCode": "editor",
  "description": "内容编辑员",
  "enabled": true
}
```

| 字段          | 类型      | 必填 | 说明                  |
| ------------- | --------- | ---- | --------------------- |
| `roleName`    | `string`  | 是   | 角色名称（1-64 字符） |
| `roleCode`    | `string`  | 是   | 角色编码（1-32 字符） |
| `description` | `string`  | 否   | 描述（最长 512 字符） |
| `enabled`     | `boolean` | 否   | 是否启用，默认 `true` |

**响应**：空 body，HTTP 200

### 5.3 更新角色

`PUT /role/{roleId}`

**请求体**：（所有字段均可选）

```json
{
  "roleName": "新名称",
  "description": "新描述",
  "enabled": false
}
```

**响应**：空 body，HTTP 200

### 5.4 删除角色

`DELETE /role/{roleId}`

**响应**：空 body，HTTP 200

### 5.5 查询角色权限

`GET /role/{roleId}/permissions`

**响应**：

```json
{
  "checkedKeys": [1, 2, 5, 8],
  "halfCheckedKeys": [3]
}
```

| 字段              | 类型       | 说明                           |
| ----------------- | ---------- | ------------------------------ |
| `checkedKeys`     | `number[]` | 完全选中的菜单 ID 列表         |
| `halfCheckedKeys` | `number[]` | 半选中的菜单 ID 列表（父节点） |

### 5.6 保存角色权限

`PUT /role/{roleId}/permissions`

**请求体**：

```json
{
  "menuIds": [1, 2, 3, 5, 8]
}
```

**响应**：空 body，HTTP 200

---

## 六、菜单管理

### 6.1 获取当前用户菜单树

`GET /v3/system/menus`

> 需要 Authorization 头。返回当前登录用户有权限看到的菜单树，用于前端动态路由。

**响应**：

```json
[
  {
    "id": 1,
    "parentId": 0,
    "menuType": 1,
    "path": "/system",
    "name": "System",
    "component": "Layout",
    "redirect": "/system/user",
    "meta": {
      "title": "系统管理",
      "icon": "setting",
      "isHide": false,
      "isHideTab": false,
      "link": "",
      "isIframe": false,
      "keepAlive": true,
      "roles": ["admin"],
      "isFirstLevel": false,
      "fixedTab": false,
      "activePath": "",
      "isFullPage": false,
      "showBadge": false,
      "showTextBadge": "",
      "sort": 1,
      "enabled": true,
      "authList": [
        {
          "id": 10,
          "parentId": 1,
          "title": "新增用户",
          "authName": "新增用户",
          "authMark": "system:user:create",
          "sort": 1,
          "enabled": true,
          "createTime": "2025-01-01 00:00:00",
          "updateTime": "2025-01-01 00:00:00"
        }
      ]
    },
    "createTime": "2025-01-01 00:00:00",
    "updateTime": "2025-01-01 00:00:00",
    "children": []
  }
]
```

### 6.2 获取所有菜单列表（扁平）

`GET /system/menu/list`

> 用于菜单管理的 CRUD 界面。

**响应**：`MenuVo[]`

```json
[
  {
    "id": 1,
    "parentId": 0,
    "menuType": 1,
    "name": "System",
    "path": "/system",
    "component": "Layout",
    "redirect": "/system/user",
    "icon": "setting",
    "title": "系统管理",
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
    "authName": "",
    "authMark": "",
    "sort": 1,
    "enabled": true,
    "createTime": "2025-01-01 00:00:00",
    "updateTime": "2025-01-01 00:00:00"
  }
]
```

`menuType` 枚举值：`1` = 菜单，`2` = 按钮

### 6.3 创建菜单

`POST /system/menu`

**请求体**：CreateMenuDto

### 6.4 创建按钮

`POST /system/button`

**请求体**：CreateButtonDto

### 6.5 更新菜单

`PUT /system/menu/{id}`

**请求体**：UpdateMenuDto

### 6.6 更新按钮

`PUT /system/button/{id}`

**请求体**：UpdateButtonDto

### 6.7 删除菜单/按钮

`DELETE /system/menu/{id}`

**响应**：空 body，HTTP 200

---

## 七、字典管理

### 7.1 查询字典类型列表（分页）

`GET /dict/type/list`

**Query 参数**：`page`、`size` + 过滤条件

**响应**：`Page<DictTypeVo>`

```json
{
  "content": [
    {
      "id": 1,
      "dictName": "用户性别",
      "dictType": "sys_user_gender",
      "status": 1,
      "isSystem": true,
      "remark": "用户性别列表",
      "createBy": "admin",
      "createTime": "2025-01-01 00:00:00",
      "updateBy": "admin",
      "updateTime": "2025-01-01 00:00:00"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 5,
  "totalPages": 1
}
```

### 7.2 创建/更新/删除字典类型

- `POST /dict/type` — 创建
- `PUT /dict/type/{id}` — 更新
- `DELETE /dict/type/{id}` — 删除

### 7.3 查询字典数据列表（分页）

`GET /dict/data/list`

**响应**：`Page<DictDataVo>`

```json
{
  "content": [
    {
      "id": 1,
      "dictType": "sys_user_gender",
      "dictLabel": "男",
      "dictValue": "1",
      "dictSort": 1,
      "cssClass": "",
      "listClass": "primary",
      "isDefault": false,
      "status": 1,
      "isSystem": true,
      "remark": "",
      "createBy": "admin",
      "createTime": "2025-01-01 00:00:00",
      "updateBy": "admin",
      "updateTime": "2025-01-01 00:00:00"
    }
  ],
  "page": 1,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1
}
```

### 7.4 按类型获取字典数据（下拉框用）

`GET /dict/data/by-type/{dictType}`

**响应**：`DictDataSimpleVo[]`

```json
[
  { "label": "男", "value": "1", "listClass": "primary" },
  { "label": "女", "value": "2", "listClass": "danger" },
  { "label": "未知", "value": "0", "listClass": "info" }
]
```

### 7.5 获取全量字典数据（前端缓存用）

`GET /dict/all`

**响应**：以字典类型为 key 的 Map

```json
{
  "sys_user_gender": [
    { "label": "男", "value": "1", "listClass": "primary" },
    { "label": "女", "value": "2", "listClass": "danger" }
  ],
  "sys_user_status": [
    { "label": "启用", "value": "1", "listClass": "success" },
    { "label": "禁用", "value": "2", "listClass": "warning" }
  ]
}
```

### 7.6 创建/更新/删除字典数据

- `POST /dict/data` — 创建
- `PUT /dict/data/{id}` — 更新
- `DELETE /dict/data/{id}` — 删除

---

## 八、文件管理

### 8.1 单文件上传

`POST /file/upload`

> Content-Type: `multipart/form-data`

**响应**：

```json
{
  "fileId": 1,
  "originalName": "photo.jpg",
  "url": "https://s3.example.com/uploads/xxx.jpg",
  "fileSize": 102400
}
```

### 8.2 批量文件上传

`POST /file/upload/batch`

> Content-Type: `multipart/form-data`

**响应**：

```json
{
  "success": [{ "fileId": 1, "originalName": "a.jpg", "url": "https://...", "fileSize": 1024 }],
  "failed": [{ "originalName": "b.exe", "reason": "不支持的文件类型" }]
}
```

### 8.3 获取 Pre-signed 上传 URL（前端直传）

`POST /file/presign/upload`

**请求体**：PresignUploadDto

**响应**：

```json
{
  "fastUploaded": false,
  "file": null,
  "uploadUrl": "https://s3.example.com/presigned-put-url",
  "filePath": "uploads/2025/03/xxx.jpg",
  "expiresIn": 3600
}
```

若 `fastUploaded = true`，表示秒传命中，`file` 字段直接返回文件信息，无需再上传。

### 8.4 前端直传完成回调

`POST /file/presign/upload/callback`

**请求体**：PresignUploadCallbackDto

**响应**：FileUploadVo

### 8.5 文件列表（分页）

`GET /file/list`

**响应**：`Page<FileVo>`

### 8.6 文件详情

`GET /file/{id}`

**响应**：

```json
{
  "id": 1,
  "fileName": "xxx-uuid.jpg",
  "originalName": "photo.jpg",
  "filePath": "uploads/2025/03/xxx.jpg",
  "fileSize": 102400,
  "fileSuffix": "jpg",
  "mimeType": "image/jpeg",
  "bucket": "public",
  "url": "https://s3.example.com/uploads/xxx.jpg",
  "uploadBy": "admin",
  "createTime": "2025-03-15 14:30:00"
}
```

### 8.7 删除文件

`DELETE /file/{id}`

**响应**：空 body，HTTP 200

---

## 九、日志管理

### 9.1 登录日志列表（分页）

`GET /login-log/list`

**Query 参数**：`page`、`size` + 过滤条件

**响应**：`Page<LoginLogVo>`

### 9.2 操作日志列表（分页）

`GET /operation-log/list`

**Query 参数**：`page`、`size` + 过滤条件

**响应**：`Page<OperationLogVo>`

### 9.3 操作日志详情

`GET /operation-log/{id}`

**响应**：`OperationLogDetailVo`（包含请求参数和响应体的完整 JSON）

---

## 十、系统监控

### 10.1 服务器信息

`GET /monitor/server`

### 10.2 缓存信息

`GET /monitor/cache/info`

### 10.3 缓存键列表

`GET /monitor/cache/keys`

**Query 参数**：`pattern`（匹配模式）、`cursor`（游标分页）

### 10.4 缓存键详情

`GET /monitor/cache/keys/{key}/value`

### 10.5 删除缓存键

`DELETE /monitor/cache/keys/{key}`

### 10.6 批量删除缓存键

`DELETE /monitor/cache/keys`

---

## 十一、枚举值速查

| 枚举       | 值  | 说明 |
| ---------- | --- | ---- |
| Gender     | `0` | 未知 |
|            | `1` | 男   |
|            | `2` | 女   |
| UserStatus | `1` | 启用 |
|            | `2` | 禁用 |
|            | `3` | 注销 |
| MenuType   | `1` | 菜单 |
|            | `2` | 按钮 |
| DictStatus | `1` | 正常 |
|            | `2` | 停用 |

---

## 十二、前端 Token 刷新建议

推荐使用 **请求拦截器** 实现无感刷新：

```
1. 响应拦截器检测到 401
2. 判断是否有 refreshToken
3. 调用 POST /auth/refresh 换取新 token
4. 用新 token 重试原请求
5. 如果 refresh 也失败 → 跳转登录页
```

注意：刷新期间的并发请求需要排队等待，避免多次重复刷新。
