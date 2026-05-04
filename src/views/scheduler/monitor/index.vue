<template>
  <div class="scheduler-monitor-page art-full-height" v-loading="loading">
    <!-- ========= 调度统计(stats/overview) ========= -->
    <ElCard shadow="never" class="monitor-card">
      <template #header>
        <div class="monitor-card__head">
          <span class="monitor-card__title">调度统计</span>
          <div class="monitor-card__tools">
            <ElSegmented
              v-model="statsPeriod"
              :options="PERIOD_OPTIONS"
              size="small"
              @change="reloadStats"
            />
            <ElCheckbox v-model="autoRefresh">每 30 秒自动刷新</ElCheckbox>
          </div>
        </div>
      </template>

      <ElRow :gutter="16">
        <ElCol :sm="12" :md="6" v-for="item in overviewMetrics" :key="item.key">
          <div class="metric-card" :class="`metric-card--${item.tone}`">
            <div class="metric-card__label">{{ item.label }}</div>
            <div class="metric-card__value">{{ item.value }}</div>
            <div v-if="item.hint" class="metric-card__hint">{{ item.hint }}</div>
          </div>
        </ElCol>
      </ElRow>

      <h4 class="monitor-card__section">本期触发结果</h4>
      <ElRow :gutter="16">
        <ElCol :sm="12" :md="8" v-for="item in periodMetrics" :key="item.key">
          <div class="metric-card" :class="`metric-card--${item.tone}`">
            <div class="metric-card__label">{{ item.label }}</div>
            <div class="metric-card__value">{{ item.value }}</div>
          </div>
        </ElCol>
      </ElRow>

      <h4 class="monitor-card__section">失败任务 Top 5</h4>
      <div v-if="topFailedJobs.length === 0" class="empty-tip">本期无失败任务</div>
      <ElTable v-else :data="topFailedJobs" size="small" border stripe>
        <ElTableColumn prop="jobId" label="任务 ID" width="100" />
        <ElTableColumn prop="name" label="任务名称" min-width="220" />
        <ElTableColumn prop="failCount" label="失败次数" width="120" align="center">
          <template #default="{ row }">
            <ElTag type="danger" size="small">{{ row.failCount }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="goRunListByJob(row)">查看日志</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- ========= 实时指标(metrics 累计计数器) ========= -->
    <ElCard shadow="never" class="monitor-card">
      <template #header>
        <div class="monitor-card__head">
          <span class="monitor-card__title">运行状况</span>
        </div>
      </template>

      <ElRow :gutter="16">
        <ElCol :sm="12" :md="6" v-for="item in primaryMetrics" :key="item.key">
          <div class="metric-card" :class="`metric-card--${item.tone}`">
            <div class="metric-card__label">{{ item.label }}</div>
            <div class="metric-card__value">{{ item.value }}</div>
          </div>
        </ElCol>
      </ElRow>

      <h4 class="monitor-card__section">触发来源累计</h4>
      <ElRow :gutter="16">
        <ElCol :sm="12" :md="8" :lg="4" v-for="item in triggerMetrics" :key="item.key">
          <div class="metric-card metric-card--neutral">
            <div class="metric-card__label">{{ item.label }}</div>
            <div class="metric-card__value">{{ item.value }}</div>
          </div>
        </ElCol>
      </ElRow>

      <h4 class="monitor-card__section">其他执行计数</h4>
      <ElRow :gutter="16">
        <ElCol :sm="12" :md="6" v-for="item in extraMetrics" :key="item.key">
          <div class="metric-card metric-card--neutral">
            <div class="metric-card__label">{{ item.label }}</div>
            <div class="metric-card__value">{{ item.value }}</div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useIntervalFn } from '@vueuse/core'
  import { useRouter } from 'vue-router'
  import { fetchGetMetrics } from '@/api/scheduler-monitor'
  import { fetchGetStatsOverview } from '@/api/scheduler-stats'
  import type { MetricsData } from './types'

  defineOptions({ name: 'SchedulerMonitor' })

  const router = useRouter()

  const loading = ref(false)
  const metrics = ref<MetricsData>()
  const overview = ref<Api.Scheduler.StatsOverviewVo>()
  const autoRefresh = ref(false)

  const statsPeriod = ref<Api.Scheduler.StatsPeriod>('24h')
  const PERIOD_OPTIONS: Array<{ label: string; value: Api.Scheduler.StatsPeriod }> = [
    { label: '近 1 小时', value: '1h' },
    { label: '近 24 小时', value: '24h' },
    { label: '近 7 天', value: '7d' },
    { label: '近 30 天', value: '30d' }
  ]

  type MetricTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'

  interface MetricItem {
    key: string
    label: string
    value: string | number
    tone: MetricTone
    hint?: string
  }

  // ============ stats/overview 派生 ============

  const formatRate = (rate: number | null): string => {
    if (rate === null || rate === undefined) return '—'
    return `${(rate * 100).toFixed(1)}%`
  }

  const overviewMetrics = computed<MetricItem[]>(() => {
    const o = overview.value
    return [
      {
        key: 'totalJobs',
        label: '任务总数',
        value: o?.totalJobs ?? 0,
        tone: 'primary',
        hint: o ? `已启用 ${o.enabledJobs} 个` : undefined
      },
      {
        key: 'inFlight',
        label: '当前在跑',
        value: o?.inFlightCount ?? 0,
        tone: 'warning'
      },
      {
        key: 'successRate',
        label: '成功率',
        value: formatRate(o?.successRate ?? null),
        tone: 'success',
        hint: o ? `成功 ${o.succeededCount} / 失败 ${o.failedCount}` : undefined
      },
      {
        key: 'triggered',
        label: '触发总次数',
        value: o?.triggeredCount ?? 0,
        tone: 'info'
      }
    ]
  })

  const periodMetrics = computed<MetricItem[]>(() => {
    const o = overview.value
    return [
      { key: 'pTriggered', label: '触发数', value: o?.triggeredCount ?? 0, tone: 'info' },
      { key: 'pSucceeded', label: '成功数', value: o?.succeededCount ?? 0, tone: 'success' },
      { key: 'pFailed', label: '失败数', value: o?.failedCount ?? 0, tone: 'danger' }
    ]
  })

  const topFailedJobs = computed<Api.Scheduler.TopFailedJob[]>(
    () => overview.value?.topFailedJobs ?? []
  )

  const goRunListByJob = (row: Api.Scheduler.TopFailedJob) => {
    router.push({ path: '/scheduler/run', query: { jobId: String(row.jobId), state: 'Failed' } })
  }

  // ============ metrics 累计计数器 ============

  const primaryMetrics = computed<MetricItem[]>(() => {
    const m = metrics.value
    return [
      { key: 'inFlight', label: '当前在跑', value: m?.runsInFlight ?? 0, tone: 'primary' },
      { key: 'succeeded', label: '累计成功', value: m?.runsSucceeded ?? 0, tone: 'success' },
      { key: 'failed', label: '累计失败', value: m?.runsFailed ?? 0, tone: 'danger' },
      { key: 'timeout', label: '累计超时', value: m?.runsTimeout ?? 0, tone: 'warning' }
    ]
  })

  const triggerMetrics = computed<MetricItem[]>(() => {
    const m = metrics.value
    return [
      { key: 'cron', label: 'Cron', value: m?.triggersCron ?? 0, tone: 'neutral' },
      { key: 'manual', label: '手动', value: m?.triggersManual ?? 0, tone: 'neutral' },
      { key: 'retry', label: '重试', value: m?.triggersRetry ?? 0, tone: 'neutral' },
      { key: 'workflow', label: '依赖', value: m?.triggersWorkflow ?? 0, tone: 'neutral' },
      { key: 'misfire', label: 'Misfire', value: m?.triggersMisfire ?? 0, tone: 'neutral' },
      { key: 'api', label: 'API', value: m?.triggersApi ?? 0, tone: 'neutral' }
    ]
  })

  const extraMetrics = computed<MetricItem[]>(() => {
    const m = metrics.value
    return [
      {
        key: 'enqueuedOrRunning',
        label: '已入队 + 执行中',
        value: m?.runsEnqueuedOrRunning ?? 0,
        tone: 'neutral'
      },
      { key: 'canceled', label: '累计取消', value: m?.runsCanceled ?? 0, tone: 'neutral' },
      { key: 'discarded', label: '累计丢弃', value: m?.runsDiscarded ?? 0, tone: 'neutral' }
    ]
  })

  // ============ 加载 ============

  const reloadStats = async () => {
    overview.value = await fetchGetStatsOverview({ period: statsPeriod.value })
  }

  const reload = async () => {
    loading.value = true
    try {
      const [m] = await Promise.all([fetchGetMetrics(), reloadStats()])
      metrics.value = m
    } finally {
      loading.value = false
    }
  }

  const { pause, resume } = useIntervalFn(reload, 30_000, {
    immediate: false,
    immediateCallback: false
  })

  watch(autoRefresh, (v) => {
    if (v) resume()
    else pause()
  })

  onMounted(() => {
    reload()
  })

  onUnmounted(() => {
    pause()
  })
</script>

<style scoped lang="scss">
  .scheduler-monitor-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .monitor-card {
    &__head {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    &__tools {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }

    &__section {
      margin: 24px 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--art-text-gray-700);
    }
  }

  .empty-tip {
    padding: 24px;
    color: var(--art-text-gray-500);
    text-align: center;
    background: var(--art-bg-page-color);
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .metric-card {
    padding: 16px;
    margin-bottom: 16px;
    background: var(--art-bg-page-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    &__label {
      font-size: 13px;
      color: var(--art-text-gray-500);
    }

    &__value {
      margin-top: 8px;
      font-size: 26px;
      font-weight: 600;
      line-height: 1.1;
      color: var(--art-text-gray-900);
    }

    &__hint {
      margin-top: 6px;
      font-size: 12px;
      color: var(--art-text-gray-500);
    }

    &--primary &__value {
      color: var(--el-color-primary);
    }

    &--success &__value {
      color: var(--el-color-success);
    }

    &--danger &__value {
      color: var(--el-color-danger);
    }

    &--warning &__value {
      color: var(--el-color-warning);
    }

    &--info &__value {
      color: var(--el-color-info);
    }
  }
</style>
