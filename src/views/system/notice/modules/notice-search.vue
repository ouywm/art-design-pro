<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
  import type { NoticeSearchFormModel } from '../types'

  interface Props {
    modelValue: NoticeSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: NoticeSearchFormModel): void
    (e: 'search', params: NoticeSearchFormModel): void
    (e: 'reset'): void
  }

  interface SearchBarInstance {
    validate: () => Promise<unknown> | unknown
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { getDict } = useDict()

  const searchBarRef = ref<SearchBarInstance | null>(null)

  const formData = computed({
    get: () => props.modelValue,
    set: (value: NoticeSearchFormModel) => emit('update:modelValue', value)
  })

  const booleanSelectOptions = [
    { label: '是', value: true },
    { label: '否', value: false }
  ]

  const dateTimeShortcuts = [
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

  const formItems = computed(() => [
    {
      label: '公告标题',
      key: 'noticeTitle',
      type: 'input',
      placeholder: '请输入公告标题',
      clearable: true
    },
    {
      label: '公告级别',
      key: 'noticeLevel',
      type: 'select',
      props: {
        placeholder: '请选择公告级别',
        options: getDict('notice_level').map((item) => ({
          label: item.label,
          value: Number(item.value)
        })),
        clearable: true
      }
    },
    {
      label: '公告范围',
      key: 'noticeScope',
      type: 'select',
      props: {
        placeholder: '请选择公告范围',
        options: getDict('notice_scope').map((item) => ({
          label: item.label,
          value: Number(item.value)
        })),
        clearable: true
      }
    },
    {
      label: '发布状态',
      key: 'publishStatus',
      type: 'select',
      props: {
        placeholder: '请选择发布状态',
        options: getDict('notice_publish_status').map((item) => ({
          label: item.label,
          value: Number(item.value)
        })),
        clearable: true
      }
    },
    {
      label: '是否置顶',
      key: 'pinned',
      type: 'select',
      props: {
        placeholder: '请选择是否置顶',
        options: booleanSelectOptions,
        clearable: true
      }
    },
    {
      label: '是否启用',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择是否启用',
        options: booleanSelectOptions,
        clearable: true
      }
    },
    {
      label: '发布时间',
      key: 'publishTimeRange',
      type: 'datetime',
      span: 12,
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        shortcuts: dateTimeShortcuts
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
        shortcuts: dateTimeShortcuts
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: NoticeSearchFormModel) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
