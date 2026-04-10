<template>
  <div class="art-full-height">
    <VendorSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ 'margin-top': showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="openDialog('add')" v-ripple>新增供应商</ElButton>
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
    </ElCard>

    <VendorDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :vendor-data="currentVendorData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { fetchDeleteAiVendor, fetchGetAiVendorList } from '@/api/ai-admin'
  import { useTable } from '@/hooks/core/useTable'
  import { DialogType } from '@/types'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import VendorDialog from './modules/vendor-dialog.vue'
  import VendorSearch from './modules/vendor-search.vue'
  import type { VendorListItem, VendorSearchFormModel } from './types'

  defineOptions({ name: 'AiVendor' })

  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const currentVendorData = ref<Partial<VendorListItem>>({})

  const searchForm = ref<VendorSearchFormModel>({
    vendorCode: undefined,
    vendorName: undefined,
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
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetAiVendorList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'vendorName',
          label: '供应商名称',
          minWidth: 180
        },
        {
          prop: 'vendorCode',
          label: '供应商编码',
          minWidth: 160
        },
        {
          prop: 'apiStyle',
          label: 'API 风格',
          minWidth: 150
        },
        {
          prop: 'baseUrl',
          label: '基础地址',
          minWidth: 220,
          showOverflowTooltip: true
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 100,
          formatter: (row: VendorListItem) =>
            h(ElTag, { type: row.enabled ? 'success' : 'warning' }, () =>
              row.enabled ? '启用' : '停用'
            )
        },
        {
          prop: 'vendorSort',
          label: '排序',
          width: 90,
          sortable: true
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: VendorListItem) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑供应商', icon: 'ri:edit-2-line', auth: 'edit' },
                {
                  key: 'delete',
                  label: '删除供应商',
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

  const handleSearch = (params: VendorSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const openDialog = (type: DialogType, row?: VendorListItem) => {
    dialogType.value = type
    currentVendorData.value = row || {}
    dialogVisible.value = true
  }

  const handleDelete = (row: VendorListItem) => {
    ElMessageBox.confirm(`确定删除供应商“${row.vendorName}”吗？`, '删除供应商', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAiVendor(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: ButtonMoreItem, row: VendorListItem) => {
    switch (item.key) {
      case 'edit':
        openDialog('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleDialogSubmit = (type: DialogType) => {
    currentVendorData.value = {}
    if (type === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>
