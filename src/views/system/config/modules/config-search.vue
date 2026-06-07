<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :span="8"
    label-width="70px"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/types'
  import type { SearchFormModel } from '../types'

  interface SearchBarInstance {
    validate?: () => Promise<void>
  }

  interface Props {
    modelValue: SearchFormModel
    groupOptions: Api.ConfigGroup.ConfigGroupVo[]
    dictTypeOptions: Api.SystemManage.DictTypeVo[]
  }

  interface Emits {
    (e: 'update:modelValue', value: SearchFormModel): void
    (e: 'search', params: SearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { getDict } = useDict()
  const searchBarRef = ref<SearchBarInstance>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value: SearchFormModel) => emit('update:modelValue', value)
  })

  const formItems = computed<SearchFormItem[]>(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      props: {
        placeholder: '请输入参数名称、键名或备注',
        clearable: true
      }
    },
    {
      label: '分组',
      key: 'configGroupId',
      type: 'select',
      props: {
        placeholder: props.groupOptions.length > 0 ? '请选择分组' : '暂无分组',
        clearable: true,
        filterable: true,
        options: props.groupOptions.map((item) => ({
          label: item.groupName,
          value: item.id
        }))
      }
    },
    {
      label: '参数类型',
      key: 'valueType',
      type: 'select',
      props: {
        placeholder: '请选择参数类型',
        clearable: true,
        options: getDict('config_value_type').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
