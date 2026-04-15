<template>
  <ArtSearchBar
    v-model="modelValue"
    :items="searchItems"
    :span="5"
    :label-width="0"
    :show-expand="false"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup lang="ts">
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/types'
  import type { FileSearchFormModel } from '../types'

  defineOptions({ name: 'FileManageSearch' })

  const modelValue = defineModel<FileSearchFormModel>({ default: () => ({}) })

  const emit = defineEmits<{
    (e: 'search', params: FileSearchFormModel): void
    (e: 'reset'): void
  }>()

  const KIND_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileKind }> = [
    { label: '图片', value: 'IMAGE' },
    { label: '视频', value: 'VIDEO' },
    { label: '音频', value: 'AUDIO' },
    { label: '文件', value: 'FILE' }
  ]

  const VISIBILITY_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileVisibility }> = [
    { label: '公开', value: 'PUBLIC' },
    { label: '私有', value: 'PRIVATE' }
  ]

  const PROVIDER_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileProvider }> = [
    { label: 'S3', value: 'S3' },
    { label: 'OSS', value: 'OSS' },
    { label: 'COS', value: 'COS' },
    { label: 'LOCAL', value: 'LOCAL' }
  ]

  const STATUS_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileStatus }> = [
    { label: '正常', value: 'NORMAL' },
    { label: '禁用', value: 'DISABLED' },
    { label: '删除', value: 'DELETED' }
  ]

  const searchItems: SearchFormItem[] = [
    {
      label: '',
      key: 'keyword',
      type: 'input',
      placeholder: '搜索文件名、显示名、对象 Key',
      span: 7,
      props: { clearable: true }
    },
    {
      label: '',
      key: 'kind',
      type: 'select',
      placeholder: '文件类型',
      span: 3,
      props: { clearable: true, options: KIND_OPTIONS }
    },
    {
      label: '',
      key: 'visibility',
      type: 'select',
      placeholder: '可见性',
      span: 3,
      props: { clearable: true, options: VISIBILITY_OPTIONS }
    },
    {
      label: '',
      key: 'provider',
      type: 'select',
      placeholder: '云厂商',
      span: 3,
      props: { clearable: true, options: PROVIDER_OPTIONS }
    },
    {
      label: '',
      key: 'status',
      type: 'select',
      placeholder: '状态',
      span: 3,
      props: { clearable: true, options: STATUS_OPTIONS }
    }
  ]

  function handleSearch(params: FileSearchFormModel) {
    emit('search', params)
  }

  function handleReset() {
    emit('reset')
  }
</script>
