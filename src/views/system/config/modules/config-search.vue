<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :span="8"
    label-width="82px"
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
      label: '配置分组',
      key: 'configGroupId',
      type: 'select',
      props: {
        placeholder: props.groupOptions.length > 0 ? '请选择配置分组' : '暂无配置分组',
        clearable: true,
        filterable: true,
        options: props.groupOptions.map((item) => ({
          label: `${item.groupName} (${item.groupCode})`,
          value: item.id
        }))
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
      label: '候选字典',
      key: 'optionDictType',
      type: 'select',
      props: {
        placeholder: props.dictTypeOptions.length > 0 ? '请选择候选字典' : '暂无字典类型',
        clearable: true,
        filterable: true,
        options: props.dictTypeOptions.map((item) => ({
          label: `${item.dictName} (${item.dictType})`,
          value: item.dictType
        }))
      }
    },
    {
      label: '是否启用',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '停用', value: false }
        ]
      }
    },
    {
      label: '系统内置',
      key: 'isSystem',
      type: 'select',
      props: {
        placeholder: '请选择内置类型',
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

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
