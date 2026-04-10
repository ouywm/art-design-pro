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
  import type { GuardrailRuleSearchFormModel, GuardrailRuleSeverity } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: GuardrailRuleSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: GuardrailRuleSearchFormModel): void
    (e: 'search', params: GuardrailRuleSearchFormModel): void
    (e: 'reset'): void
  }

  const severityOptions: Array<{ label: string; value: GuardrailRuleSeverity }> = [
    { label: 'Low', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'High', value: 3 }
  ]

  const enabledOptions = [
    { label: '启用', value: true },
    { label: '禁用', value: false }
  ]

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: GuardrailRuleSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    { label: 'Config ID', key: 'guardrailConfigId', type: 'number', props: { controls: false } },
    { label: '规则编码', key: 'ruleCode', type: 'input', props: { clearable: true } },
    { label: '规则名称', key: 'ruleName', type: 'input', props: { clearable: true } },
    { label: '阶段', key: 'phase', type: 'input', props: { clearable: true } },
    { label: '动作', key: 'action', type: 'input', props: { clearable: true } },
    {
      label: '启用',
      key: 'enabled',
      type: 'select',
      props: { clearable: true, options: enabledOptions }
    },
    {
      label: '级别',
      key: 'severity',
      type: 'select',
      props: { clearable: true, options: severityOptions }
    }
  ])

  const handleReset = () => emit('reset')
  const handleSearch = async (params: GuardrailRuleSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
