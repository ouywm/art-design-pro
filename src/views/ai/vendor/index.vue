<template>
  <div class="vendor-page art-full-height">
    <VendorSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card vendor-page-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增供应商</ElButton>
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

      <VendorDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :vendor-data="currentVendorData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteVendor, fetchGetVendorList } from '@/api/ai-vendor'
  import { useTable } from '@/hooks/core/useTable'
  import type { DialogType } from '@/types'
  import { ElLink, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import {
    getApiStyleLabel,
    getApiStyleTagType,
    getEnabledLabel,
    getEnabledTagType
  } from './constants'
  import VendorDialog from './modules/vendor-dialog.vue'
  import VendorSearch from './modules/vendor-search.vue'
  import type { SearchFormModel, VendorListItem } from './types'

  defineOptions({ name: 'AiVendor' })

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentVendorData = ref<Partial<VendorListItem>>({})

  const searchForm = ref<SearchFormModel>({
    keyword: undefined,
    vendorCode: undefined,
    apiStyle: undefined,
    enabled: undefined
  })

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
      apiFn: fetchGetVendorList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'vendorName',
          label: '供应商',
          minWidth: 240,
          formatter: (row) =>
            h('div', { class: 'vendor-cell' }, [
              h('div', { class: 'vendor-cell__name' }, row.vendorName),
              h(
                'div',
                { class: 'vendor-cell__meta' },
                `${row.vendorCode}${row.description ? ` · ${row.description}` : ''}`
              )
            ])
        },
        {
          prop: 'apiStyle',
          label: '接口风格',
          minWidth: 160,
          formatter: (row) =>
            h(ElTag, { type: getApiStyleTagType(row.apiStyle) }, () =>
              getApiStyleLabel(row.apiStyle)
            )
        },
        {
          prop: 'baseUrl',
          label: '接口地址',
          minWidth: 260,
          formatter: (row) =>
            h('div', { class: 'vendor-url-cell' }, [
              row.baseUrl
                ? h(
                    ElLink,
                    {
                      href: row.baseUrl,
                      target: '_blank',
                      type: 'primary',
                      underline: false
                    },
                    () => row.baseUrl
                  )
                : h('span', { class: 'vendor-url-cell__empty' }, '-'),
              row.docUrl
                ? h(
                    ElLink,
                    {
                      href: row.docUrl,
                      target: '_blank',
                      type: 'info',
                      underline: false,
                      class: 'vendor-url-cell__secondary'
                    },
                    () => '文档地址'
                  )
                : null
            ])
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: getEnabledTagType(row.enabled) }, () => getEnabledLabel(row.enabled))
        },
        {
          prop: 'vendorSort',
          label: '排序',
          width: 90
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          minWidth: 170
        },
        {
          prop: 'operation',
          label: '操作',
          width: 90,
          fixed: 'right',
          formatter: (row) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑供应商', icon: 'ri:edit-2-line' },
                {
                  key: 'delete',
                  label: '删除供应商',
                  icon: 'ri:delete-bin-4-line',
                  color: '#f56c6c'
                }
              ],
              onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: SearchFormModel) => {
    replaceSearchParams(params)
    getData()
  }

  const showDialog = (type: DialogType, row?: VendorListItem) => {
    dialogType.value = type
    currentVendorData.value = row || {}
    dialogVisible.value = true
  }

  const deleteVendor = (row: VendorListItem) => {
    ElMessageBox.confirm(`确定删除供应商“${row.vendorName}”吗？`, '删除供应商', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteVendor(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: VendorListItem) => {
    if (item.key === 'edit') {
      showDialog('edit', row)
      return
    }
    if (item.key === 'delete') {
      deleteVendor(row)
    }
  }

  const handleDialogSubmit = async (type: DialogType) => {
    if (type === 'add') {
      await refreshCreate()
    } else {
      await refreshUpdate()
    }
  }
</script>

<style scoped lang="scss">
  .vendor-page {
    .vendor-page-card {
      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }
  }

  .vendor-cell,
  .vendor-url-cell {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .vendor-cell {
    &__name {
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      margin-top: 4px;
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .vendor-url-cell {
    gap: 4px;

    :deep(.el-link) {
      justify-content: flex-start;
      width: fit-content;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__secondary {
      font-size: 12px;
    }

    &__empty {
      color: var(--el-text-color-disabled);
    }
  }
</style>
