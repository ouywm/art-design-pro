<!-- 字典管理页面 - 左侧字典类型，右侧字典数据 -->
<template>
  <div class="art-full-height dict-page">
    <ElCard class="art-table-card dict-page-card" shadow="never" style="margin-top: 0">
      <div class="dict-page-body">
        <aside class="dict-type-panel">
          <section class="dict-section dict-type-section">
            <div class="section-header">
              <div class="section-heading">
                <h3 class="section-title">字典类型</h3>
                <p class="section-subtitle">管理字典分类与类型编码</p>
              </div>
              <ElSpace wrap>
                <ElTag effect="plain" round type="info">{{ dictTypes.length }} 项</ElTag>
                <ElButton circle :loading="typeLoading" size="small" @click="loadDictTypes">
                  <template #icon>
                    <ArtSvgIcon icon="ri:refresh-line" />
                  </template>
                </ElButton>
                <ElButton type="primary" size="small" @click="showDictTypeDialog('add')">
                  新增
                </ElButton>
              </ElSpace>
            </div>

            <div class="search-box">
              <ElInput
                v-model="typeSearchKeyword"
                placeholder="搜索字典类型"
                clearable
                @input="handleTypeSearch"
              >
                <template #prefix>
                  <ArtSvgIcon icon="ri:search-line" />
                </template>
              </ElInput>
            </div>

            <div v-loading="typeLoading" class="type-list">
              <div
                v-for="item in filteredDictTypes"
                :key="item.id"
                class="type-item"
                :class="{ active: selectedDictType?.id === item.id }"
                @click="handleSelectType(item)"
              >
                <div class="type-info">
                  <div class="type-name">{{ item.dictName }}</div>
                  <div class="type-code">{{ item.dictType }}</div>
                </div>
                <div class="type-actions">
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    @click.stop="showDictTypeDialog('edit', item)"
                  >
                    <ArtSvgIcon icon="ri:edit-2-line" />
                  </ElButton>
                  <ElButton
                    link
                    type="danger"
                    size="small"
                    :disabled="item.isSystem"
                    @click.stop="handleDeleteDictType(item)"
                  >
                    <ArtSvgIcon icon="ri:delete-bin-4-line" />
                  </ElButton>
                </div>
              </div>
              <ElEmpty v-if="filteredDictTypes.length === 0" description="暂无数据" />
            </div>
          </section>
        </aside>

        <section class="dict-data-panel">
          <div class="dict-section dict-data-section">
            <div class="section-header">
              <div class="section-heading">
                <h3 class="section-title">
                  {{ selectedDictType ? selectedDictType.dictName : '字典数据' }}
                </h3>
                <p class="section-subtitle">
                  {{ selectedDictType ? selectedDictType.dictType : '请先从左侧选择一个字典类型' }}
                </p>
              </div>
              <ElTag v-if="selectedDictType" effect="plain" round type="info">
                {{ dataPagination.total || 0 }} 项
              </ElTag>
            </div>

            <div v-if="!selectedDictType" class="empty-state">
              <ElEmpty description="请先选择左侧的字典类型" />
            </div>

            <div v-else class="table-container">
              <DictDataSearch
                v-show="showSearchBar"
                v-model="dataSearchForm"
                @search="handleDataSearch"
                @reset="handleDataReset"
              />

              <ArtTableHeader
                v-model:columns="dataColumnChecks"
                v-model:showSearchBar="showSearchBar"
                :loading="dataLoading"
                :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
                @refresh="refreshDataTable"
              >
                <template #left>
                  <ElButton type="primary" @click="showDictDataDialog('add')" v-ripple>
                    新增字典数据
                  </ElButton>
                </template>
              </ArtTableHeader>

              <ArtTable
                :loading="dataLoading"
                :data="dataTableData"
                :columns="dataColumns"
                :pagination="dataPagination"
                @pagination:size-change="handleDataSizeChange"
                @pagination:current-change="handleDataCurrentChange"
              />
            </div>
          </div>
        </section>
      </div>
    </ElCard>

    <!-- 字典类型编辑弹窗 -->
    <DictTypeDialog
      v-model="dictTypeDialogVisible"
      :dialog-type="dictTypeDialogType"
      :dict-type-data="currentDictType"
      @success="handleDictTypeSuccess"
    />

    <!-- 字典数据编辑弹窗 -->
    <DictDataDialog
      v-model="dictDataDialogVisible"
      :dialog-type="dictDataDialogType"
      :dict-data="currentDictData"
      :default-dict-type="selectedDictType?.dictType"
      @success="refreshDataTable"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetDictTypeList,
    fetchDeleteDictType,
    fetchGetDictDataList,
    fetchDeleteDictData
  } from '@/api/dict-manage'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import DictTypeDialog from './modules/dict-type-dialog.vue'
  import DictDataDialog from './modules/dict-data-dialog.vue'
  import DictDataSearch from './modules/dict-data-search.vue'
  import { ElTag, ElMessage, ElMessageBox } from 'element-plus'
  import { useDict, dictClassToTagType } from '@/utils/dict'

  defineOptions({ name: 'DictManage' })

  type DictTypeVo = Api.SystemManage.DictTypeVo
  type DictDataVo = Api.SystemManage.DictDataVo
  type DictDataSearchFormParams = Api.SystemManage.DictDataSearchFilters

  const { getDictLabel, getDictClass } = useDict()

  const createDataSearchForm = (dictType = ''): DictDataSearchFormParams => ({
    dictType,
    dictLabel: undefined,
    status: undefined
  })

  // ========== 左侧：字典类型 ==========
  const typeLoading = ref(false)
  const dictTypes = ref<DictTypeVo[]>([])
  const typeSearchKeyword = ref('')
  const selectedDictType = ref<DictTypeVo | null>(null)
  const dictTypeDialogVisible = ref(false)
  const dictTypeDialogType = ref<'add' | 'edit'>('add')
  const currentDictType = ref<DictTypeVo | undefined>(undefined)

  // 过滤后的字典类型列表
  const filteredDictTypes = computed(() => {
    if (!typeSearchKeyword.value) return dictTypes.value
    const keyword = typeSearchKeyword.value.toLowerCase()
    return dictTypes.value.filter(
      (item) =>
        item.dictName.toLowerCase().includes(keyword) ||
        item.dictType.toLowerCase().includes(keyword)
    )
  })

  // 加载字典类型列表
  const loadDictTypes = async () => {
    typeLoading.value = true
    try {
      const res = await fetchGetDictTypeList({ page: 1, size: 1000 })
      dictTypes.value = res.content || []
      if (dictTypes.value.length === 0) {
        selectedDictType.value = null
        return
      }

      if (!selectedDictType.value) {
        handleSelectType(dictTypes.value[0])
        return
      }

      const matchedDictType = dictTypes.value.find((item) => item.id === selectedDictType.value?.id)
      if (matchedDictType) {
        selectedDictType.value = matchedDictType
      } else {
        handleSelectType(dictTypes.value[0])
      }
    } finally {
      typeLoading.value = false
    }
  }

  // 搜索字典类型
  const handleTypeSearch = () => {
    // 搜索逻辑已在 computed 中处理
  }

  // 选择字典类型
  const handleSelectType = (item: DictTypeVo) => {
    selectedDictType.value = item
    dataSearchForm.value = createDataSearchForm(item.dictType)
    Object.assign(dataSearchParams, createDataSearchForm(item.dictType))
    getDataTableData()
  }

  // 显示字典类型弹窗
  const showDictTypeDialog = (type: 'add' | 'edit', row?: DictTypeVo) => {
    dictTypeDialogVisible.value = true
    dictTypeDialogType.value = type
    currentDictType.value = row
  }

  // 字典类型操作成功
  const handleDictTypeSuccess = () => {
    loadDictTypes()
  }

  // 删除字典类型
  const handleDeleteDictType = (row: DictTypeVo) => {
    ElMessageBox.confirm(`确定要删除字典类型"${row.dictName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteDictType(row.id)
      ElMessage.success('删除成功')
      // 如果删除的是当前选中项，清空选中
      if (selectedDictType.value?.id === row.id) {
        selectedDictType.value = null
      }
      loadDictTypes()
    })
  }

  // ========== 右侧：字典数据 ==========
  const showSearchBar = ref(false)
  const dictDataDialogVisible = ref(false)
  const dictDataDialogType = ref<'add' | 'edit'>('add')
  const currentDictData = ref<DictDataVo | undefined>(undefined)

  const dataSearchForm = ref<DictDataSearchFormParams>({
    ...createDataSearchForm()
  })

  const {
    columns: dataColumns,
    columnChecks: dataColumnChecks,
    data: dataTableData,
    loading: dataLoading,
    pagination: dataPagination,
    getData: getDataTableData,
    searchParams: dataSearchParams,
    handleSizeChange: handleDataSizeChange,
    handleCurrentChange: handleDataCurrentChange,
    refreshData: refreshDataTable
  } = useTable({
    core: {
      apiFn: fetchGetDictDataList,
      apiParams: {
        page: 1,
        size: 20,
        dictType: ''
      },
      immediate: false,
      columnsFactory: () => [
        {
          prop: 'dictLabel',
          label: '字典标签',
          minWidth: 120
        },
        {
          prop: 'dictValue',
          label: '字典值',
          width: 100
        },
        {
          prop: 'dictSort',
          label: '排序',
          width: 80
        },
        {
          prop: 'listClass',
          label: '样式类',
          width: 100,
          formatter: (row) => {
            if (!row.listClass) return '-'
            const type = dictClassToTagType(row.listClass)
            return h(ElTag, { type, size: 'small' }, () => row.listClass)
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row) => {
            const label = getDictLabel('sys_status', row.status)
            const listClass = getDictClass('sys_status', row.status)
            const type = dictClassToTagType(listClass)
            return h(ElTag, { type }, () => label)
          }
        },
        {
          prop: 'isDefault',
          label: '默认',
          width: 80,
          formatter: (row) => {
            return h(ElTag, { type: row.isDefault ? 'success' : 'info', size: 'small' }, () =>
              row.isDefault ? '是' : '否'
            )
          }
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 150,
          showOverflowTooltip: true
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
                    label: '编辑',
                    icon: 'ri:edit-2-line',
                    disabled: row.isSystem
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c',
                    disabled: row.isSystem
                  }
                ],
                onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
              })
            ])
        }
      ]
    }
  })

  // 显示字典数据弹窗
  const showDictDataDialog = (type: 'add' | 'edit', row?: DictDataVo) => {
    dictDataDialogVisible.value = true
    dictDataDialogType.value = type
    currentDictData.value = row
  }

  // 更多操作按钮点击
  const buttonMoreClick = (item: ButtonMoreItem, row: DictDataVo) => {
    switch (item.key) {
      case 'edit':
        showDictDataDialog('edit', row)
        break
      case 'delete':
        handleDeleteDictData(row)
        break
    }
  }

  // 删除字典数据
  const handleDeleteDictData = (row: DictDataVo) => {
    ElMessageBox.confirm(`确定要删除字典数据"${row.dictLabel}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteDictData(row.id)
      ElMessage.success('删除成功')
      refreshDataTable()
    })
  }

  // 搜索字典数据
  const handleDataSearch = (params: DictDataSearchFormParams) => {
    Object.assign(dataSearchParams, params)
    getDataTableData()
  }

  const handleDataReset = () => {
    const dictType = selectedDictType.value?.dictType || ''
    const nextSearchForm = createDataSearchForm(dictType)
    dataSearchForm.value = nextSearchForm
    Object.assign(dataSearchParams, nextSearchForm)
    getDataTableData()
  }

  // 初始化
  onMounted(() => {
    loadDictTypes()
  })
