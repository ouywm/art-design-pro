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
  import { SCHEDULE_TYPE_OPTIONS, ENABLED_OPTIONS } from '../../constants'
  import type { HandlerOption, SearchFormModel } from '../types'

  interface Props {
    modelValue: SearchFormModel
    handlerOptions: HandlerOption[]
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
      label: '名称',
      key: 'name',
      type: 'input',
      placeholder: '请输入任务名',
      clearable: true
    },
    {
      label: '分组',
      key: 'groupName',
      type: 'input',
      placeholder: '请输入分组名',
      clearable: true
    },
    {
      label: 'Handler',
      key: 'handler',
      type: 'select',
      props: {
        placeholder: '请选择 handler',
        clearable: true,
        filterable: true,
        options: props.handlerOptions
      }
    },
    {
      label: '调度类型',
      key: 'scheduleType',
      type: 'select',
      props: {
        placeholder: '请选择调度类型',
        clearable: true,
        options: SCHEDULE_TYPE_OPTIONS
      }
    },
    {
      label: '状态',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: ENABLED_OPTIONS
      }
    },
    {
      label: '租户 ID',
      key: 'tenantId',
      type: 'input',
      placeholder: '可选',
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
