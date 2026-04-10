<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/types'
  import type {
    ChannelModelPriceBillingMode,
    ChannelModelPriceSearchFormModel,
    ChannelModelPriceStatus
  } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: ChannelModelPriceSearchFormModel
    channelOptions: Array<{ label: string; value: number }>
  }

  interface Emits {
    (e: 'update:modelValue', value: ChannelModelPriceSearchFormModel): void
    (e: 'search', params: ChannelModelPriceSearchFormModel): void
    (e: 'reset'): void
  }

  const BILLING_MODE_OPTIONS: Array<{ label: string; value: ChannelModelPriceBillingMode }> = [
    { label: '按 Token', value: 1 },
    { label: '按请求', value: 2 },
    { label: '按媒体单元', value: 3 }
  ]

  const STATUS_OPTIONS: Array<{ label: string; value: ChannelModelPriceStatus }> = [
    { label: '启用', value: 1 },
    { label: '停用', value: 2 }
  ]

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: ChannelModelPriceSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '所属渠道',
      key: 'channelId',
      type: 'select',
      props: {
        placeholder: props.channelOptions.length > 0 ? '请选择渠道' : '暂无渠道数据',
        clearable: true,
        filterable: true,
        options: props.channelOptions
      }
    },
    {
      label: '模型名称',
      key: 'modelName',
      type: 'input',
      props: {
        placeholder: '请输入模型名称',
        clearable: true
      }
    },
    {
      label: '计费模式',
      key: 'billingMode',
      type: 'select',
      props: {
        placeholder: '请选择计费模式',
        clearable: true,
        options: BILLING_MODE_OPTIONS
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: STATUS_OPTIONS
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: ChannelModelPriceSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
