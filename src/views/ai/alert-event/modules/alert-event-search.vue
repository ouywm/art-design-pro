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
  import type { AlertEventSearchFormModel, AlertEventStatus } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: AlertEventSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: AlertEventSearchFormModel): void
    (e: 'search', params: AlertEventSearchFormModel): void
    (e: 'reset'): void
  }

  const STATUS_OPTIONS: Array<{ label: string; value: AlertEventStatus }> = [
    { label: '打开', value: 1 },
    { label: '已确认', value: 2 },
    { label: '已解决', value: 3 },
    { label: '忽略', value: 4 }
  ]

  const SEVERITY_OPTIONS = [
    { label: 'P1', value: 1 },
    { label: 'P2', value: 2 },
    { label: 'P3', value: 3 },
    { label: 'P4', value: 4 }
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
    set: (value: AlertEventSearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '规则 ID',
      key: 'alertRuleId',
      type: 'number',
      props: {
        placeholder: '请输入规则 ID',
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
      label: '严重级别',
      key: 'severity',
      type: 'select',
      props: {
        placeholder: '请选择严重级别',
        clearable: true,
        options: SEVERITY_OPTIONS
      }
    },
    {
      label: '来源域',
      key: 'sourceDomain',
      type: 'input',
      props: {
        placeholder: '请输入来源域',
        clearable: true
      }
    },
    {
      label: '来源对象',
      key: 'sourceRef',
      type: 'input',
      props: {
        placeholder: '请输入来源对象',
        clearable: true
      }
    },
    {
      label: '最近触发',
      key: 'lastTriggeredAtRange',
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

  const handleSearch = async (params: AlertEventSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
