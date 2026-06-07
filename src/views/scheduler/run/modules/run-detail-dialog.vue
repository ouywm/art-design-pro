<template>
  <ElDrawer v-model="drawerVisible" :size="drawerSize" title="执行记录详情" destroy-on-close>
    <div v-if="runData" class="run-detail">
      <div class="run-detail__header">
        <ElTag size="large" :type="getTaskStatusTagType(runData.status)">
          {{ getTaskStatusLabel(runData.status) }}
        </ElTag>
        <span v-if="runData.retryCount > 0" class="run-detail__retry">
          重试 #{{ runData.retryCount }}
        </span>
      </div>

      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="记录 ID">{{ runData.taskId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="任务 ID">{{ runData.jobId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="执行器地址" :span="2">
          <span class="mono-text">{{ formatEmpty(runData.instanceAddr) }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="触发来源">{{
          formatEmpty(runData.triggerFrom)
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="尝试次数">{{ runData.tryTimes }}</ElDescriptionsItem>
        <ElDescriptionsItem label="重试次数">{{ runData.retryCount }}</ElDescriptionsItem>
        <ElDescriptionsItem label="重试间隔">{{ runData.retryInterval }} 秒</ElDescriptionsItem>
        <ElDescriptionsItem label="超时秒数">{{ runData.timeoutSecond }} 秒</ElDescriptionsItem>
        <ElDescriptionsItem label="执行耗时">
          {{ formatDuration(runData.executionTime) }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <h4 class="run-detail__title">执行时间线</h4>
      <ElTimeline>
        <ElTimelineItem
          :timestamp="formatMillis(runData.triggerTime)"
          placement="top"
          type="primary"
        >
          触发任务
        </ElTimelineItem>
        <ElTimelineItem
          v-if="runData.finishTime"
          :timestamp="formatMillis(runData.finishTime)"
          placement="top"
          :type="finishTimelineType"
        >
          执行结束
          <span class="elapsed"> (耗时 {{ formatDuration(runData.executionTime) }}) </span>
        </ElTimelineItem>
      </ElTimeline>

      <h4 class="run-detail__title">触发消息</h4>
      <pre class="run-detail__code">{{ formatEmpty(runData.triggerMessage) }}</pre>

      <h4 class="run-detail__title">回调消息</h4>
      <pre class="run-detail__code">{{ formatEmpty(runData.callbackMessage) }}</pre>

      <template v-if="runData.tryLogs?.length">
        <h4 class="run-detail__title">尝试日志</h4>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem
            v-for="(log, index) in runData.tryLogs"
            :key="index"
            :label="`#${index + 1}`"
          >
            <span class="mono-text">{{ formatMillis(log.executionTime) }} · {{ log.addr }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>
      </template>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { getTaskStatusLabel, getTaskStatusTagType } from '../../constants'
  import type { RunDetailData } from '../types'

  interface Props {
    visible: boolean
    runData?: RunDetailData
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

  const finishTimelineType = computed(() => {
    const tag = getTaskStatusTagType(props.runData?.status)
    return (tag === 'success' || tag === 'danger' || tag === 'warning' ? tag : 'info') as
      | 'success'
      | 'danger'
      | 'warning'
      | 'info'
  })

  const formatEmpty = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '-'
    return String(value)
  }

  const formatMillis = (value: number | null | undefined) => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const formatDuration = (value: number | null | undefined) => {
    if (value === undefined || value === null || value < 0) return '-'
    if (value < 1000) return `${value} ms`
    if (value < 60_000) return `${(value / 1000).toFixed(2)} s`
    if (value < 3_600_000) return `${(value / 60_000).toFixed(1)} min`
    return `${(value / 3_600_000).toFixed(2)} h`
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

    .mono-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 12.5px;
    }

    .elapsed {
      font-size: 12.5px;
      color: var(--art-text-gray-500);
    }
  }
</style>
