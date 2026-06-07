<template>
  <div class="resource-permission-page art-full-height">
    <ResourceSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'create'" @click="openDialog('add')" v-ripple>新增资源</ElButton>
            <ElButton
              v-auth="'reload'"
              :loading="reloadLoading"
              @click="handleReloadPermission"
              v-ripple
            >
              刷新策略
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <ResourceDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :row="currentRow"
        @success="handleDialogSuccess"
      />

      <ResourceActionDialog v-model:visible="actionDialogVisible" :row="currentRow" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import type { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchDeleteResource,
    fetchGetResourceList,
    fetchReloadResourcePermission,
    fetchUpdateResourceEnabled
  } from '@/api/resource-permission'
  import { ElMessage, ElMessageBox, ElSwitch, ElTag } from 'element-plus'
  import ResourceSearch from './modules/resource-search.vue'
  import ResourceDialog from './modules/resource-dialog.vue'
  import ResourceActionDialog from './modules/resource-action-dialog.vue'
  import { RESOURCE_METHOD_TAG_TYPE } from './constants'
  import type { ResourceFormMode, ResourceListItem, ResourceSearchForm } from './types'

  defineOptions({ name: 'ResourcePermission' })

  const searchForm = ref<ResourceSearchForm>({
    resourceName: undefined,
    resourceCode: undefined,
    method: undefined,
    path: undefined,
    enabled: undefined
  })

  const dialogVisible = ref(false)
  const actionDialogVisible = ref(false)
  const dialogMode = ref<ResourceFormMode>('add')
  const currentRow = ref<Partial<ResourceListItem>>({})
  const reloadLoading = ref(false)
  const switchLoadingMap = reactive<Record<number, boolean>>({})

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetResourceList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'resourceName',
          label: '资源名称',
          minWidth: 180
        },
        {
          prop: 'resourceCode',
          label: '资源编码',
          minWidth: 220,
          formatter: (row) => h('code', { class: 'resource-code' }, row.resourceCode)
        },
        {
          prop: 'method',
          label: '请求方式',
          width: 110,
          formatter: (row) =>
            h(ElTag, { type: RESOURCE_METHOD_TAG_TYPE[row.method] }, () => row.method)
        },
        {
          prop: 'path',
          label: '接口路径',
          minWidth: 260,
          formatter: (row) => h('code', { class: 'resource-path' }, row.path)
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 110,
          formatter: (row) =>
            h(ElSwitch, {
              modelValue: row.enabled,
              loading: switchLoadingMap[row.id],
              activeText: '启用',
              inactiveText: '停用',
              inlinePrompt: true,
              onChange: (value: string | number | boolean) =>
                handleToggleEnabled(row, value === true)
            })
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180,
          formatter: (row) => row.updateTime || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row) =>
            h(ArtButtonMore, {
              list: [
                {
                  key: 'edit',
                  label: '编辑资源',
                  icon: 'ri:edit-2-line',
                  auth: 'update'
                },
                {
                  key: 'actions',
                  label: '查看绑定按钮',
                  icon: 'ri:link'
                },
                {
                  key: 'delete',
                  label: '删除资源',
                  icon: 'ri:delete-bin-4-line',
                  color: '#f56c6c',
                  auth: 'delete'
                }
              ],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: ResourceSearchForm) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    searchForm.value = {
      resourceName: undefined,
      resourceCode: undefined,
      method: undefined,
      path: undefined,
      enabled: undefined
    }
    resetSearchParams()
  }

  const openDialog = (mode: ResourceFormMode, row?: ResourceListItem) => {
    dialogMode.value = mode
    currentRow.value = row || {}
    dialogVisible.value = true
  }

  const openActionDialog = (row: ResourceListItem) => {
    currentRow.value = row
    actionDialogVisible.value = true
  }

  const handleDialogSuccess = (mode: ResourceFormMode) => {
    if (mode === 'add') {
      refreshCreate()
      return
    }

    refreshUpdate()
  }

  const handleToggleEnabled = async (row: ResourceListItem, enabled: boolean) => {
    switchLoadingMap[row.id] = true
    try {
      await fetchUpdateResourceEnabled(row.id, { enabled })
      ElMessage.success(enabled ? '资源已启用' : '资源已停用')
      row.enabled = enabled
    } catch (error) {
      row.enabled = !enabled
      throw error
    } finally {
      switchLoadingMap[row.id] = false
    }
  }

  const handleDelete = (row: ResourceListItem) => {
    ElMessageBox.confirm(`确定要删除资源「${row.resourceName}」吗？`, '删除资源', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteResource(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleReloadPermission = async () => {
    reloadLoading.value = true
    try {
      await fetchReloadResourcePermission()
      ElMessage.success('资源权限策略已刷新')
    } finally {
      reloadLoading.value = false
    }
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ResourceListItem) => {
    switch (item.key) {
      case 'edit':
        openDialog('edit', row)
        break
      case 'actions':
        openActionDialog(row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }
</script>

<style scoped lang="scss">
  .resource-permission-page {
    :deep(.resource-code),
    :deep(.resource-path) {
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      color: var(--art-gray-800);
      word-break: break-all;
    }
  }
</style>
