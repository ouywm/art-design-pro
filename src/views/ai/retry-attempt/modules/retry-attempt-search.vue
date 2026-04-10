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
  import type { RetryAttemptSearchFormModel, RetryAttemptStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: RetryAttemptSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: RetryAttemptSearchFormModel): void
    (e: 'search', params: RetryAttemptSearchFormModel): void
    (e: 'reset'): void
  }

  const STATUS_OPTIONS: Array<{ label: string; value: RetryAttemptStatus }> = [
    { label: '待重试', value: 1 },
    { label: '成功', value: 2 },
    { label: '失败', value: 3 },
    { label: '已放弃', value: 4 }
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
    set: (value: RetryAttemptSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '域编码',
      key: 'domainCode',
      type: 'input',
      props: {
        placeholder: '请输入域编码',
        clearable: true
      }
    },
    {
      label: '任务类型',
      key: 'taskType',
      type: 'input',
      props: {
        placeholder: '请输入任务类型',
        clearable: true
      }
    },
    {
      label: 'Reference ID',
      key: 'referenceId',
      type: 'input',
      props: {
        placeholder: '请输入 reference ID',
        clearable: true
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
      label: '重试次数',
      key: 'attemptNo',
      type: 'number',
      props: {
        placeholder: '请输入重试次数',
        controls: false
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
      label: '下次重试',
      key: 'nextRetryAtRange',
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
    },
    {
      label: '创建时间',
      key: 'createTimeRange',
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

  const handleSearch = async (params: RetryAttemptSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
