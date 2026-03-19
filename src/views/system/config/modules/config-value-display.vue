<template>
  <div class="config-value-display">
    <span v-if="!hasValue" class="empty-text">未配置</span>

    <ElImage
      v-else-if="valueType === CONFIG_VALUE_TYPE.IMAGE"
      :class="['image-value', { 'is-compact': compact }]"
      :src="value"
      :preview-src-list="[value]"
      fit="cover"
      preview-teleported
    />

    <ElTag v-else-if="valueType === CONFIG_VALUE_TYPE.BOOLEAN" :type="booleanTagType">
      {{ booleanLabel }}
    </ElTag>

    <ElTag v-else-if="valueType === CONFIG_VALUE_TYPE.SELECT" type="info">
      {{ selectLabel }}
    </ElTag>

    <pre
      v-else-if="valueType === CONFIG_VALUE_TYPE.TEXTAREA || valueType === CONFIG_VALUE_TYPE.JSON"
      class="block-text"
      >{{ formattedValue }}</pre
    >

    <span v-else-if="valueType === CONFIG_VALUE_TYPE.PASSWORD" class="password-text">
      {{ maskedPassword }}
    </span>

    <span v-else class="inline-text">{{ formattedValue }}</span>
  </div>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
  import { CONFIG_VALUE_TYPE } from '../constants'
  import type { ConfigValueType } from '../types'

  defineOptions({ name: 'ConfigValueDisplay' })

  interface Props {
    value?: string
    valueType?: ConfigValueType
    optionDictType?: string
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    value: '',
    valueType: CONFIG_VALUE_TYPE.TEXT,
    optionDictType: '',
    compact: false
  })

  const { getDictLabel } = useDict()

  const hasValue = computed(() => props.value.trim().length > 0)

  const normalizeBooleanValue = (value: string): boolean => {
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase())
  }

  const booleanValue = computed(() => normalizeBooleanValue(props.value))
  const booleanLabel = computed(() => (booleanValue.value ? '是' : '否'))
  const booleanTagType = computed(() => (booleanValue.value ? 'success' : 'info'))

  const selectLabel = computed(() => {
    if (!props.optionDictType) {
      return props.value
    }

    return getDictLabel(props.optionDictType, props.value)
  })

  const formatJsonValue = (value: string): string => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  const formattedValue = computed(() => {
    if (props.valueType === CONFIG_VALUE_TYPE.JSON) {
      return formatJsonValue(props.value)
    }

    if (props.valueType === CONFIG_VALUE_TYPE.SELECT) {
      return selectLabel.value
    }

    return props.value
  })

  const maskedPassword = computed(() => {
    const passwordLength = props.value.length
    return passwordLength > 0 ? '•'.repeat(Math.min(passwordLength, 12)) : '未配置'
  })
</script>

<style scoped lang="scss">
  .config-value-display {
    display: flex;
    align-items: flex-start;
    min-height: 24px;
    color: var(--el-text-color-regular);

    .empty-text {
      color: var(--el-text-color-placeholder);
    }

    .image-value {
      width: 108px;
      height: 72px;
      overflow: hidden;
      background: var(--el-fill-color-light);
      border: 1px solid rgb(15 23 42 / 8%);
      border-radius: max(calc(var(--custom-radius) - 4px), 8px);

      &.is-compact {
        width: 76px;
        height: 76px;
        border-radius: max(calc(var(--custom-radius) - 6px), 8px);
      }
    }

    .block-text {
      width: 100%;
      padding: 10px 12px;
      margin: 0;
      overflow: auto;
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
      word-break: break-word;
      white-space: pre-wrap;
      background: rgb(15 23 42 / 4%);
      border-radius: max(calc(var(--custom-radius) - 4px), 8px);
    }

    .password-text,
    .inline-text {
      line-height: 1.6;
      word-break: break-word;
    }

    .password-text {
      letter-spacing: 0.14em;
    }
  }
</style>
