<template>
  <ElDialog
    v-model="visible"
    title="告警事件详情"
    :width="dialogWidth"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="事件编码" :span="2">
          <span class="break-all">{{ detail?.eventCode || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="标题" :span="2">
          {{ detail?.title || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="规则 ID">
          {{ detail?.alertRuleId ?? '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag v-if="detail" :type="getAlertEventStatusMeta(detail.status).type" size="small">
            {{ getAlertEventStatusMeta(detail.status).text }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="严重级别">
          <ElTag v-if="detail" :type="getAlertSeverityMeta(detail.severity).type" size="small">
            {{ getAlertSeverityMeta(detail.severity).text }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="来源域">{{ detail?.sourceDomain || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="来源对象" :span="2">
          <span class="break-all">{{ detail?.sourceRef || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="首次触发">
          {{ formatAlertEventTime(detail?.firstTriggeredAt) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="最近触发">
          {{ formatAlertEventTime(detail?.lastTriggeredAt) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="确认人">{{ detail?.ackBy || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="确认时间">
          {{ formatAlertEventTime(detail?.ackTime) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="解决人">{{ detail?.resolvedBy || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="解决时间">
          {{ formatAlertEventTime(detail?.resolvedTime) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间" :span="2">
          {{ formatAlertEventTime(detail?.createTime) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="详细说明" :span="2">
          <div class="detail-text">{{ detail?.detail || '-' }}</div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="事件载荷" :span="2">
          <ElInput
            v-if="detail"
            type="textarea"
            :model-value="formatJsonValue(detail.payload)"
            :autosize="{ minRows: 6, maxRows: 14 }"
            readonly
          />
          <span v-else>-</span>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { fetchGetAiAlertEventDetail } from '@/api/ai-admin'
  import { formatJsonValue } from '@/views/ai/request/helpers'
  import { formatAlertEventTime, getAlertEventStatusMeta, getAlertSeverityMeta } from '../helpers'
  import type { AlertEventDetailVo } from '../types'

  interface Props {
    modelValue: boolean
    eventId?: number
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { width } = useWindowSize()

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const dialogWidth = computed(() => (width.value < 1280 ? '96%' : '1080px'))
  const loading = ref(false)
  const detail = ref<AlertEventDetailVo>()

  const loadDetail = async (eventId: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetAiAlertEventDetail(eventId)
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.eventId) {
      await loadDetail(props.eventId)
    }
  })

  watch(
    () => props.eventId,
    async (eventId) => {
      if (visible.value && eventId) {
        await loadDetail(eventId)
      }
    }
  )

  const handleClose = () => {
    detail.value = undefined
  }
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }

  .detail-text {
    line-height: 1.6;
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
