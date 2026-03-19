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
  import type { UserNoticeSearchFormModel } from '../types'

  interface Props {
    modelValue: UserNoticeSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: UserNoticeSearchFormModel): void
    (e: 'search', params: UserNoticeSearchFormModel): void
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
    set: (value: UserNoticeSearchFormModel) => emit('update:modelValue', value)
  })

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
        clearable: true,
        options: getDict('notice_level').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    },
    {
      label: '阅读状态',
      key: 'readFlag',
      type: 'select',
      props: {
        placeholder: '请选择阅读状态',
        clearable: true,
        options: [
          { label: '已读', value: true },
          { label: '未读', value: false }
        ]
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: UserNoticeSearchFormModel) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
