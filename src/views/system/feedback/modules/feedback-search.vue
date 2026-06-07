<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :show-expand="false"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { FeedbackSearchForm } from '../types'
  import { FEEDBACK_STATUS_OPTIONS, FEEDBACK_TYPE_OPTIONS } from '../mock'

  defineOptions({ name: 'FeedbackSearch' })

  interface Props {
    modelValue: FeedbackSearchForm
  }

  interface Emits {
    (e: 'update:modelValue', value: FeedbackSearchForm): void
    (e: 'search', params: FeedbackSearchForm): void
    (e: 'reset'): void
  }

  interface SearchBarInstance {
    validate: () => Promise<unknown> | unknown
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<SearchBarInstance | null>(null)

  const formData = computed({
    get: () => props.modelValue,
    set: (value: FeedbackSearchForm) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      span: 6,
      props: {
        placeholder: '编号 / 标题 / 描述 / 联系方式 / 页面路径',
        clearable: true
      }
    },
    {
      label: '反馈类型',
      key: 'type',
      type: 'select',
      span: 6,
      props: {
        placeholder: '请选择',
        options: FEEDBACK_TYPE_OPTIONS,
        clearable: true
      }
    },
    {
      label: '处理状态',
      key: 'status',
      type: 'select',
      span: 6,
      props: {
        placeholder: '请选择',
        options: FEEDBACK_STATUS_OPTIONS,
        clearable: true
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: FeedbackSearchForm) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
