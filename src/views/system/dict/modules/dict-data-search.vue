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
  import { useDict } from '@/utils/dict'

  type DictDataSearchFormParams = Api.SystemManage.DictDataSearchFilters

  interface Props {
    modelValue: DictDataSearchFormParams
  }
  interface Emits {
    (e: 'update:modelValue', value: DictDataSearchFormParams): void
    (e: 'search', params: DictDataSearchFormParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { getDict } = useDict()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val: DictDataSearchFormParams) => emit('update:modelValue', val)
  })

  const formItems = computed(() => [
    {
      label: '字典标签',
      key: 'dictLabel',
      type: 'input',
      props: {
        placeholder: '请输入字典标签'
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: getDict('sys_status').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch(params: DictDataSearchFormParams) {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
