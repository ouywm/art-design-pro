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
  import { RUN_STATE_OPTIONS, TRIGGER_TYPE_OPTIONS } from '../../constants'
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
        placeholder: '可选',
        controlsPosition: 'right',
        min: 1,
        style: { width: '100%' }
      }
    },
    {
      label: 'Trace ID',
      key: 'traceId',
      type: 'input',
      placeholder: '链路追踪 ID',
      clearable: true
    },
    {
      label: '状态',
      key: 'state',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: RUN_STATE_OPTIONS
      }
    },
    {
      label: '触发来源',
      key: 'triggerType',
      type: 'select',
      props: {
        placeholder: '请选择触发来源',
        clearable: true,
        options: TRIGGER_TYPE_OPTIONS
      }
    },
    {
      label: '调度时间',
      key: 'dateRange',
      type: 'datetimerange',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        clearable: true,
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
