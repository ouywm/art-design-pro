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
  import type { VendorSearchFormModel } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: VendorSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: VendorSearchFormModel): void
    (e: 'search', params: VendorSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: VendorSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '供应商编码',
      key: 'vendorCode',
      type: 'input',
      props: {
        placeholder: '请输入供应商编码',
        clearable: true
      }
    },
    {
      label: '供应商名称',
      key: 'vendorName',
      type: 'input',
      props: {
        placeholder: '请输入供应商名称',
        clearable: true
      }
    },
    {
      label: 'API 风格',
      key: 'apiStyle',
      type: 'input',
      props: {
        placeholder: '请输入 API 风格',
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

  const handleSearch = async (params: VendorSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
