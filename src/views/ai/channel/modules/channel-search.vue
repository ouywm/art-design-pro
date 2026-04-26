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
  import type { SearchFormModel, VendorOption } from '../types'
  import { CHANNEL_STATUS_OPTIONS, CHANNEL_TYPE_OPTIONS } from '../constants'

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
      placeholder: '渠道名称 / 备注'
    },
    {
      label: '渠道类型',
      key: 'channelType',
      type: 'select',
      props: {
        placeholder: '全部类型',
        options: CHANNEL_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '渠道状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: CHANNEL_STATUS_OPTIONS,
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
      label: '渠道分组',
      key: 'channelGroup',
      type: 'input',
      placeholder: '如：default'
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
