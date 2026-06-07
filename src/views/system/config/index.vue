<template>
  <div class="config-page art-page-view">
    <ConfigHero :stats="configStats" />

    <ConfigStats class="config-page__stats" :stats="configStats" />

    <ConfigSearch
      class="config-page__search"
      v-model="searchForm"
      :group-options="configGroupOptions"
      :dict-type-options="dictTypeOptions"
      @search="handleSearch"
      @reset="handleResetSearch"
    />

    <ElCard class="art-table-card config-table-card" shadow="never">
      <ConfigTableToolbar
        v-model:columns="columnChecks"
        :groups="groupedConfigSections"
        :active-group-id="searchForm.configGroupId"
        :page-count="paginatedConfigList.length"
        :selected-count="selectedRows.length"
        :loading="loading"
        @add-config="showFormPanel('add')"
        @batch-delete="handleBatchDelete"
        @refresh-cache="handleRefreshCache"
        @refresh="refreshPage"
        @group-change="handleGroupChange"
      />

      <div class="config-table-wrap">
        <ArtTable
          :loading="loading"
          :data="paginatedConfigList"
          :columns="columns"
          :pagination="pagination"
          row-key="id"
          @selection-change="handleSelectionChange"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <ConfigGroupFormPanel
      v-model="groupFormPanelVisible"
      :panel-mode="groupFormPanelMode"
      :group-data="currentGroupData"
      @success="handleGroupFormSuccess"
    />

    <ConfigFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :config-data="currentConfigData"
      :group-options="configGroupOptions"
      :dict-type-options="dictTypeOptions"
      @success="handleConfigFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchDeleteConfig,
    fetchDeleteConfigGroup,
    fetchGetConfigGroupList,
    fetchGetGroupedConfigList
  } from '@/api/config'
  import { fetchGetDictTypeList } from '@/api/dict-manage'
  import { dictClassToTagType, useDict } from '@/utils/dict'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import type {
    ConfigGroupSection,
    ConfigListItem,
    ConfigStatsModel,
    LocalPaginationModel,
    SearchFormModel
  } from './types'
  import ConfigFormPanel from './modules/config-form-panel.vue'
  import ConfigGroupFormPanel from './modules/config-group-form-panel.vue'
  import ConfigHero from './modules/config-hero.vue'
  import ConfigSearch from './modules/config-search.vue'
  import ConfigStats from './modules/config-stats.vue'
  import ConfigTableToolbar from './modules/config-table-toolbar.vue'

  defineOptions({ name: 'Config' })

  type ConfigGroupBlockVo = Api.Config.ConfigGroupBlockVo
  type ConfigGroupVo = Api.ConfigGroup.ConfigGroupVo
  type DictTypeVo = Api.SystemManage.DictTypeVo

  const { getDictClass, getDictLabel } = useDict()

  const createDefaultSearchForm = (): SearchFormModel => ({
    keyword: undefined,
    configGroupId: undefined,
    valueType: undefined,
    enabled: undefined,
    isSystem: undefined
  })

  const loading = ref(false)
  const formPanelVisible = ref(false)
  const groupFormPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const groupFormPanelMode = ref<'add' | 'edit'>('add')
  const currentConfigData = ref<ConfigListItem | undefined>(undefined)
  const currentGroupData = ref<ConfigGroupVo | undefined>(undefined)
  const groupedConfigBlocks = ref<Api.Config.ConfigGroupedList>([])
  const configGroupOptions = ref<ConfigGroupVo[]>([])
  const dictTypeOptions = ref<DictTypeVo[]>([])
  const selectedRows = ref<ConfigListItem[]>([])
  const searchForm = reactive<SearchFormModel>(createDefaultSearchForm())
  const pagination = reactive<LocalPaginationModel>({
    page: 1,
    size: 10,
    total: 0
  })

  const sortConfigGroups = (left: ConfigGroupVo, right: ConfigGroupVo): number => {
    if (left.groupSort !== right.groupSort) {
      return left.groupSort - right.groupSort
    }

    const nameResult = left.groupName.localeCompare(right.groupName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.id - right.id
  }

  const sortDictTypes = (left: DictTypeVo, right: DictTypeVo): number => {
    const nameResult = left.dictName.localeCompare(right.dictName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.id - right.id
  }

  const sortConfigItems = (
    left: Api.Config.ConfigGroupItemVo,
    right: Api.Config.ConfigGroupItemVo
  ): number => {
    if (left.configSort !== right.configSort) {
      return left.configSort - right.configSort
    }

    return left.id - right.id
  }

  const sortConfigBlocks = (left: ConfigGroupBlockVo, right: ConfigGroupBlockVo): number => {
    if (left.groupSort !== right.groupSort) {
      return left.groupSort - right.groupSort
    }

    const nameResult = left.groupName.localeCompare(right.groupName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.groupId - right.groupId
  }

  const configGroupMap = computed(() => {
    return new Map(configGroupOptions.value.map((item) => [item.id, item] as const))
  })

  const mapConfigItem = (
    block: ConfigGroupBlockVo,
    item: Api.Config.ConfigGroupItemVo
  ): ConfigListItem => {
    const groupData = configGroupMap.value.get(block.groupId)

    return {
      ...item,
      configGroupId: block.groupId,
      configGroupName: block.groupName,
      configGroupCode: block.groupCode,
      updateTime: groupData?.updateTime,
      updateBy: groupData?.updateBy
    }
  }

  const groupedConfigSections = computed<ConfigGroupSection[]>(() => {
    return [...groupedConfigBlocks.value].sort(sortConfigBlocks).map((block) => ({
      groupId: block.groupId,
      groupName: block.groupName,
      groupCode: block.groupCode,
      groupSort: block.groupSort,
      items: [...block.items].sort(sortConfigItems).map((item) => mapConfigItem(block, item))
    }))
  })

  const allConfigList = computed(() => {
    return groupedConfigSections.value.flatMap((section) => section.items)
  })

  const normalizedKeyword = computed(() => searchForm.keyword?.trim().toLowerCase() || '')

  const filteredConfigList = computed(() => {
    return allConfigList.value.filter((item) => {
      if (searchForm.configGroupId && item.configGroupId !== searchForm.configGroupId) {
        return false
      }

      if (searchForm.valueType && item.valueType !== searchForm.valueType) {
        return false
      }

      if (searchForm.enabled !== undefined && item.enabled !== searchForm.enabled) {
        return false
      }

      if (searchForm.isSystem !== undefined && item.isSystem !== searchForm.isSystem) {
        return false
      }

      if (!normalizedKeyword.value) {
        return true
      }

      return [item.configName, item.configKey, item.remark]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword.value))
    })
  })

  const paginatedConfigList = computed(() => {
    const start = (pagination.page - 1) * pagination.size
    return filteredConfigList.value.slice(start, start + pagination.size)
  })

  const latestUpdate = computed(() => {
    const dates = configGroupOptions.value
      .map((item) => item.updateTime)
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => right.localeCompare(left))

    return dates[0] || '-'
  })

  const configStats = computed<ConfigStatsModel>(() => ({
    total: allConfigList.value.length,
    enabled: allConfigList.value.filter((item) => item.enabled).length,
    builtIn: allConfigList.value.filter((item) => item.isSystem).length,
    groupCount: groupedConfigSections.value.length,
    latestUpdate: latestUpdate.value
  }))

  watch(
    () => filteredConfigList.value.length,
    (total) => {
      pagination.total = total
      const maxPage = Math.max(1, Math.ceil(total / pagination.size))
      if (pagination.page > maxPage) {
        pagination.page = maxPage
      }
    },
    { immediate: true }
  )

  const getValueTypeLabel = (valueType: ConfigListItem['valueType']) => {
    return getDictLabel('config_value_type', valueType)
  }

  const getValueTypeTagType = (valueType: ConfigListItem['valueType']) => {
    return dictClassToTagType(getDictClass('config_value_type', valueType))
  }

  const getGroupDataById = (groupId: number): ConfigGroupVo | undefined => {
    return configGroupMap.value.get(groupId)
  }

  const columnChecks = ref<ColumnOption<ConfigListItem>[]>([])

  const columns = computed<ColumnOption<ConfigListItem>[]>(() => [
    {
      type: 'selection',
      width: 48,
      selectable: (row: ConfigListItem) => !row.isSystem
    },
    {
      type: 'globalIndex',
      width: 60,
      label: '序号'
    },
    {
      prop: 'configName',
      label: '参数名称',
      minWidth: 180
    },
    {
      prop: 'configKey',
      label: '参数键名',
      minWidth: 220,
      formatter: (row) => h('span', { class: 'config-code-cell' }, row.configKey)
    },
    {
      prop: 'configGroupName',
      label: '分组',
      width: 120,
      formatter: (row) =>
        h(ElTag, { type: 'info', effect: 'plain' }, () => row.configGroupName || '-')
    },
    {
      prop: 'valueType',
      label: '类型',
      width: 110,
      formatter: (row) =>
        h(ElTag, { type: getValueTypeTagType(row.valueType) }, () =>
          getValueTypeLabel(row.valueType)
        )
    },
    {
      prop: 'configValue',
      label: '当前值',
      minWidth: 240,
      formatter: (row) =>
        h(
          'span',
          {
            class: 'config-value-cell',
            title: row.configValue || '-'
          },
          row.configValue || '-'
        )
    },
    {
      prop: 'enabled',
      label: '状态',
      width: 100,
      formatter: (row) =>
        h(ElTag, { type: row.enabled ? 'success' : 'info' }, () => (row.enabled ? '启用' : '停用'))
    },
    {
      prop: 'isSystem',
      label: '属性',
      width: 100,
      formatter: (row) =>
        h(ElTag, { type: row.isSystem ? 'warning' : 'info' }, () =>
          row.isSystem ? '内置' : '扩展'
        )
    },
    {
      prop: 'updateTime',
      label: '最后更新',
      width: 180,
      formatter: (row) => row.updateTime || '-'
    },
    {
      prop: 'updateBy',
      label: '更新人',
      width: 120,
      formatter: (row) => row.updateBy || '-'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 140,
      fixed: 'right',
      formatter: (row) =>
        h('div', { class: 'config-action-cell' }, [
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => showFormPanel('edit', row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            iconClass: row.isSystem ? 'bg-error/12 text-error opacity-50 cursor-not-allowed' : '',
            onClick: () => handleDelete(row)
          })
        ])
    }
  ])

  watch(
    columns,
    (list) => {
      if (columnChecks.value.length === 0) {
        columnChecks.value = list.map((item) => ({ ...item }))
      }
    },
    { immediate: true }
  )

  const loadFilterOptions = async () => {
    const [groupResponse, dictTypeResponse] = await Promise.all([
      fetchGetConfigGroupList({ page: 1, size: 1000 }),
      fetchGetDictTypeList({ page: 1, size: 1000 })
    ])

    configGroupOptions.value = [...groupResponse.content].sort(sortConfigGroups)
    dictTypeOptions.value = [...dictTypeResponse.content].sort(sortDictTypes)
  }

  const loadConfigData = async () => {
    loading.value = true
    try {
      groupedConfigBlocks.value = await fetchGetGroupedConfigList({})
    } finally {
      loading.value = false
    }
  }

  const refreshPage = async () => {
    await Promise.all([loadFilterOptions(), loadConfigData()])
  }

  const showGroupFormPanel = (type: 'add' | 'edit', row?: ConfigGroupVo) => {
    groupFormPanelMode.value = type
    currentGroupData.value = row
    groupFormPanelVisible.value = true
  }

  const showFormPanel = (type: 'add' | 'edit', row?: ConfigListItem) => {
    formPanelMode.value = type
    currentConfigData.value = row
    formPanelVisible.value = true
  }

  const handleSearch = async () => {
    pagination.page = 1
  }

  const handleResetSearch = () => {
    Object.assign(searchForm, createDefaultSearchForm())
    pagination.page = 1
  }

  const handleGroupChange = (groupId?: number) => {
    searchForm.configGroupId = groupId
    pagination.page = 1
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.page = 1
  }

  const handleCurrentChange = (page: number) => {
    pagination.page = page
  }

  const handleSelectionChange = (rows: ConfigListItem[]) => {
    selectedRows.value = rows
  }

  const handleConfigFormSuccess = async () => {
    await refreshPage()
  }

  const handleGroupFormSuccess = async () => {
    await refreshPage()
  }

  const handleRefreshCache = async () => {
    await refreshPage()
    ElMessage.success('缓存已刷新')
  }

  const handleDeleteGroup = (section: ConfigGroupSection) => {
    const groupData = getGroupDataById(section.groupId)
    if (!groupData) {
      ElMessage.warning('未找到对应的配置分组')
      return
    }

    ElMessageBox.confirm(`确定删除配置分组"${groupData.groupName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfigGroup(groupData.id)

      if (searchForm.configGroupId === groupData.id) {
        searchForm.configGroupId = undefined
      }

      ElMessage.success('删除配置分组成功')
      await refreshPage()
    })
  }

  const handleDelete = (row: ConfigListItem) => {
    if (row.isSystem) {
      ElMessage.warning('内置参数不允许删除')
      return
    }

    ElMessageBox.confirm(`确定删除系统参数"${row.configName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfig(row.id)
      ElMessage.success('删除成功')
      await loadConfigData()
    })
  }

  const handleBatchDelete = () => {
    const removableRows = selectedRows.value.filter((item) => !item.isSystem)
    if (removableRows.length === 0) {
      ElMessage.warning('请选择可删除的扩展参数')
      return
    }

    ElMessageBox.confirm(`确定删除选中的 ${removableRows.length} 个系统参数吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await Promise.all(removableRows.map((item) => fetchDeleteConfig(item.id)))
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await loadConfigData()
    })
  }

  onMounted(() => {
    void refreshPage()
  })

  defineExpose({
    showGroupFormPanel,
    handleDeleteGroup
  })
</script>

<style scoped lang="scss">
  .config-page {
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
  }

  .config-page__stats,
  .config-page__search {
    margin-top: 16px;
  }

  .config-table-card {
    overflow: hidden;

    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 0;
    }
  }

  .config-table-wrap {
    flex: 1;
    min-height: 520px;
    padding: 16px;
  }

  :deep(.config-code-cell),
  :deep(.config-value-cell) {
    display: block;
    overflow: hidden;
    font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
    font-size: 12px;
    color: var(--art-gray-700);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.config-value-cell) {
    max-width: 360px;
  }

  :deep(.config-action-cell) {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  @media screen and (width <= 768px) {
    .config-table-wrap {
      padding: 12px;
    }
  }
</style>
