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
  import { TOKEN_STATUS_OPTIONS } from '../constants'
  import type { SearchFormModel, UserOption } from '../types'

  interface Props {
    modelValue: SearchFormModel
    userOptions: UserOption[]
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
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '关键词',
      key: 'keyword',
      type: 'input',
      placeholder: '名称 / Key 前缀 / 备注'
    },
    {
      label: '所属用户',
      key: 'userId',
      type: 'select',
      props: {
        placeholder: '全部用户',
        options: props.userOptions.map((item) => ({
          label: item.label,
          value: item.value
        })),
        filterable: true,
        clearable: true
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '全部状态',
        options: TOKEN_STATUS_OPTIONS,
        clearable: true
      }
    },
    {
      label: 'Key 前缀',
      key: 'keyPrefix',
      type: 'input',
      placeholder: '如 sk-abc'
    },
    {
      label: '分组覆盖',
      key: 'groupCodeOverride',
      type: 'input',
      placeholder: '如 default'
    },
    {
      label: '服务账号 ID',
      key: 'serviceAccountId',
      type: 'number',
      placeholder: '精确匹配'
    },
    {
      label: '项目 ID',
      key: 'projectId',
      type: 'number',
      placeholder: '精确匹配'
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: SearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
