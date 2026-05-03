<template>
  <div class="scheduler-monitor-page art-full-height" v-loading="loading">
    <ElCard shadow="never" class="monitor-card">
      <template #header>
        <div class="monitor-card__head">
          <span class="monitor-card__title">运行状况</span>
          <ElCheckbox v-model="autoRefresh">每 30 秒自动刷新</ElCheckbox>
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
  import { fetchGetMetrics } from '@/api/scheduler-monitor'
  import type { MetricsData } from './types'

  defineOptions({ name: 'SchedulerMonitor' })

  const loading = ref(false)
  const metrics = ref<MetricsData>()
  const autoRefresh = ref(false)

  type MetricTone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral'

  interface MetricItem {
    key: string
    label: string
    value: number
    tone: MetricTone
  }

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

  const reload = async () => {
    loading.value = true
    try {
      metrics.value = await fetchGetMetrics()
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
      align-items: center;
      justify-content: space-between;
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
  }
</style>
