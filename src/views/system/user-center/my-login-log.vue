<!-- 我的登录日志页面 -->
<template>
  <div class="my-login-log-page art-full-height">
    <!-- 搜索栏 -->
    <MyLoginLogSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></MyLoginLogSearch>

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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetMyLoginLogList } from '@/api/login-log'
  import MyLoginLogSearch from './modules/my-login-log-search.vue'
  import { ElTag } from 'element-plus'

  defineOptions({ name: 'MyLoginLog' })

  type LoginLogListItem = Api.LoginLog.LoginLogListItem
  type MyLoginLogSearchFormParams = Omit<
    Api.LoginLog.LoginLogSearchFilters,
    'userName' | 'loginIp' | 'startTime' | 'endTime'
  > & {
    loginTimeRange?: [string, string]
  }

  // 登录状态标签样式
  const STATUS_TAG_TYPE: Record<number, 'success' | 'danger' | 'info'> = {
    1: 'success',
    2: 'danger'
  }

  // 搜索表单（无用户名）
  const searchForm = ref<MyLoginLogSearchFormParams>({
    status: undefined as Api.LoginLog.LoginStatus | undefined,
    loginTimeRange: undefined as [string, string] | undefined
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
      apiFn: fetchGetMyLoginLogList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'loginIp',
          label: '登录IP',
          width: 150
        },
        {
          prop: 'loginLocation',
          label: '登录地点',
          minWidth: 140
        },
        {
          prop: 'browser',
          label: '浏览器',
          minWidth: 140,
          formatter: (row: LoginLogListItem) => `${row.browser} ${row.browserVersion}`
        },
        {
          prop: 'os',
          label: '操作系统',
          minWidth: 140,
          formatter: (row: LoginLogListItem) => `${row.os} ${row.osVersion}`
        },
        {
          prop: 'device',
          label: '设备类型'
        },
        {
          prop: 'status',
          label: '登录状态',
          width: 100,
          formatter: (row: LoginLogListItem) => {
            return h(ElTag, { type: STATUS_TAG_TYPE[row.status] || 'info' }, () => row.statusText)
          }
        },
        {
          prop: 'failReason',
          label: '失败原因',
          minWidth: 140,
          formatter: (row: LoginLogListItem) => row.failReason || '-'
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 180,
          sortable: true
        }
      ]
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: MyLoginLogSearchFormParams) => {
    const { loginTimeRange, ...filters } = params

    // 处理时间范围
    const [startTime, endTime] = Array.isArray(loginTimeRange)
      ? loginTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, { startTime, endTime })
    getData()
  }
</script>
