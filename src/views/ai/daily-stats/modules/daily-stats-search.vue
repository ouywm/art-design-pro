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
  import type { SearchFormModel } from '../types'

  interface Props {
    modelValue: SearchFormModel
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
      label: '统计日期',
      key: 'statsDateRange',
      type: 'datetime',
      span: 8,
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
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '项目 ID',
      key: 'projectId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '渠道 ID',
      key: 'channelId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '账号 ID',
      key: 'accountId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '模型',
      key: 'modelName',
      type: 'input',
      props: {
        placeholder: '精确匹配模型名'
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
