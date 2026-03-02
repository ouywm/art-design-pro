<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 表单配置（个人登录日志不需要用户名搜索）
  const formItems = computed(() => [
    {
      label: '登录状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择登录状态',
        options: [
          { label: '成功', value: 1 },
          { label: '失败', value: 2 }
        ]
      }
    },
    {
      label: '登录时间',
      key: 'loginTimeRange',
      type: 'datetime',
      span: 8,
      props: {
        style: { width: '100%' },
        type: 'datetimerange',
        rangeSeparator: '至',
        startPlaceholder: '开始时间',
        endPlaceholder: '结束时间',
        valueFormat: 'YYYY-MM-DDTHH:mm:ss',
        shortcuts: [
          {
            text: '今日',
            value: () => {
              const start = new Date()
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              return [start, end]
            }
          },
          {
            text: '近三天',
            value: () => {
              const start = new Date(Date.now() - 3 * 86400000)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              return [start, end]
            }
          },
          {
            text: '最近一周',
            value: () => {
              const start = new Date(Date.now() - 7 * 86400000)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              return [start, end]
            }
          },
          {
            text: '最近一个月',
            value: () => {
              const start = new Date(Date.now() - 30 * 86400000)
              start.setHours(0, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 59, 59, 999)
              return [start, end]
            }
          }
        ]
      }
    }
  ])

  // 事件
  function handleReset() {
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
  }
</script>
