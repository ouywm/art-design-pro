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
  import type { AlertRuleSearchFormModel, AlertRuleStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: AlertRuleSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: AlertRuleSearchFormModel): void
    (e: 'search', params: AlertRuleSearchFormModel): void
    (e: 'reset'): void
  }

  const STATUS_OPTIONS: Array<{ label: string; value: AlertRuleStatus }> = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 2 }
  ]

  const SEVERITY_OPTIONS = [
    { label: 'P1', value: 1 },
    { label: 'P2', value: 2 },
    { label: 'P3', value: 3 },
    { label: 'P4', value: 4 }
  ]

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: AlertRuleSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '域编码',
      key: 'domainCode',
      type: 'input',
      props: {
        placeholder: '请输入域编码',
        clearable: true
      }
    },
    {
      label: '规则编码',
      key: 'ruleCode',
      type: 'input',
      props: {
        placeholder: '请输入规则编码',
        clearable: true
      }
    },
    {
      label: '指标键',
      key: 'metricKey',
      type: 'input',
      props: {
        placeholder: '请输入指标键',
        clearable: true
      }
    },
    {
      label: '严重级别',
      key: 'severity',
      type: 'select',
      props: {
        placeholder: '请选择严重级别',
        clearable: true,
        options: SEVERITY_OPTIONS
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

  const handleSearch = async (params: AlertRuleSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
