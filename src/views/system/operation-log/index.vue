<!-- 操作日志页面 -->
<template>
  <div class="operation-log-page art-full-height">
    <!-- 搜索栏 -->
    <OperationLogSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></OperationLogSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 详情弹窗 -->
    <OperationLogDetailDialog v-model="detailVisible" :log-id="currentLogId" />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetOperationLogList } from '@/api/operation-log'
  import OperationLogSearch from './modules/operation-log-search.vue'
  import OperationLogDetailDialog from './modules/operation-log-detail-dialog.vue'
  import { ElTag } from 'element-plus'

  defineOptions({ name: 'OperationLog' })

  type OperationLogListItem = Api.OperationLog.OperationLogListItem
  type OperationLogSearchFormParams = Omit<
    Api.OperationLog.OperationLogSearchFilters,
    'startTime' | 'endTime'
  > & {
    operationTimeRange?: [string, string]
  }

  // 业务类型标签样式
  const BUSINESS_TYPE_TAG: Record<number, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'primary',
    5: 'info',
    6: 'info',
    7: 'warning'
  }

  // 操作状态标签样式
  const STATUS_TAG_TYPE: Record<number, 'success' | 'danger' | 'warning' | 'info'> = {
    1: 'success',
    2: 'danger',
    3: 'warning'
  }

  // 详情弹窗
  const detailVisible = ref(false)
  const currentLogId = ref<number>()

  // 搜索表单
  const searchForm = ref<OperationLogSearchFormParams>({
    userName: undefined,
    module: undefined,
    businessType: undefined as Api.OperationLog.BusinessType | undefined,
    status: undefined as Api.OperationLog.OperationStatus | undefined,
    requestMethod: undefined,
    requestUrl: undefined,
    clientIp: undefined,
    responseCode: undefined as number | undefined,
    operationTimeRange: undefined as [string, string] | undefined
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
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetOperationLogList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userName',
          label: '操作用户',
          width: 120
        },
        {
          prop: 'module',
          label: '操作模块',
          minWidth: 120
        },
        {
          prop: 'action',
          label: '操作动作',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'businessType',
          label: '业务类型',
          width: 100,
          formatter: (row: OperationLogListItem) => {
            return h(
              ElTag,
              { type: BUSINESS_TYPE_TAG[row.businessType] || 'info', size: 'small' },
              () => row.businessTypeText
            )
          }
        },
        {
          prop: 'requestMethod',
          label: '请求方式',
          width: 100
        },
        {
          prop: 'clientIp',
          label: '客户端IP',
          width: 140
        },
        {
          prop: 'ipLocation',
          label: 'IP归属地',
          minWidth: 120
        },
        {
          prop: 'status',
          label: '操作状态',
          width: 100,
          formatter: (row: OperationLogListItem) => {
            return h(
              ElTag,
              { type: STATUS_TAG_TYPE[row.status] || 'info', size: 'small' },
              () => row.statusText
            )
          }
        },
        {
          prop: 'duration',
          label: '耗时',
          width: 100,
          sortable: true,
          formatter: (row: OperationLogListItem) => `${row.duration}ms`
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: OperationLogListItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'view',
                onClick: () => showDetail(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: OperationLogSearchFormParams) => {
    const { operationTimeRange, ...filters } = params

    // 处理时间范围
    const [startTime, endTime] = Array.isArray(operationTimeRange)
      ? operationTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      startTime,
      endTime
    })
    getData()
  }

  /**
   * 查看详情
   */
  const showDetail = (row: OperationLogListItem) => {
    currentLogId.value = row.id
    detailVisible.value = true
  }
</script>
