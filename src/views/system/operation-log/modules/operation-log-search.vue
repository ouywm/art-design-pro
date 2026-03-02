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

  // 表单配置
  const formItems = computed(() => [
    {
      label: '用户名',
      key: 'userName',
      type: 'input',
      props: { placeholder: '请输入用户名' }
    },
    {
      label: '操作模块',
      key: 'module',
      type: 'input',
      props: { placeholder: '请输入操作模块' }
    },
    {
      label: '业务类型',
      key: 'businessType',
      type: 'select',
      props: {
        placeholder: '请选择业务类型',
        options: [
          { label: '其他', value: 0 },
          { label: '新增', value: 1 },
          { label: '修改', value: 2 },
          { label: '删除', value: 3 },
          { label: '查询', value: 4 },
          { label: '导出', value: 5 },
          { label: '导入', value: 6 },
          { label: '认证', value: 7 }
        ]
      }
    },
    {
      label: '操作状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择操作状态',
        options: [
          { label: '成功', value: 1 },
          { label: '失败', value: 2 },
          { label: '异常', value: 3 }
        ]
      }
    },
    {
      label: '请求方式',
      key: 'requestMethod',
      type: 'select',
      props: {
        placeholder: '请选择请求方式',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ]
      }
    },
    {
      label: '请求路径',
      key: 'requestUrl',
      type: 'input',
      props: { placeholder: '请输入请求路径' }
    },
    {
      label: '客户端IP',
      key: 'clientIp',
      type: 'input',
      props: { placeholder: '请输入客户端IP' }
    },
    {
      label: '响应状态码',
      labelWidth: '85px',
      key: 'responseCode',
      type: 'number',
      props: { placeholder: '请输入状态码', controls: false }
    },
    {
      label: '操作时间',
      key: 'operationTimeRange',
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
