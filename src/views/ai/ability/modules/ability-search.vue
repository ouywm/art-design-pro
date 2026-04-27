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
  import { ABILITY_ENABLED_OPTIONS } from '../constants'
  import type { ChannelOption, SearchFormModel } from '../types'

  interface Props {
    modelValue: SearchFormModel
    channelOptions: ChannelOption[]
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
      placeholder: '分组 / Endpoint / 模型'
    },
    {
      label: '渠道分组',
      key: 'channelGroup',
      type: 'input',
      placeholder: '如：default'
    },
    {
      label: 'Endpoint',
      key: 'endpointScope',
      type: 'input',
      placeholder: '如：chat/completions'
    },
    {
      label: '模型',
      key: 'model',
      type: 'input',
      placeholder: '精确匹配模型名'
    },
    {
      label: '渠道',
      key: 'channelId',
      type: 'select',
      props: {
        placeholder: '全部渠道',
        options: props.channelOptions.map((item) => ({
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
        options: ABILITY_ENABLED_OPTIONS,
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
