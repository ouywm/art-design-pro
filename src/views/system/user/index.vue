<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />

      <!-- 重置密码弹窗 -->
      <ResetPasswordDialog
        v-model:visible="resetPasswordDialogVisible"
        :user-id="resetPasswordUserId"
        :user-name="resetPasswordUserName"
        @submit="handleResetPasswordSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser, fetchResetUserPassword } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import ResetPasswordDialog from './modules/reset-password-dialog.vue'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'
  import { useDict, dictClassToTagType } from '@/utils/dict'
  import defaultAvatar from '@imgs/user/avatar.webp'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem
  type UserSearchFormParams = Api.SystemManage.UserSearchFilters

  // 字典工具
  const { getDictLabel, getDictClass } = useDict()

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 重置密码弹窗相关
  const resetPasswordDialogVisible = ref(false)
  const resetPasswordUserId = ref(0)
  const resetPasswordUserName = ref('')

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref<UserSearchFormParams>({
    userName: undefined,
    gender: undefined as Api.SystemManage.Gender | undefined,
    phone: undefined,
    email: undefined,
    status: undefined as Api.SystemManage.UserStatus | undefined
  })

  /**
   * 获取用户状态配置（使用字典）
   */
  const getUserStatusConfig = (status: number) => {
    const label = getDictLabel('user_status', status)
    const listClass = getDictClass('user_status', status)
    const type = dictClassToTagType(listClass)
    return { type, text: label }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            const avatarSrc = row.avatar || defaultAvatar
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: avatarSrc,
                previewSrcList: row.avatar ? [row.avatar] : undefined,
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userName),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'userGender',
          label: '性别',
          sortable: true,
          formatter: (row) => row.userGender
        },
        { prop: 'userPhone', label: '手机号' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'edit',
                    label: '编辑用户',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'reset-password',
                    label: '重置密码',
                    icon: 'ri:key-2-line',
                    auth: 'reset-password'
                  },
                  {
                    key: 'delete',
                    label: '注销用户',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: UserSearchFormParams) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      await fetchDeleteUser(row.id)
      ElMessage.success('注销成功')
      refreshRemove()
    })
  }

  /**
   * 更多操作按钮点击
   */
  const handleMoreClick = (item: ButtonMoreItem, row: UserListItem) => {
    switch (item.key) {
      case 'edit':
        showDialog('edit', row)
        break
      case 'reset-password':
        handleResetPassword(row)
        break
      case 'delete':
        deleteUser(row)
        break
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = (type: DialogType) => {
    currentUserData.value = {}
    if (type === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }

  /**
   * 重置用户密码
   */
  const handleResetPassword = (row: UserListItem): void => {
    resetPasswordUserId.value = row.id
    resetPasswordUserName.value = row.userName
    resetPasswordDialogVisible.value = true
  }

  /**
   * 处理重置密码提交
   */
  const handleResetPasswordSubmit = async (userId: number, newPassword: string): Promise<void> => {
    try {
      await fetchResetUserPassword(userId, { newPassword })
      ElMessage.success('密码重置成功')
      resetPasswordDialogVisible.value = false
    } catch {
      // 错误已经在 http 拦截器中处理
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
