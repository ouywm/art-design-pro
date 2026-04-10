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
  import { AI_CHANNEL_ACCOUNT_STATUS_OPTIONS, buildNumericDictOptions } from '../../enum-options'
  import type { ChannelAccountSearchFormModel, ChannelAccountStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: ChannelAccountSearchFormModel
    channelOptions: Array<{ label: string; value: number }>
  }

  interface Emits {
    (e: 'update:modelValue', value: ChannelAccountSearchFormModel): void
    (e: 'search', params: ChannelAccountSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { getDict } = useDict()
  const searchBarRef = ref<SearchBarInstance>()

  const statusOptions = computed<Array<{ label: string; value: ChannelAccountStatus }>>(
    () =>
      buildNumericDictOptions(
        getDict('ai_channel_account_status'),
        AI_CHANNEL_ACCOUNT_STATUS_OPTIONS
      ) as Array<{ label: string; value: ChannelAccountStatus }>
  )

  const formData = computed({
    get: () => props.modelValue,
    set: (value: ChannelAccountSearchFormModel) => emit('update:modelValue', value)
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
      label: '账号名称',
      key: 'name',
      type: 'input',
      props: {
        placeholder: '请输入账号名称',
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
    },
    {
      label: '可调度',
      key: 'schedulable',
      type: 'select',
      props: {
        placeholder: '请选择调度状态',
        clearable: true,
        options: [
          { label: '可调度', value: true },
          { label: '不可调度', value: false }
        ]
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: ChannelAccountSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
