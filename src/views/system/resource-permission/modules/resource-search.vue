<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :span="6"
    label-width="70px"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/types'
  import { RESOURCE_METHOD_OPTIONS } from '../constants'
  import type { ResourceSearchForm } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: ResourceSearchForm
  }

  interface Emits {
    (e: 'update:modelValue', value: ResourceSearchForm): void
    (e: 'search', params: ResourceSearchForm): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: ResourceSearchForm) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '资源名称',
      key: 'resourceName',
      type: 'input',
      props: {
        placeholder: '请输入资源名称',
        clearable: true
      }
    },
    {
      label: '资源编码',
      key: 'resourceCode',
      type: 'input',
      props: {
        placeholder: '请输入资源编码',
        clearable: true
      }
    },
    {
      label: '请求方式',
      key: 'method',
      type: 'select',
      props: {
        placeholder: '请选择请求方式',
        clearable: true,
        options: RESOURCE_METHOD_OPTIONS
      }
    },
    {
      label: '路径',
      key: 'path',
      type: 'input',
      props: {
        placeholder: '请输入接口路径',
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '停用', value: false }
        ]
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: ResourceSearchForm) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
