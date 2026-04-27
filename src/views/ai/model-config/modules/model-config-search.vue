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
  import { MODEL_CONFIG_TYPE_OPTIONS, ENABLED_OPTIONS } from '../constants'
  import type { SearchFormModel, VendorOption } from '../types'

  interface Props {
    modelValue: SearchFormModel
    vendorOptions: VendorOption[]
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
      placeholder: '模型名称 / 显示名 / 备注'
    },
    {
      label: '模型标识',
      key: 'modelName',
      type: 'input',
      placeholder: '精确匹配模型标识'
    },
    {
      label: '模型类型',
      key: 'modelType',
      type: 'select',
      props: {
        placeholder: '全部类型',
        options: MODEL_CONFIG_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '供应商',
      key: 'vendorCode',
      type: 'select',
      props: {
        placeholder: '全部供应商',
        options: props.vendorOptions.map((item) => ({
          label: item.label,
          value: item.value
        })),
        filterable: true,
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
