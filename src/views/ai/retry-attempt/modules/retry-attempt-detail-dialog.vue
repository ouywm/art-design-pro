<template>
  <ElDialog
    v-model="visible"
    title="重试详情"
    :width="dialogWidth"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="域编码">{{ detail?.domainCode || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="任务类型">{{ detail?.taskType || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Reference ID" :span="2">
          <span class="break-all">{{ detail?.referenceId || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求 ID" :span="2">
          <span class="break-all">{{ detail?.requestId || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag v-if="detail" :type="getRetryAttemptStatusMeta(detail.status).type" size="small">
            {{ getRetryAttemptStatusMeta(detail.status).text }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="重试次数">{{ detail?.attemptNo ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="退避时间">
          {{ formatBackoffSeconds(detail?.backoffSeconds) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="下次重试">{{ detail?.nextRetryAt || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail?.updateTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem v-if="detail?.errorMessage" label="错误信息" :span="2">
          <span class="text-red-500">{{ detail.errorMessage }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="重试载荷" :span="2">
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
  import { fetchGetAiRetryAttemptDetail } from '@/api/ai-admin'
  import { formatJsonValue } from '@/views/ai/request/helpers'
  import { formatBackoffSeconds, getRetryAttemptStatusMeta } from '../helpers'
  import type { RetryAttemptDetailVo } from '../types'

  interface Props {
    modelValue: boolean
    retryAttemptId?: number
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

  const dialogWidth = computed(() => (width.value < 1200 ? '95%' : '980px'))
  const loading = ref(false)
  const detail = ref<RetryAttemptDetailVo>()

  const loadDetail = async (retryAttemptId: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetAiRetryAttemptDetail(retryAttemptId)
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.retryAttemptId) {
      await loadDetail(props.retryAttemptId)
    }
  })

  watch(
    () => props.retryAttemptId,
    async (retryAttemptId) => {
      if (visible.value && retryAttemptId) {
        await loadDetail(retryAttemptId)
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
