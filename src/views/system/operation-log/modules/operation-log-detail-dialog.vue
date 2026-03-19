<template>
  <ElDialog
    v-model="visible"
    title="操作日志详情"
    width="800px"
    destroy-on-close
    @close="handleClose"
  >
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="操作用户">{{ detail?.userName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户ID">{{ detail?.userId }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作模块">{{ detail?.module }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作动作">{{ detail?.action }}</ElDescriptionsItem>
      <ElDescriptionsItem label="业务类型">
        <ElTag :type="BUSINESS_TYPE_TAG[detail?.businessType ?? 0]" size="small">
          {{ detail?.businessTypeText }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作状态">
        <ElTag :type="STATUS_TAG_TYPE[detail?.status ?? 1]" size="small">
          {{ detail?.statusText }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求方式">{{ detail?.requestMethod }}</ElDescriptionsItem>
      <ElDescriptionsItem label="耗时">{{ detail?.duration }}ms</ElDescriptionsItem>
      <ElDescriptionsItem label="客户端IP">{{ detail?.clientIp }}</ElDescriptionsItem>
      <ElDescriptionsItem label="IP归属地">{{ detail?.ipLocation }}</ElDescriptionsItem>
      <ElDescriptionsItem label="请求URL" :span="2">
        <span class="break-all">{{ detail?.requestUrl }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="User-Agent" :span="2">
        <span class="break-all">{{ detail?.userAgent }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="响应状态码">{{ detail?.responseCode }}</ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">{{ detail?.createTime }}</ElDescriptionsItem>
      <ElDescriptionsItem v-if="detail?.errorMsg" label="错误信息" :span="2">
        <span class="text-red-500">{{ detail.errorMsg }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求参数" :span="2">
        <div v-if="detail?.requestParams" class="json-block">
          <ElButton
            class="copy-btn"
            :icon="CopyDocument"
            size="small"
            text
            @click="handleCopy(formatJson(detail.requestParams))"
          />
          <ElInput
            type="textarea"
            :model-value="formatJson(detail.requestParams)"
            :autosize="{ minRows: 2, maxRows: 10 }"
            readonly
          />
        </div>
        <span v-else>-</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="响应结果" :span="2">
        <div v-if="detail?.responseBody" class="json-block">
          <ElButton
            class="copy-btn"
            :icon="CopyDocument"
            size="small"
            text
            @click="handleCopy(formatJson(detail.responseBody))"
          />
          <ElInput
            type="textarea"
            :model-value="formatJson(detail.responseBody)"
            :autosize="{ minRows: 2, maxRows: 10 }"
            readonly
          />
        </div>
        <span v-else>-</span>
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
  import { CopyDocument } from '@element-plus/icons-vue'
  import {
    ElDialog,
    ElDescriptions,
    ElDescriptionsItem,
    ElTag,
    ElButton,
    ElMessage,
    ElInput
  } from 'element-plus'
  import { fetchGetOperationLogDetail } from '@/api/operation-log'

  interface Props {
    modelValue: boolean
    logId?: number
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 业务类型标签样式
  const BUSINESS_TYPE_TAG: Record<number, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'primary',
    5: 'info',
    6: 'info',
    7: 'warning'
  }

  // 操作状态标签样式
  const STATUS_TAG_TYPE: Record<number, 'success' | 'danger' | 'warning' | 'info'> = {
    1: 'success',
    2: 'danger',
    3: 'warning'
  }

  const detail = ref<Api.OperationLog.OperationLogDetail>()

  // 仅监听弹窗打开时加载详情（避免 logId 和 visible 同时变化触发两次请求）
  watch(visible, async (val) => {
    if (val && props.logId) {
      await loadDetail(props.logId)
    }
  })

  async function loadDetail(id: number) {
    const res = await fetchGetOperationLogDetail(id)
    detail.value = res as unknown as Api.OperationLog.OperationLogDetail
  }

  /**
   * 格式化JSON - 兼容字符串和已解析的对象
   */
  function formatJson(value: unknown): string {
    if (!value) return ''
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    try {
      return JSON.stringify(JSON.parse(value as string), null, 2)
    } catch {
      return String(value)
    }
  }

  /**
   * 复制到剪贴板
   */
  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  function handleClose() {
    detail.value = undefined
  }
</script>

<style scoped>
  .json-block {
    position: relative;
    width: 100%;
  }

  .copy-btn {
    position: absolute;
    top: 4px;
    right: 14px;
    z-index: 1;
  }
</style>
