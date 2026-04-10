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
  import type { RequestExecutionSearchFormModel, RequestExecutionStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: RequestExecutionSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: RequestExecutionSearchFormModel): void
    (e: 'search', params: RequestExecutionSearchFormModel): void
    (e: 'reset'): void
  }

  const STATUS_OPTIONS: Array<{ label: string; value: RequestExecutionStatus }> = [
    { label: '待执行', value: 1 },
    { label: '执行中', value: 2 },
    { label: '成功', value: 3 },
    { label: '失败', value: 4 },
    { label: '已取消', value: 5 }
  ]

  const DATE_TIME_SHORTCUTS = [
    {
      text: '今日',
      value: () => {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        return [start, end]
      }
    },
    {
      text: '近三天',
      value: () => {
        const start = new Date(Date.now() - 3 * 86400000)
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        return [start, end]
      }
    },
    {
      text: '最近一周',
      value: () => {
        const start = new Date(Date.now() - 7 * 86400000)
        start.setHours(0, 0, 0, 0)
        const end = new Date()
        end.setHours(23, 59, 59, 999)
        return [start, end]
      }
    }
  ]

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: RequestExecutionSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '请求主键',
      key: 'aiRequestId',
      type: 'number',
      props: {
        placeholder: '请输入请求主键',
        controls: false
      }
    },
    {
      label: '请求 ID',
      key: 'requestId',
      type: 'input',
      props: {
        placeholder: '请输入请求 ID',
        clearable: true
      }
    },
    {
      label: '渠道 ID',
      key: 'channelId',
      type: 'number',
      props: {
        placeholder: '请输入渠道 ID',
        controls: false
      }
    },
    {
      label: '账号 ID',
      key: 'accountId',
      type: 'number',
      props: {
        placeholder: '请输入账号 ID',
        controls: false
      }
    },
    {
      label: 'Endpoint',
      key: 'endpoint',
      type: 'input',
      props: {
        placeholder: '请输入 endpoint',
        clearable: true
      }
    },
    {
      label: '请求格式',
      key: 'requestFormat',
      type: 'input',
      props: {
        placeholder: '请输入请求格式',
        clearable: true
      }
    },
    {
      label: '请求模型',
      key: 'requestedModel',
      type: 'input',
      props: {
        placeholder: '请输入请求模型',
        clearable: true
      }
    },
    {
      label: '上游模型',
      key: 'upstreamModel',
      type: 'input',
      props: {
        placeholder: '请输入上游模型',
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: STATUS_OPTIONS
      }
    },
    {
      label: '响应码',
      key: 'responseStatusCode',
      type: 'number',
      props: {
        placeholder: '请输入响应状态码',
        controls: false
      }
    },
    {
      label: '开始时间',
      key: 'startedAtRange',
      type: 'datetime',
      span: 12,
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        shortcuts: DATE_TIME_SHORTCUTS
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: RequestExecutionSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
