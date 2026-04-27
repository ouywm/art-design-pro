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
  import {
    CHANNEL_MODEL_PRICE_BILLING_MODE_OPTIONS,
    CHANNEL_MODEL_PRICE_STATUS_OPTIONS
  } from '../constants'
  import type { ChannelOption, SearchFormModel } from '../types'

  interface Props {
    modelValue: SearchFormModel
    channelOptions: ChannelOption[]
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchFormModel): void
    (e: 'search', params: SearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '模型名 / Reference ID / 备注'
    },
    {
      label: '所属渠道',
      key: 'channelId',
      type: 'select',
      props: {
        placeholder: '全部渠道',
        options: props.channelOptions.map((item) => ({
          label: item.label,
          value: item.value
        })),
        filterable: true,
        clearable: true
      }
    },
    {
      label: '模型名',
      key: 'modelName',
      type: 'input',
      placeholder: '精确匹配模型名'
    },
    {
      label: '计费模式',
      key: 'billingMode',
      type: 'select',
      props: {
        placeholder: '全部模式',
        options: CHANNEL_MODEL_PRICE_BILLING_MODE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: CHANNEL_MODEL_PRICE_STATUS_OPTIONS,
        clearable: true
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
