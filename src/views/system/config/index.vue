<template>
  <div class="art-full-height">
    <ConfigSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showFormPanel('add')" v-ripple>新增系统参数配置</ElButton>
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

    <ConfigFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :config-data="currentConfigData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetConfigList, fetchDeleteConfig } from '@/api/config'
  import type { ConfigListItem, SearchFormModel } from './types'
  import ConfigSearch from './modules/config-search.vue'
  import ConfigFormPanel from './modules/config-form-panel.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useDict, dictClassToTagType } from '@/utils/dict'

  defineOptions({ name: 'Config' })

  const { getDictLabel, getDictClass } = useDict()

  const searchForm = ref<SearchFormModel>({
    configName: undefined,
    configKey: undefined,
    configGroup: undefined,
    valueType: undefined,
    enabled: undefined
  })

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentConfigData = ref<ConfigListItem | undefined>(undefined)

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
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetConfigList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '配置ID',
          width: 120,
          sortable: true
        },
        {
          prop: 'configName',
          label: '配置名称',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'configKey',
          label: '配置键',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'configValue',
          label: '当前配置值',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'defaultValue',
          label: '默认配置值',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'valueType',
          label: '值类型',
          width: 120,
          sortable: true,
          formatter: (row) => {
            const label = getDictLabel('config_value_type', row.valueType)
            const listClass = getDictClass('config_value_type', row.valueType)
            const type = dictClassToTagType(listClass)
            return h(ElTag, { type }, () => label)
          }
        },
        {
          prop: 'configGroup',
          label: '配置分组编码',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'configSort',
          label: '同分组内排序',
          width: 120,
          sortable: true
        },
        {
          prop: 'enabled',
          label: '是否启用',
          width: 110,
          sortable: true,
          formatter: (row) =>
            h(ElTag, { type: row.enabled ? 'success' : 'warning' }, () =>
              row.enabled ? '是' : '否'
            )
        },
        {
          prop: 'isSystem',
          label: '是否系统内置',
          width: 110,
          sortable: true,
          formatter: (row) =>
            h(ElTag, { type: row.isSystem ? 'success' : 'warning' }, () =>
              row.isSystem ? '是' : '否'
            )
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
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
          formatter: (row) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'edit',
                    label: '编辑系统参数配置',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除系统参数配置',
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

  const showFormPanel = (type: 'add' | 'edit', row?: ConfigListItem) => {
    formPanelMode.value = type
    currentConfigData.value = row
    formPanelVisible.value = true
  }

  const handleSearch = (params: SearchFormModel) => {
    const nextParams = { ...params }
    Object.assign(searchParams, nextParams)
    getData()
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ConfigListItem) => {
    switch (item.key) {
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleDelete = (row: ConfigListItem) => {
    ElMessageBox.confirm(`确定删除系统参数配置"${row.configName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchDeleteConfig(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
