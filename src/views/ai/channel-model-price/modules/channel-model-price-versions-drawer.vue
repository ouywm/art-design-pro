<template>
  <ElDrawer v-model="drawerVisible" title="价格版本记录" size="760px">
    <div v-loading="loading" class="versions-drawer">
      <ElDescriptions v-if="detailData" :column="2" border class="versions-drawer__meta">
        <ElDescriptionsItem label="所属渠道">
          {{ channelLabel }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="模型名">
          {{ detailData.modelName }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="当前版本">
          {{ detailData.currentVersionNo ? `V${detailData.currentVersionNo}` : '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Reference ID">
          {{ detailData.referenceId }}
        </ElDescriptionsItem>
      </ElDescriptions>

      <div v-if="versions.length" class="versions-drawer__list">
        <article v-for="item in versions" :key="item.id" class="version-card">
          <div class="version-card__header">
            <div>
              <strong>V{{ item.versionNo }}</strong>
              <span class="version-card__ref">{{ item.referenceId }}</span>
            </div>
            <ElTag :type="getChannelModelPriceVersionStatusTagType(item.status)">
              {{ getChannelModelPriceVersionStatusLabel(item.status) }}
            </ElTag>
          </div>

          <div class="version-card__body">
            <div class="version-card__row">
              <span class="label">生效区间</span>
              <span class="value">
                {{ item.effectiveStartAt }} ~ {{ item.effectiveEndAt || '至今' }}
              </span>
            </div>
            <div class="version-card__row">
              <span class="label">价格配置</span>
              <span class="value">
                {{ formatPriceConfig(item.priceConfig) }}
              </span>
            </div>
            <div class="version-card__row">
              <span class="label">创建时间</span>
              <span class="value">{{ item.createTime }}</span>
            </div>
          </div>
        </article>
      </div>

      <ElEmpty v-else description="暂无价格版本记录" :image-size="100" />
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import {
    fetchGetChannelModelPriceDetail,
    fetchGetChannelModelPriceVersions
  } from '@/api/ai-channel-model-price'
  import {
    getChannelModelPriceVersionStatusLabel,
    getChannelModelPriceVersionStatusTagType
  } from '../constants'
  import type { ChannelModelPriceDetailVo, ChannelModelPriceVersionVo } from '../types'

  interface Props {
    visible: boolean
    priceId?: number
    channelLabel?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const detailData = ref<ChannelModelPriceDetailVo>()
  const versions = ref<ChannelModelPriceVersionVo[]>([])

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const loadData = async (priceId: number) => {
    loading.value = true
    try {
      const [detail, versionList] = await Promise.all([
        fetchGetChannelModelPriceDetail(priceId),
        fetchGetChannelModelPriceVersions(priceId)
      ])
      detailData.value = detail
      versions.value = versionList
    } finally {
      loading.value = false
    }
  }

  const formatPriceConfig = (config: Api.AiManage.ChannelModelPriceConfig) => {
    const parts = [`I ${config.inputPerMillion}`, `O ${config.outputPerMillion}`]
    if (config.cacheReadPerMillion) parts.push(`CR ${config.cacheReadPerMillion}`)
    if (config.cacheWritePerMillion) parts.push(`CW ${config.cacheWritePerMillion}`)
    if (config.reasoningPerMillion) parts.push(`R ${config.reasoningPerMillion}`)
    return parts.join(' / ')
  }

  watch(
    () => [props.visible, props.priceId],
    async ([visible, priceId]) => {
      if (visible !== true || typeof priceId !== 'number') return
      await loadData(priceId)
    }
  )
</script>

<style scoped lang="scss">
  .versions-drawer {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &__list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .version-card {
    padding: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: calc(var(--custom-radius) / 2 + 2px);

    &__header,
    &__row {
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    &__header {
      align-items: center;
      margin-bottom: 12px;
    }

    &__ref {
      margin-left: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label {
      flex: 0 0 72px;
      color: var(--el-text-color-secondary);
    }

    .value {
      flex: 1;
      text-align: right;
      word-break: break-word;
    }
  }
</style>
