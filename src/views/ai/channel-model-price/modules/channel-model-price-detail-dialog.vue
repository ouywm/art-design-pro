<template>
  <ElDialog
    v-model="visible"
    title="模型价格详情"
    :width="dialogWidth"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="所属渠道">
          {{ detail ? getChannelName(detail.channelId) : '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模型名称">{{ detail?.modelName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="计费模式">
          <ElTag v-if="detail" type="info" size="small">
            {{ getBillingModeLabel(detail.billingMode) }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag v-if="detail" :type="detail.status === 1 ? 'success' : 'warning'" size="small">
            {{ detail.status === 1 ? '启用' : '停用' }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="货币">{{ detail?.currency || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail?.updateTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Reference ID" :span="2">
          <span class="break-all">{{ detail?.referenceId || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="价格摘要" :span="2">
          {{ detail ? buildPriceConfigSummary(detail.priceConfig) : '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="备注" :span="2">
          {{ detail?.remark || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="价格配置 JSON" :span="2">
          <ElInput
            v-if="detail"
            type="textarea"
            :model-value="stringifyJsonValue(detail.priceConfig)"
            :autosize="{ minRows: 4, maxRows: 10 }"
            readonly
          />
          <span v-else>-</span>
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElDivider content-position="left">版本历史</ElDivider>

      <ElEmpty v-if="!detail || detail.versions.length === 0" description="暂无版本记录" />
      <ElTable v-else :data="detail.versions" border>
        <ElTableColumn prop="versionNo" label="版本号" width="90" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '生效' : '归档' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="effectiveStartAt" label="生效开始" min-width="180" />
        <ElTableColumn label="生效结束" min-width="180">
          <template #default="{ row }">
            {{ row.effectiveEndAt || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="referenceId"
          label="Reference ID"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn label="价格摘要" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ buildPriceConfigSummary(row.priceConfig) }}
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { fetchGetAiChannelModelPriceDetail } from '@/api/ai-admin'
  import { buildPriceConfigSummary, stringifyJsonValue } from '../helpers'
  import type { ChannelModelPriceBillingMode, ChannelModelPriceDetailVo } from '../types'

  interface Props {
    modelValue: boolean
    priceId?: number
    channelOptions: Api.AiChannel.ChannelListItem[]
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

  const dialogWidth = computed(() => (width.value < 1200 ? '95%' : '1100px'))
  const loading = ref(false)
  const detail = ref<ChannelModelPriceDetailVo>()

  const channelNameMap = computed(
    () =>
      new Map(props.channelOptions.map((item) => [item.id, `${item.name} (${item.vendorCode})`]))
  )

  const getChannelName = (channelId: number) =>
    channelNameMap.value.get(channelId) || String(channelId)

  const getBillingModeLabel = (mode: ChannelModelPriceBillingMode) => {
    switch (mode) {
      case 1:
        return '按 Token'
      case 2:
        return '按请求'
      case 3:
        return '按媒体单元'
      default:
        return String(mode)
    }
  }

  const loadDetail = async (priceId: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetAiChannelModelPriceDetail(priceId)
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.priceId) {
      await loadDetail(props.priceId)
    }
  })

  watch(
    () => props.priceId,
    async (priceId) => {
      if (visible.value && priceId) {
        await loadDetail(priceId)
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
