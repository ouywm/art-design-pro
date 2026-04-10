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
  import type { DailyStatsSearchFormModel } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: DailyStatsSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: DailyStatsSearchFormModel): void
    (e: 'search', params: DailyStatsSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: DailyStatsSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '统计日期',
      key: 'statsDateRange',
      type: 'date',
      span: 12,
      props: {
        style: { width: '100%' },
        type: 'daterange',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD'
      }
    },
    {
      label: '用户 ID',
      key: 'userId',
      type: 'number',
      props: {
        placeholder: '请输入用户 ID',
        controls: false
      }
    },
    {
      label: '项目 ID',
      key: 'projectId',
      type: 'number',
      props: {
        placeholder: '请输入项目 ID',
        controls: false
      }
    },
    {
      label: '渠道 ID',
      key: 'channelId',
      type: 'number',
      props: {
        placeholder: '请输入渠道 ID',
        controls: false
      }
    },
    {
      label: '账号 ID',
      key: 'accountId',
      type: 'number',
      props: {
        placeholder: '请输入账号 ID',
        controls: false
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
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: DailyStatsSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
