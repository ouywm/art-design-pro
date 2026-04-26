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
  import { API_STYLE_OPTIONS, ENABLED_OPTIONS } from '../constants'
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
      placeholder: '供应商名称 / 备注'
    },
    {
      label: '供应商编码',
      key: 'vendorCode',
      type: 'input',
      placeholder: '如：openai'
    },
    {
      label: '接口风格',
      key: 'apiStyle',
      type: 'select',
      props: {
        placeholder: '全部风格',
        options: API_STYLE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: ENABLED_OPTIONS,
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
