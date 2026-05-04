<template>
  <ElDrawer v-model="drawerVisible" :size="drawerSize" title="执行记录详情" destroy-on-close>
    <div v-loading="loading" class="run-detail">
      <template v-if="detail">
        <div class="run-detail__header">
          <ElTag size="large" :type="getRunStateTagType(detail.state)">
            {{ getRunStateLabel(detail.state) }}
          </ElTag>
          <ElTag size="large" type="info">
            {{ getTriggerTypeLabel(detail.triggerType) }}
          </ElTag>
          <span v-if="detail.retryCount > 0" class="run-detail__retry">
            重试 #{{ detail.retryCount }}
          </span>
        </div>

        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="Run ID">{{ detail.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="任务 ID">{{ detail.jobId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="Trace ID" :span="2">
            <span class="trace-id">{{ detail.traceId }}</span>
            <ElButton link type="primary" @click="copyTraceId">复制</ElButton>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="执行实例">{{ detail.instance || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="触发来源">
            {{ formatTriggerBy(detail) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem v-if="detail.uniqueKey" label="去重 Key" :span="2">
            <span class="trace-id">{{ detail.uniqueKey }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <h4 class="run-detail__title">执行时间线</h4>
        <ElTimeline>
          <ElTimelineItem :timestamp="detail.scheduledAt" placement="top" type="primary">
            计划触发
          </ElTimelineItem>
          <ElTimelineItem
            v-if="detail.startedAt"
            :timestamp="detail.startedAt"
            placement="top"
            type="warning"
          >
            开始执行
            <span class="elapsed">
              (等待 {{ elapsed(detail.scheduledAt, detail.startedAt) }})
            </span>
          </ElTimelineItem>
          <ElTimelineItem
            v-if="detail.finishedAt"
            :timestamp="detail.finishedAt"
            placement="top"
            :type="finishTimelineType"
          >
            执行结束
            <span class="elapsed"> (耗时 {{ elapsed(detail.startedAt, detail.finishedAt) }}) </span>
          </ElTimelineItem>
        </ElTimeline>

        <template v-if="detail.errorMessage">
          <h4 class="run-detail__title">错误信息</h4>
          <ElAlert type="error" :closable="false" :title="detail.errorMessage" show-icon />
        </template>

        <h4 class="run-detail__title">结果 JSON</h4>
        <pre class="run-detail__code">{{ formatJson(detail.resultJson) }}</pre>

        <template v-if="detail.logExcerpt">
          <h4 class="run-detail__title">日志摘录</h4>
          <pre class="run-detail__code">{{ detail.logExcerpt }}</pre>
        </template>
      </template>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { useClipboard, useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import { fetchGetRunDetail } from '@/api/scheduler-run'
  import { getRunStateLabel, getRunStateTagType, getTriggerTypeLabel } from '../../constants'
  import type { RunDetailData } from '../types'

  interface Props {
    visible: boolean
    runId?: number
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const drawerSize = computed(() => (width.value < 1024 ? '100%' : '720px'))

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const loading = ref(false)
  const detail = ref<RunDetailData>()
  const { copy } = useClipboard()

  const finishTimelineType = computed(() => {
    if (!detail.value) return 'info'
    const tag = getRunStateTagType(detail.value.state)
    return (tag === 'success' || tag === 'danger' || tag === 'warning' ? tag : 'info') as
      | 'success'
      | 'danger'
      | 'warning'
      | 'info'
  })

  const loadDetail = async (id: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetRunDetail(id)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [props.visible, props.runId],
    async ([visible, runId]) => {
      if (!visible || typeof runId !== 'number') return
      await loadDetail(runId)
    }
  )

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) detail.value = undefined
    }
  )

  const copyTraceId = async () => {
    if (!detail.value?.traceId) return
    await copy(detail.value.traceId)
    ElMessage.success('Trace ID 已复制')
  }

  const formatTriggerBy = (run: RunDetailData) => {
    if (run.triggerBy == null) return getTriggerTypeLabel(run.triggerType)
    if (run.triggerType === 'Manual')
      return `${getTriggerTypeLabel(run.triggerType)} · 用户 #${run.triggerBy}`
    if (run.triggerType === 'Workflow')
      return `${getTriggerTypeLabel(run.triggerType)} · 上游 Run #${run.triggerBy}`
    if (run.triggerType === 'Retry')
      return `${getTriggerTypeLabel(run.triggerType)} · 源 Run #${run.triggerBy}`
    return `${getTriggerTypeLabel(run.triggerType)} · ${run.triggerBy}`
  }

  const formatJson = (value: unknown) => {
    if (value === undefined || value === null) return '-'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  // 后端时间是本地时间无时区(YYYY-MM-DDTHH:mm:ss[.fff]),拆字段构造 Date 避免被当成 UTC
  const parseLocalTime = (value: string): Date | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(value)
    if (!m) return null
    const [, y, mo, d, h, mi, s, ms] = m
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s),
      ms ? Number(ms.padEnd(3, '0').slice(0, 3)) : 0
    )
  }

  const elapsed = (start: string | null, end: string | null) => {
    if (!start || !end) return '-'
    const startDate = parseLocalTime(start)
    const endDate = parseLocalTime(end)
    if (!startDate || !endDate) return '-'
    const diff = endDate.getTime() - startDate.getTime()
    if (diff < 0) return '-'
    if (diff < 1000) return `${diff} ms`
    if (diff < 60_000) return `${(diff / 1000).toFixed(2)} s`
    if (diff < 3_600_000) return `${(diff / 60_000).toFixed(1)} min`
    return `${(diff / 3_600_000).toFixed(2)} h`
  }
</script>

<style scoped lang="scss">
  .run-detail {
    min-height: 240px;

    &__header {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }

    &__retry {
      font-size: 13px;
      color: var(--art-text-gray-500);
    }

    &__title {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }

    &__code {
      padding: 12px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 12.5px;
      line-height: 1.55;
      color: var(--art-text-gray-900);
      word-break: break-word;
      white-space: pre-wrap;
      background: var(--art-gray-100);
      border-radius: 6px;
    }

    .trace-id {
      margin-right: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 12.5px;
    }

    .elapsed {
      font-size: 12.5px;
      color: var(--art-text-gray-500);
    }
  }
</style>
