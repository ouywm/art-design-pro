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
  import { useDict } from '@/utils/dict'
  import {
    AI_CHANNEL_STATUS_OPTIONS,
    AI_CHANNEL_TYPE_OPTIONS,
    buildNumericDictOptions
  } from '../../enum-options'
  import type { ChannelSearchFormModel, ChannelStatus, ChannelType } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: ChannelSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: ChannelSearchFormModel): void
    (e: 'search', params: ChannelSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { getDict } = useDict()

  const searchBarRef = ref<SearchBarInstance>()

  const channelTypeOptions = computed<Array<{ label: string; value: ChannelType }>>(
    () =>
      buildNumericDictOptions(getDict('ai_channel_type'), AI_CHANNEL_TYPE_OPTIONS) as Array<{
        label: string
        value: ChannelType
      }>
  )

  const statusOptions = computed<Array<{ label: string; value: ChannelStatus }>>(
    () =>
      buildNumericDictOptions(getDict('ai_channel_status'), AI_CHANNEL_STATUS_OPTIONS) as Array<{
        label: string
        value: ChannelStatus
      }>
  )

  const formData = computed({
    get: () => props.modelValue,
    set: (value: ChannelSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '渠道名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入渠道名称',
        clearable: true
      }
    },
    {
      label: '供应商编码',
      key: 'vendorCode',
      type: 'input',
      props: {
        placeholder: '请输入供应商编码',
        clearable: true
      }
    },
    {
      label: '渠道类型',
      key: 'channelType',
      type: 'select',
      props: {
        placeholder: '请选择渠道类型',
        clearable: true,
        options: channelTypeOptions.value
      }
    },
    {
      label: '渠道分组',
      key: 'channelGroup',
      type: 'input',
      props: {
        placeholder: '请输入渠道分组',
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: statusOptions.value
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: ChannelSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