</script>

<style scoped lang="scss">
  .dict-page {
    min-height: 0;

    .dict-page-card {
      min-height: 0;

      :deep(.el-card__body) {
        display: flex;
        min-height: 0;
        padding: 0;
      }
    }

    .dict-page-body {
      display: flex;
      flex: 1;
      width: 100%;
      min-height: 0;
    }

    .dict-type-panel {
      flex-shrink: 0;
      width: 320px;
      min-height: 0;
      padding: 18px 16px 18px 18px;
      border-right: 1px solid var(--default-border);
    }

    .dict-data-panel {
      flex: 1;
      min-width: 0;
      min-height: 0;
      padding: 18px;
    }

    .dict-section {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .section-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--default-border);
    }

    .section-heading {
      min-width: 0;
    }

    .section-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--el-text-color-primary);
    }

    .section-subtitle {
      margin: 6px 0 0;
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
      word-break: break-word;
    }

    .search-box {
      margin-bottom: 14px;
    }

    .type-list {
      flex: 1;
      min-height: 0;
      padding-right: 4px;
      overflow-y: auto;
    }

    .type-item {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      margin-bottom: 8px;
      cursor: pointer;
      background-color: var(--default-box-color);
      border: 1px solid var(--default-border);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        box-shadow 0.2s ease;

      &:hover {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-color-primary-light-5);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
      }
    }

    .type-info {
      flex: 1;
      min-width: 0;
    }

    .type-name {
      margin-bottom: 4px;
      overflow: hidden;
      font-weight: 600;
      line-height: 1.5;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .type-code {
      overflow: hidden;
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .type-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .empty-state {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      min-height: 0;
    }

    .table-container {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;

      :deep(.art-table) {
        flex: 1;
        min-height: 0;
      }
    }
  }

  @media (width <= 992px) {
    .dict-page {
      .dict-page-card {
        :deep(.el-card__body) {
          padding: 0;
        }
      }

      .dict-page-body,
      .section-header {
        flex-direction: column;
      }

      .dict-type-panel {
        width: 100%;
        padding: 16px;
        border-right: 0;
        border-bottom: 1px solid var(--default-border);
      }

      .dict-data-panel {
        padding: 16px;
      }

      .dict-type-section {
        max-height: 360px;
      }
    }
  }
</style>
