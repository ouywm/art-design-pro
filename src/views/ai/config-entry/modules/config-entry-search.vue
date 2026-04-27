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
  import { CONFIG_ENTRY_SCOPE_TYPE_OPTIONS, CONFIG_ENTRY_STATUS_OPTIONS } from '../constants'
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
      placeholder: '分类 / 配置键 / 备注'
    },
    {
      label: '作用域',
      key: 'scopeType',
      type: 'select',
      props: {
        placeholder: '全部作用域',
        options: CONFIG_ENTRY_SCOPE_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '作用域 ID',
      key: 'scopeId',
      type: 'number',
      placeholder: '如：0 / 1001'
    },
    {
      label: '配置分类',
      key: 'category',
      type: 'input',
      placeholder: '精确匹配分类'
    },
    {
      label: '配置键',
      key: 'configKey',
      type: 'input',
      placeholder: '精确匹配配置键'
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: CONFIG_ENTRY_STATUS_OPTIONS,
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
