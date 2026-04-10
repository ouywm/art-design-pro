<template>
  <ElDialog
    v-model="visible"
    title="执行详情"
    :width="dialogWidth"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="请求 ID" :span="2">
          <span class="break-all">{{ detail?.requestId || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag v-if="detail" :type="getExecutionStatusMeta(detail.status).type" size="small">
            {{ getExecutionStatusMeta(detail.status).text }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态码">
          {{ detail?.responseStatusCode ?? '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求主键">{{ detail?.aiRequestId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="尝试次数">{{ detail?.attemptNo ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="渠道 ID">{{ detail?.channelId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="账号 ID">{{ detail?.accountId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Endpoint">{{ detail?.endpoint || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求格式">{{ detail?.requestFormat || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求模型">{{
          detail?.requestedModel || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="上游模型">{{ detail?.upstreamModel || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="上游请求 ID" :span="2">
          <span class="break-all">{{ detail?.upstreamRequestId || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="总耗时">
          {{ formatLatencyMs(detail?.durationMs) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="首 Token 延迟">
          {{ formatLatencyMs(detail?.firstTokenMs) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="开始时间">{{ detail?.startedAt || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="结束时间">{{ detail?.finishedAt || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem v-if="detail?.errorMessage" label="错误摘要" :span="2">
          <span class="text-red-500">{{ detail.errorMessage }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求头" :span="2">
          <ElInput
            v-if="detail"
            type="textarea"
            :model-value="formatJsonValue(detail.requestHeaders)"
            :autosize="{ minRows: 3, maxRows: 8 }"
            readonly
          />
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求体" :span="2">
          <ElInput
            v-if="detail"
            type="textarea"
            :model-value="formatJsonValue(detail.requestBody)"
            :autosize="{ minRows: 4, maxRows: 12 }"
            readonly
          />
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="响应体" :span="2">
          <ElInput
            v-if="detail?.responseBody"
            type="textarea"
            :model-value="formatJsonValue(detail.responseBody)"
            :autosize="{ minRows: 4, maxRows: 12 }"
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
  import { fetchGetAiRequestExecutionDetail } from '@/api/ai-admin'
  import {
    formatJsonValue,
    formatLatencyMs,
    getExecutionStatusMeta
  } from '@/views/ai/request/helpers'
  import type { RequestExecutionDetailVo } from '../types'

  interface Props {
    modelValue: boolean
    executionId?: number
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

  const dialogWidth = computed(() => (width.value < 1280 ? '96%' : '1100px'))
  const loading = ref(false)
  const detail = ref<RequestExecutionDetailVo>()

  const loadDetail = async (executionId: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetAiRequestExecutionDetail(executionId)
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.executionId) {
      await loadDetail(props.executionId)
    }
  })

  watch(
    () => props.executionId,
    async (executionId) => {
      if (visible.value && executionId) {
        await loadDetail(executionId)
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
</style>
