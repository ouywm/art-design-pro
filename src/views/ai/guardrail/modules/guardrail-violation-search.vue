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
  import type { GuardrailViolationSearchFormModel } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }
  interface Props {
    modelValue: GuardrailViolationSearchFormModel
  }
  interface Emits {
    (e: 'update:modelValue', value: GuardrailViolationSearchFormModel): void
    (e: 'search', params: GuardrailViolationSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: GuardrailViolationSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    { label: '规则 ID', key: 'ruleId', type: 'number', props: { controls: false } },
    { label: '请求 ID', key: 'requestId', type: 'input', props: { clearable: true } },
    { label: '阶段', key: 'phase', type: 'input', props: { clearable: true } },
    { label: '分类', key: 'category', type: 'input', props: { clearable: true } },
    { label: '动作', key: 'actionTaken', type: 'input', props: { clearable: true } },
    {
      label: '创建时间',
      key: 'createTimeRange',
      type: 'datetime',
      span: 12,
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss'
      }
    }
  ])

  const handleReset = () => emit('reset')
  const handleSearch = async (params: GuardrailViolationSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
