<template>
  <ElDialog v-model="dialogVisible" title="令牌密钥" width="720px" align-center destroy-on-close>
    <ElAlert
      type="warning"
      :closable="false"
      show-icon
      title="密钥仅展示一次，请立即保存。关闭后无法再次查看明文。"
    />

    <ElDescriptions :column="2" border class="token-key-dialog__descriptions">
      <ElDescriptionsItem label="操作">{{ actionLabel }}</ElDescriptionsItem>
      <ElDescriptionsItem label="Key 前缀">{{ keyResult?.keyPrefix || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="令牌名称" :span="2">
        {{ keyResult?.tokenName || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="明文密钥" :span="2">
        <div class="token-key-dialog__raw-key">
          <ElInput type="textarea" :model-value="keyResult?.rawKey || ''" :rows="4" readonly />
          <ElButton :icon="CopyDocument" type="primary" plain @click="handleCopy">
            复制密钥
          </ElButton>
        </div>
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
  import { CopyDocument } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { TokenKeyResult } from '../types'

  interface Props {
    visible: boolean
    keyResult?: TokenKeyResult
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const keyResult = computed(() => props.keyResult)

  const actionLabel = computed(() => {
    if (keyResult.value?.action === 'rotate') return '轮换密钥'
    return '新增令牌'
  })

  const handleCopy = async () => {
    if (!keyResult.value?.rawKey) return

    try {
      await navigator.clipboard.writeText(keyResult.value.rawKey)
      ElMessage.success('密钥已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }
</script>

<style scoped lang="scss">
  .token-key-dialog__descriptions {
    margin-top: 16px;
  }

  .token-key-dialog__raw-key {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
