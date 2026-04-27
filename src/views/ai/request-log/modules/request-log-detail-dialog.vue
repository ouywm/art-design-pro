<template>
  <ElDialog v-model="dialogVisible" title="请求详情" width="960px" align-center destroy-on-close>
    <div v-loading="loading" class="request-log-detail-dialog">
      <ElDescriptions v-if="detail" :column="2" border>
        <ElDescriptionsItem label="请求号">{{ detail.requestId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求状态">
          <ElTag :type="getRequestStatusTagType(detail.status)">
            {{ getRequestStatusLabel(detail.status) }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="用户 ID">{{ detail.userId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="令牌 ID">{{ detail.tokenId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="项目 ID">{{ detail.projectId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="渠道分组">{{ detail.channelGroup || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="来源">{{ detail.sourceType }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Endpoint">{{ detail.endpoint }}</ElDescriptionsItem>
        <ElDescriptionsItem label="协议格式">{{ detail.requestFormat }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求模型">{{ detail.requestedModel }}</ElDescriptionsItem>
        <ElDescriptionsItem label="上游模型">{{ detail.upstreamModel || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="是否流式">
          {{ detail.isStream ? '是' : '否' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="客户端 IP">{{ detail.clientIp || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态码">
          {{ detail.responseStatusCode }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="耗时">{{ detail.durationMs }} ms</ElDescriptionsItem>
        <ElDescriptionsItem label="首 Token 延迟">{{ detail.firstTokenMs }} ms</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail.updateTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">
          <ElInput type="textarea" :model-value="detail.userAgent || ''" :rows="2" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求头" :span="2">
          <div class="request-log-detail-dialog__json-block">
            <ElButton
              class="request-log-detail-dialog__copy-btn"
              :icon="CopyDocument"
              size="small"
              text
              @click="handleCopy(formatJson(detail.requestHeaders))"
            />
            <ElInput
              type="textarea"
              :model-value="formatJson(detail.requestHeaders)"
              :autosize="{ minRows: 3, maxRows: 10 }"
              readonly
            />
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求体" :span="2">
          <div class="request-log-detail-dialog__json-block">
            <ElButton
              class="request-log-detail-dialog__copy-btn"
              :icon="CopyDocument"
              size="small"
              text
              @click="handleCopy(formatJson(detail.requestBody))"
            />
            <ElInput
              type="textarea"
              :model-value="formatJson(detail.requestBody)"
              :autosize="{ minRows: 4, maxRows: 14 }"
              readonly
            />
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="响应体" :span="2">
          <div class="request-log-detail-dialog__json-block">
            <ElButton
              class="request-log-detail-dialog__copy-btn"
              :icon="CopyDocument"
              size="small"
              text
              @click="handleCopy(formatJson(detail.responseBody))"
            />
            <ElInput
              type="textarea"
              :model-value="formatJson(detail.responseBody)"
              :autosize="{ minRows: 4, maxRows: 14 }"
              readonly
            />
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="错误摘要" :span="2">
          {{ detail.errorMessage || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { CopyDocument } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { fetchGetRequestDetailByRequestId } from '@/api/ai-request-log'
  import { getRequestStatusLabel, getRequestStatusTagType } from '../constants'
  import type { RequestDetailData } from '../types'

  interface Props {
    visible: boolean
    requestId?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const detail = ref<RequestDetailData>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formatJson = (value: unknown) => {
    if (value == null || value === '') return '-'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    try {
      return JSON.stringify(JSON.parse(String(value)), null, 2)
    } catch {
      return String(value)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  const loadDetail = async (requestId: string) => {
    loading.value = true
    try {
      detail.value = await fetchGetRequestDetailByRequestId(requestId)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [props.visible, props.requestId],
    async ([visible, requestId]) => {
      if (!visible || typeof requestId !== 'string' || !requestId) return
      await loadDetail(requestId)
    }
  )

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        detail.value = undefined
      }
    }
  )
</script>

<style scoped lang="scss">
  .request-log-detail-dialog {
    min-height: 240px;

    &__json-block {
      position: relative;
      width: 100%;
    }

    &__copy-btn {
      position: absolute;
      top: 4px;
      right: 14px;
      z-index: 1;
    }
  }
</style>
