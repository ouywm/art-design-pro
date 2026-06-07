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
      label: '任务 ID',
      key: 'jobId',
      type: 'number',
      props: {
        placeholder: '请输入任务 ID',
        controlsPosition: 'right',
        min: 1,
        style: { width: '100%' }
      }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  function handleSearch(params: SearchFormModel) {
    emit('search', params)
  }
</script>
