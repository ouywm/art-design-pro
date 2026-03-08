<!-- 字典管理页面 - 左侧字典类型，右侧字典数据 -->
<template>
  <div class="dict-manage-container">
    <!-- 左侧：字典类型列表 -->
    <div class="dict-type-panel">
      <ElCard shadow="never" class="dict-type-card">
        <template #header>
          <div class="card-header">
            <span class="title">字典类型</span>
            <ElButton type="primary" size="small" @click="showDictTypeDialog('add')">
              新增
            </ElButton>
          </div>
        </template>

        <!-- 搜索框 -->
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

        <!-- 字典类型列表 -->
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
      </ElCard>
    </div>

    <!-- 右侧：字典数据表格 -->
    <div class="dict-data-panel">
      <ElCard shadow="never" class="dict-data-card">
        <template #header>
          <div class="card-header">
            <span class="title">
              {{ selectedDictType ? `${selectedDictType.dictName} - 字典数据` : '字典数据' }}
            </span>
          </div>
        </template>

        <div v-if="!selectedDictType" class="empty-state">
          <ElEmpty description="请先选择左侧的字典类型" />
        </div>

        <div v-else class="table-container">
          <!-- 搜索栏 -->
          <DictDataSearch
            v-show="showSearchBar"
            v-model="dataSearchForm"
            @search="handleDataSearch"
            @reset="resetDataSearchParams"
          />

          <!-- 表格工具栏 -->
          <ArtTableHeader
            v-model:columns="dataColumnChecks"
            v-model:showSearchBar="showSearchBar"
            :loading="dataLoading"
            :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
            @refresh="refreshDataTable"
          >
            <template #left>
              <ElButton @click="showDictDataDialog('add')" v-ripple>新增字典数据</ElButton>
            </template>
          </ArtTableHeader>

          <!-- 数据表格 -->
          <ArtTable
            :loading="dataLoading"
            :data="dataTableData"
            :columns="dataColumns"
            :pagination="dataPagination"
            @pagination:size-change="handleDataSizeChange"
            @pagination:current-change="handleDataCurrentChange"
          />
        </div>
      </ElCard>
    </div>

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
  import { ElTag, ElMessageBox } from 'element-plus'
  import { useDict, dictClassToTagType } from '@/utils/dict'

  defineOptions({ name: 'DictManage' })

  type DictTypeVo = Api.SystemManage.DictTypeVo
  type DictDataVo = Api.SystemManage.DictDataVo

  const { getDictLabel, getDictClass } = useDict()

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
      // 如果有数据且没有选中项，默认选中第一个并加载数据
      if (dictTypes.value.length > 0 && !selectedDictType.value) {
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
    // 重置搜索条件并加载数据
    dataSearchForm.value = {
      dictType: item.dictType,
      dictLabel: undefined,
      status: undefined
    }
    Object.assign(dataSearchParams, { dictType: item.dictType })
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

  const dataSearchForm = ref({
    dictType: '',
    dictLabel: undefined,
    status: undefined
  })

  const {
    columns: dataColumns,
    columnChecks: dataColumnChecks,
    data: dataTableData,
    loading: dataLoading,
    pagination: dataPagination,
    getData: getDataTableData,
    searchParams: dataSearchParams,
    resetSearchParams: resetDataSearchParams,
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
  const handleDataSearch = (params: Record<string, any>) => {
    Object.assign(dataSearchParams, params)
    getDataTableData()
  }

  // 初始化
  onMounted(() => {
    loadDictTypes()
  })
</script>

<style scoped lang="scss">
  .dict-manage-container {
    display: flex;
    gap: 12px;
    height: 100%;

    .dict-type-panel {
      flex-shrink: 0;
      width: 320px;

      .dict-type-card {
        display: flex;
        flex-direction: column;
        height: 100%;

        :deep(.el-card__body) {
          display: flex;
          flex: 1;
          flex-direction: column;
          overflow: hidden;
        }
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .search-box {
        margin-bottom: 12px;
      }

      .type-list {
        flex: 1;
        overflow-y: auto;

        .type-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          border: 1px solid var(--el-border-color-light);
          border-radius: 4px;
          transition: all 0.3s;

          &:hover {
            background-color: var(--el-color-primary-light-9);
            border-color: var(--el-color-primary);
          }

          &.active {
            background-color: var(--el-color-primary-light-9);
            border-color: var(--el-color-primary);
          }

          .type-info {
            flex: 1;
            min-width: 0;

            .type-name {
              margin-bottom: 4px;
              overflow: hidden;
              font-weight: 500;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .type-code {
              overflow: hidden;
              font-size: 12px;
              color: var(--el-text-color-secondary);
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .type-actions {
            display: flex;
            gap: 4px;
          }
        }
      }
    }

    .dict-data-panel {
      flex: 1;
      min-width: 0;

      .dict-data-card {
        display: flex;
        flex-direction: column;
        height: 100%;

        :deep(.el-card__body) {
          display: flex;
          flex: 1;
          flex-direction: column;
          overflow: hidden;
        }
      }

      .card-header {
        .title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .empty-state {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
      }

      .table-container {
        display: flex;
        flex: 1;
        flex-direction: column;
        overflow: hidden;
      }
    }
  }
</style>
