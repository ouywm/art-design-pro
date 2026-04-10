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
  import type { AlertSilenceSearchFormModel, AlertSilenceStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: AlertSilenceSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: AlertSilenceSearchFormModel): void
    (e: 'search', params: AlertSilenceSearchFormModel): void
    (e: 'reset'): void
  }

  const STATUS_OPTIONS: Array<{ label: string; value: AlertSilenceStatus }> = [
    { label: '生效中', value: 1 },
    { label: '已结束', value: 2 }
  ]

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: AlertSilenceSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '规则 ID',
      key: 'alertRuleId',
      type: 'number',
      props: {
        placeholder: '请输入规则 ID',
        controls: false
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
    },
    {
      label: '作用域类型',
      key: 'scopeType',
      type: 'input',
      props: {
        placeholder: '请输入作用域类型',
        clearable: true
      }
    },
    {
      label: '作用域键',
      key: 'scopeKey',
      type: 'input',
      props: {
        placeholder: '请输入作用域键',
        clearable: true
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: AlertSilenceSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
