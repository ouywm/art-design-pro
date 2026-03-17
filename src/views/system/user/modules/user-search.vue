<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'

  type UserSearchFormParams = Api.SystemManage.UserSearchFilters

  interface Props {
    modelValue: UserSearchFormParams
  }
  interface Emits {
    (e: 'update:modelValue', value: UserSearchFormParams): void
    (e: 'search', params: UserSearchFormParams): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 字典工具
  const { getDict } = useDict()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
  }

  // 表单配置
  const formItems = computed(() => [
    {
      label: '用户名',
      key: 'userName',
      type: 'input',
      placeholder: '请输入用户名',
      clearable: true
    },
    {
      label: '手机号',
      key: 'phone',
      type: 'input',
      props: { placeholder: '请输入手机号', maxlength: '11' }
    },
    {
      label: '邮箱',
      key: 'email',
      type: 'input',
      props: { placeholder: '请输入邮箱' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        options: getDict('user_status').map((item) => ({
          label: item.label,
          value: Number(item.value)
        }))
      }
    },
    {
      label: '性别',
      key: 'gender',
      type: 'radiogroup',
      props: {
        options: [
          { label: '男', value: 1 },
          { label: '女', value: 2 }
        ]
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch(params: UserSearchFormParams) {
    await searchBarRef.value.validate()
    emit('search', params)
    console.log('表单数据', params)
  }
</script>
