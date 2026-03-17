<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
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

  const { getDict } = useDict()

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: SearchFormModel) => emit('update:modelValue', value)
  })

  const rules = {}

  const formItems = computed(() => [
    {
      label: '联系人性别',
      key: 'contactGender',
      type: 'radiogroup',
      props: {
        options: getDict('showcase_gender').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: getDict('showcase_status').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    },
    {
      label: '推荐',
      key: 'featured',
      type: 'select',
      props: {
        placeholder: '请选择推荐',
        clearable: true,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
      }
    },
    {
      label: '创建时间',
      key: 'createdAtRange',
      type: 'datetimerange',
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        clearable: true
      }
    },
    {
      label: '上线时间',
      key: 'launchAtRange',
      type: 'datetimerange',
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        clearable: true
      }
    },
    {
      label: '发布日期',
      key: 'publishDateRange',
      type: 'daterange',
      props: {
        style: { width: '100%' },
        type: 'daterange',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
        clearable: true
      }
    },
    {
      label: '更新时间',
      key: 'updatedAtRange',
      type: 'datetimerange',
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        clearable: true
      }
    },
    {
      label: '联系邮箱',
      key: 'contactEmail',
      type: 'input',
      props: {
        placeholder: '请输入联系邮箱',
        clearable: true
      }
    },
    {
      label: '联系人',
      key: 'contactName',
      type: 'input',
      props: {
        placeholder: '请输入联系人',
        clearable: true
      }
    },
    {
      label: '联系电话',
      key: 'contactPhone',
      type: 'input',
      props: {
        placeholder: '请输入联系电话',
        clearable: true
      }
    },
    {
      label: '展示编码',
      key: 'showcaseCode',
      type: 'input',
      props: {
        placeholder: '请输入展示编码',
        clearable: true
      }
    },
    {
      label: '标题',
      key: 'title',
      type: 'input',
      props: {
        placeholder: '请输入标题',
        clearable: true
      }
    },
    {
      label: '官网链接',
      key: 'officialUrl',
      type: 'input',
      props: {
        placeholder: '请输入官网链接',
        clearable: true
      }
    },
    {
      label: '优先级',
      key: 'priority',
      type: 'number',
      props: {
        style: { width: '100%' },
        placeholder: '请输入优先级'
      }
    },
    {
      label: '评分',
      key: 'score',
      type: 'input',
      props: {
        placeholder: '请输入评分',
        clearable: true
      }
    },
    {
      label: '服务时间',
      key: 'serviceTime',
      type: 'timepicker',
      props: {
        style: { width: '100%' },
        placeholder: '请选择服务时间',
        valueFormat: 'HH:mm:ss',
        clearable: true
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async () => {
    await searchBarRef.value?.validate?.()
    emit('search', formData.value)
  }
</script>
