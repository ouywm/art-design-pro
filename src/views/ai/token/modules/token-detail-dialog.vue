<template>
  <ElDialog v-model="dialogVisible" title="令牌详情" width="920px" align-center destroy-on-close>
    <div v-loading="loading" class="token-detail-dialog">
      <ElDescriptions v-if="detail" :column="2" border>
        <ElDescriptionsItem label="令牌名称">{{ detail.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="getTokenStatusTagType(detail.status)">
            {{ getTokenStatusLabel(detail.status) }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="所属用户">{{ getUserLabel(detail.userId) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Key 前缀">{{ detail.keyPrefix }}</ElDescriptionsItem>
        <ElDescriptionsItem label="服务账号 ID">
          {{ detail.serviceAccountId || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="项目 ID">{{ detail.projectId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="剩余额度">
          {{ detail.unlimitedQuota ? '不限' : detail.remainQuota }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="已用额度">{{ detail.usedQuota }}</ElDescriptionsItem>
        <ElDescriptionsItem label="分组覆盖">
          {{ detail.groupCodeOverride || '跟随用户额度' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="最近访问 IP">
          {{ detail.lastUsedIp || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="到期时间">
          {{ detail.expireTime || '永不过期' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="最近访问时间">
          {{ detail.accessTime || '未使用' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="RPM 限制">
          {{ formatLimit(detail.rpmLimit) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="TPM 限制">
          {{ formatLimit(detail.tpmLimit) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="并发限制">
          {{ formatLimit(detail.concurrencyLimit) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="日额度上限">
          {{ formatLimit(detail.dailyQuotaLimit) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="月额度上限">
          {{ formatLimit(detail.monthlyQuotaLimit) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="日窗口已用">
          {{ detail.dailyUsedQuota }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="月窗口已用">
          {{ detail.monthlyUsedQuota }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="日窗口起始">
          {{ detail.dailyWindowStart || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="月窗口起始">
          {{ detail.monthlyWindowStart || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建人">{{ detail.createBy }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新人">{{ detail.updateBy }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail.updateTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="允许模型" :span="2">
          <ElInput type="textarea" :model-value="joinTextList(detail.models)" :rows="3" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="允许 Endpoint" :span="2">
          <ElInput
            type="textarea"
            :model-value="joinTextList(detail.endpointScopes)"
            :rows="3"
            readonly
          />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="IP 白名单" :span="2">
          <ElInput
            type="textarea"
            :model-value="joinTextList(detail.ipWhitelist)"
            :rows="3"
            readonly
          />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="IP 黑名单" :span="2">
          <ElInput
            type="textarea"
            :model-value="joinTextList(detail.ipBlacklist)"
            :rows="3"
            readonly
          />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="最近 User-Agent" :span="2">
          <ElInput type="textarea" :model-value="detail.lastUserAgent || ''" :rows="3" readonly />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="备注" :span="2">
          {{ detail.remark || '-' }}
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetTokenDetail } from '@/api/ai-token'
  import { getTokenStatusLabel, getTokenStatusTagType } from '../constants'
  import type { TokenDetailData, UserOption } from '../types'

  interface Props {
    visible: boolean
    tokenId?: number
    userOptions: UserOption[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const detail = ref<TokenDetailData>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const getUserLabel = (userId: number) => {
    return props.userOptions.find((item) => item.value === userId)?.label ?? `用户 #${userId}`
  }

  const formatLimit = (value: number) => (Number(value) === 0 ? '不限' : `${Number(value)}`)

  const joinTextList = (values: string[]) => {
    return values.length ? values.join('\n') : '不限'
  }

  const loadDetail = async (id: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetTokenDetail(id)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [props.visible, props.tokenId],
    async ([visible, tokenId]) => {
      if (!visible || typeof tokenId !== 'number') return
      await loadDetail(tokenId)
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
  .token-detail-dialog {
    min-height: 240px;
  }
</style>
