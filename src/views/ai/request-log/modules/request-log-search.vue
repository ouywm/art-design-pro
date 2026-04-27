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
  import { REQUEST_LOG_STATUS_OPTIONS, REQUEST_LOG_TYPE_OPTIONS } from '../constants'
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
      props: {
        placeholder: 'Token / 渠道 / 账号 / 摘要'
      }
    },
    {
      label: '请求号',
      key: 'requestId',
      type: 'input',
      props: {
        placeholder: 'request_id'
      }
    },
    {
      label: '调用状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: REQUEST_LOG_STATUS_OPTIONS,
        clearable: true
      }
    },
    {
      label: '日志类型',
      key: 'logType',
      type: 'select',
      props: {
        placeholder: '全部类型',
        options: REQUEST_LOG_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: 'Endpoint',
      key: 'endpoint',
      type: 'input',
      props: {
        placeholder: '精确匹配 endpoint'
      }
    },
    {
      label: '模型',
      key: 'modelName',
      type: 'input',
      props: {
        placeholder: '计费模型名'
      }
    },
    {
      label: '用户 ID',
      key: 'userId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '令牌 ID',
      key: 'tokenId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '渠道 ID',
      key: 'channelId',
      type: 'number',
      props: {
        placeholder: '精确匹配',
        controls: false
      }
    },
    {
      label: '请求时间',
      key: 'requestTimeRange',
      type: 'datetime',
      span: 8,
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ssZ'
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
