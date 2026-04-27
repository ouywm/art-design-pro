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
  import { ROUTING_RULE_STATUS_OPTIONS } from '../constants'
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
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '规则编码 / 名称 / 备注'
    },
    {
      label: '组织 ID',
      key: 'organizationId',
      type: 'number',
      placeholder: '可选'
    },
    {
      label: '项目 ID',
      key: 'projectId',
      type: 'number',
      placeholder: '可选'
    },
    {
      label: '规则编码',
      key: 'ruleCode',
      type: 'input',
      placeholder: '精确匹配编码'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: ROUTING_RULE_STATUS_OPTIONS,
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
