<template>
  <ElDialog
    v-model="visible"
    title="请求详情"
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
          <ElTag v-if="detail" :type="getRequestStatusMeta(detail.status).type" size="small">
            {{ getRequestStatusMeta(detail.status).text }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态码">
          {{ detail?.responseStatusCode ?? '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="用户 ID">{{ detail?.userId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="令牌 ID">{{ detail?.tokenId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="项目 ID">{{ detail?.projectId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="会话 ID">{{ detail?.sessionId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="对话 ID">{{ detail?.conversationId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="消息 ID">{{ detail?.messageId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="线程 ID">{{ detail?.threadId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="追踪 ID">{{ detail?.traceId ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="渠道分组">{{ detail?.channelGroup || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="来源类型">{{ detail?.sourceType || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Endpoint">{{ detail?.endpoint || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求格式">{{ detail?.requestFormat || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求模型">{{
          detail?.requestedModel || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="上游模型">{{ detail?.upstreamModel || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="流式模式">
          <ElTag v-if="detail" :type="detail.isStream ? 'success' : 'info'" size="small">
            {{ detail.isStream ? '流式' : '非流式' }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="总耗时">
          {{ formatLatencyMs(detail?.durationMs) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="首 Token 延迟">
          {{ formatLatencyMs(detail?.firstTokenMs) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="客户端 IP">{{ detail?.clientIp || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail?.updateTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">
          <span class="break-all">{{ detail?.userAgent || '-' }}</span>
        </ElDescriptionsItem>
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

      <ElDivider content-position="left">
        Execution 预览（{{ executionTotal }} 条，当前展示 {{ executions.length }} 条）
      </ElDivider>

      <ElEmpty v-if="executions.length === 0" description="暂无 execution 记录" />
      <ElTable v-else :data="executions" border>
        <ElTableColumn prop="attemptNo" label="尝试" width="80" />
        <ElTableColumn prop="channelId" label="渠道 ID" width="100" />
        <ElTableColumn prop="accountId" label="账号 ID" width="100" />
        <ElTableColumn prop="requestedModel" label="请求模型" min-width="150" />
        <ElTableColumn prop="upstreamModel" label="上游模型" min-width="150" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="getExecutionStatusMeta(row.status).type" size="small">
              {{ getExecutionStatusMeta(row.status).text }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="responseStatusCode" label="响应码" width="90" />
        <ElTableColumn label="耗时" width="100">
          <template #default="{ row }">
            {{ formatLatencyMs(row.durationMs) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="startedAt" label="开始时间" min-width="180" />
        <ElTableColumn label="结束时间" min-width="180">
          <template #default="{ row }">
            {{ row.finishedAt || '-' }}
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { fetchGetAiRequestDetail, fetchGetAiRequestExecutions } from '@/api/ai-admin'
  import {
    formatJsonValue,
    formatLatencyMs,
    getExecutionStatusMeta,
    getRequestStatusMeta
  } from '../helpers'
  import type { RequestDetailVo, RequestExecutionListItem } from '../types'

  interface Props {
    modelValue: boolean
    requestId?: number
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

  const dialogWidth = computed(() => (width.value < 1280 ? '96%' : '1180px'))
  const loading = ref(false)
  const detail = ref<RequestDetailVo>()
  const executions = ref<RequestExecutionListItem[]>([])
  const executionTotal = ref(0)

  const loadData = async (requestId: number) => {
    loading.value = true
    try {
      const [requestDetail, executionPage] = await Promise.all([
        fetchGetAiRequestDetail(requestId),
        fetchGetAiRequestExecutions(requestId, {
          page: 1,
          size: 10
        })
      ])

      detail.value = requestDetail
      executions.value = executionPage.content
      executionTotal.value = executionPage.totalElements
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.requestId) {
      await loadData(props.requestId)
    }
  })

  watch(
    () => props.requestId,
    async (requestId) => {
      if (visible.value && requestId) {
        await loadData(requestId)
      }
    }
  )

  const handleClose = () => {
    detail.value = undefined
    executions.value = []
    executionTotal.value = 0
  }
</script>

<style scoped>
  .break-all {
    word-break: break-all;
  }
</style>
