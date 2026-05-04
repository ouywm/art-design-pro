<template>
  <ElDialog
    v-model="dialogVisible"
    :title="`任务统计 · ${jobName || ''}`"
    :width="dialogWidth"
    align-center
    destroy-on-close
    @open="handleOpen"
  >
    <div v-loading="loading" class="job-stats">
      <div class="job-stats__head">
        <div class="job-stats__job">
          <span class="job-stats__job-id">#{{ jobId }}</span>
          <span class="job-stats__job-name">{{ jobName || '-' }}</span>
        </div>
        <ElSegmented
          v-model="statsPeriod"
          :options="PERIOD_OPTIONS"
          size="small"
          @change="reload"
        />
      </div>

      <ElRow :gutter="14" class="job-stats__row">
        <ElCol :sm="12" :md="6" v-for="m in summaryMetrics" :key="m.key">
          <div class="job-metric" :class="`job-metric--${m.tone}`">
            <div class="job-metric__label">{{ m.label }}</div>
            <div class="job-metric__value">{{ m.value }}</div>
            <div v-if="m.hint" class="job-metric__hint">{{ m.hint }}</div>
          </div>
        </ElCol>
      </ElRow>

      <ElRow :gutter="14" class="job-stats__row">
        <ElCol :sm="12" :md="8" v-for="m in latencyMetrics" :key="m.key">
          <div class="job-metric job-metric--neutral">
            <div class="job-metric__label">{{ m.label }}</div>
            <div class="job-metric__value">{{ m.value }}</div>
          </div>
        </ElCol>
      </ElRow>

      <div class="job-stats__chart">
        <div class="job-stats__chart-title">触发趋势</div>
        <div v-if="!hasPoints" class="job-stats__empty">
          {{ stats ? '本期没有触发记录' : '加载中...' }}
        </div>
        <ArtLineChart
          v-else
          :key="`${statsPeriod}-${jobId}`"
          :data="lineData"
          :xAxisData="xAxisData"
          :showLegend="true"
          :showAreaColor="true"
          height="320px"
          :colors="['#67C23A', '#F56C6C']"
        />
      </div>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">关闭</ElButton>
      <ElButton type="primary" @click="reload">刷新</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { fetchGetJobStats } from '@/api/scheduler-stats'
  import type { LineDataItem } from '@/types/component/chart'

  defineOptions({ name: 'JobStatsDialog' })

  interface Props {
    visible: boolean
    jobId?: number
    jobName?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const dialogWidth = computed(() =>
    width.value < 1024 ? '94vw' : 'min(960px, calc(100vw - 32px))'
  )

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const loading = ref(false)
  const stats = ref<Api.Scheduler.JobStatsVo>()
  const statsPeriod = ref<Api.Scheduler.StatsPeriod>('24h')

  const PERIOD_OPTIONS: Array<{ label: string; value: Api.Scheduler.StatsPeriod }> = [
    { label: '近 1 小时', value: '1h' },
    { label: '近 24 小时', value: '24h' },
    { label: '近 7 天', value: '7d' },
    { label: '近 30 天', value: '30d' }
  ]

  // ============ 派生:摘要 / 延迟 ============

  type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'

  interface MetricItem {
    key: string
    label: string
    value: string | number
    tone: Tone
    hint?: string
  }

  const formatRate = (rate: number | null | undefined): string => {
    if (rate === null || rate === undefined) return '—'
    return `${(rate * 100).toFixed(1)}%`
  }

  const formatMs = (v: number | null | undefined): string => {
    if (v === null || v === undefined) return '—'
    if (v < 1000) return `${v.toFixed(0)} ms`
    return `${(v / 1000).toFixed(2)} s`
  }

  const summaryMetrics = computed<MetricItem[]>(() => {
    const s = stats.value
    return [
      { key: 'triggered', label: '触发数', value: s?.triggeredCount ?? 0, tone: 'primary' },
      { key: 'succeeded', label: '成功数', value: s?.succeededCount ?? 0, tone: 'success' },
      { key: 'failed', label: '失败数', value: s?.failedCount ?? 0, tone: 'danger' },
      {
        key: 'rate',
        label: '成功率',
        value: formatRate(s?.successRate ?? null),
        tone: 'info'
      }
    ]
  })

  const latencyMetrics = computed<MetricItem[]>(() => {
    const s = stats.value
    return [
      { key: 'avg', label: '平均耗时', value: formatMs(s?.avgDurationMs), tone: 'neutral' },
      { key: 'p50', label: 'P50', value: formatMs(s?.p50), tone: 'neutral' },
      { key: 'p99', label: 'P99', value: formatMs(s?.p99), tone: 'neutral' }
    ]
  })

  // ============ 折线图 ============

  const formatTs = (ts: string): string => {
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return ts
    const pad = (n: number) => String(n).padStart(2, '0')
    if (statsPeriod.value === '1h' || statsPeriod.value === '24h') {
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const points = computed(() => stats.value?.points ?? [])
  const hasPoints = computed(() => points.value.length > 0)

  const xAxisData = computed(() => points.value.map((p) => formatTs(p.ts)))

  const lineData = computed<LineDataItem[]>(() => [
    {
      name: '成功',
      data: points.value.map((p) => p.succeeded),
      smooth: true,
      symbol: 'circle',
      symbolSize: 5
    },
    {
      name: '失败',
      data: points.value.map((p) => p.failed),
      smooth: true,
      symbol: 'circle',
      symbolSize: 5
    }
  ])

  // ============ 加载 ============

  const reload = async () => {
    if (!props.jobId) return
    loading.value = true
    try {
      stats.value = await fetchGetJobStats(props.jobId, { period: statsPeriod.value })
    } finally {
      loading.value = false
    }
  }

  const handleOpen = () => {
    stats.value = undefined
    statsPeriod.value = '24h'
    reload()
  }

  watch(
    () => props.jobId,
    () => {
      if (props.visible) reload()
    }
  )
</script>

<style scoped lang="scss">
  .job-stats {
    display: flex;
    flex-direction: column;
    gap: 14px;

    &__head {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    &__job {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    &__job-id {
      padding: 2px 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: var(--art-text-gray-500);
      background: var(--art-bg-page-color);
      border-radius: 4px;
    }

    &__job-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }

    &__row {
      margin: 0;
    }

    &__chart {
      padding: 14px 16px;
      background: var(--art-bg-page-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    &__chart-title {
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-text-gray-700);
    }

    &__empty {
      padding: 48px 0;
      color: var(--art-text-gray-500);
      text-align: center;
      background: var(--art-bg-page-color);
      border-radius: 6px;
    }
  }

  .job-metric {
    padding: 12px 14px;
    margin-bottom: 12px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &__label {
      font-size: 12.5px;
      color: var(--art-text-gray-500);
    }

    &__value {
      margin-top: 6px;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.1;
      color: var(--art-text-gray-900);
    }

    &__hint {
      margin-top: 4px;
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
