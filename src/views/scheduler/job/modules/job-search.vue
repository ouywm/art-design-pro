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
    set: (val) => emit('update:modelValue', val)
  })

  const formItems = computed(() => [
    {
      label: '命名空间',
      key: 'namespace',
      type: 'input',
      placeholder: '例如 xxl',
      clearable: true
    },
    {
      label: '应用',
      key: 'appName',
      type: 'input',
      placeholder: '请输入 appName',
      clearable: true
    },
    {
      label: '任务描述',
      key: 'likeDescription',
      type: 'input',
      placeholder: '模糊搜索描述',
      clearable: true
    },
    {
      label: '处理器',
      key: 'likeHandleName',
      type: 'input',
      placeholder: '模糊搜索 handleName',
      clearable: true
    }
  ])

  function handleReset() {
    emit('reset')
  }

  function handleSearch(params: SearchFormModel) {
    emit('search', params)
  }
</script>
