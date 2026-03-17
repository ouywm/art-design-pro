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
      label: '配置名称',
      key: 'configName',
      type: 'input',
      props: {
        placeholder: '请输入配置名称',
        clearable: true
      }
    },
    {
      label: '配置键',
      key: 'configKey',
      type: 'input',
      props: {
        placeholder: '请输入配置键',
        clearable: true
      }
    },
    {
      label: '配置分组编码',
      key: 'configGroup',
      type: 'input',
      props: {
        placeholder: '请输入配置分组编码',
        clearable: true
      }
    },
    {
      label: '值类型',
      key: 'valueType',
      type: 'select',
      props: {
        placeholder: '请选择值类型',
        clearable: true,
        options: getDict('config_value_type').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    },
    {
      label: '是否启用',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择是否启用',
        clearable: true,
        options: [
          { label: '是', value: true },
          { label: '否', value: false }
        ]
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
