# 最小模板示例

这份文件不是完整教程，只提供“项目内推荐写法”的最小骨架。真正开发时，优先复制结构，再按具体业务字段补全。

## 1. 标准列表页示例

适用场景：

- 搜索 + 表格 + 新增/编辑弹窗
- 需要分页、删除、刷新

```vue
<template>
  <div class="feature-page art-full-height">
    <FeatureSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="openDialog('add')" v-ripple>新增</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <FeatureDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :feature-data="currentRow"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetFeatureList, fetchDeleteFeature } from '@/api/feature'
  import FeatureSearch from './modules/feature-search.vue'
  import FeatureDialog from './modules/feature-dialog.vue'

  type FeatureListItem = Api.Feature.FeatureVo
  type FeatureSearchFilters = Api.Feature.FeatureSearchFilters

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRow = ref<Partial<FeatureListItem>>({})

  const searchForm = ref<FeatureSearchFilters>({
    name: undefined,
    status: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetFeatureList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '名称' },
        {
          prop: 'operation',
          label: '操作',
          formatter: (row) =>
            h(ArtButtonMore, {
              list: [
                { key: 'edit', label: '编辑', icon: 'ri:edit-2-line' },
                { key: 'delete', label: '删除', icon: 'ri:delete-bin-4-line', color: '#f56c6c' }
              ],
              onClick: (item) => handleMoreClick(item, row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: FeatureSearchFilters) => {
    Object.assign(searchParams, params)
    getData()
  }

  const openDialog = (type: 'add' | 'edit', row?: FeatureListItem) => {
    dialogType.value = type
    currentRow.value = row || {}
    dialogVisible.value = true
  }

  const handleDelete = (row: FeatureListItem) => {
    ElMessageBox.confirm('确定删除该记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteFeature(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }

  const handleMoreClick = (item: { key: 'edit' | 'delete' }, row: FeatureListItem) => {
    if (item.key === 'edit') {
      openDialog('edit', row)
      return
    }
    handleDelete(row)
  }

  const handleDialogSubmit = (type: 'add' | 'edit') => {
    if (type === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }
</script>
```

## 2. 标准搜索模块示例

适用场景：

- 标准后台筛选栏
- 输入框、下拉框、日期范围、字典筛选

```vue
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
  type FeatureSearchFormModel = Api.Feature.FeatureSearchFilters

  interface Props {
    modelValue: FeatureSearchFormModel
  }

  interface Emits {
    (e: 'update:modelValue', value: FeatureSearchFormModel): void
    (e: 'search', params: FeatureSearchFormModel): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const searchBarRef = ref<{ validate?: () => Promise<void> }>()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '名称',
      key: 'name',
      type: 'input',
      props: { placeholder: '请输入名称', clearable: true }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '启用', value: true },
          { label: '停用', value: false }
        ]
      }
    }
  ])

  const handleReset = () => emit('reset')

  const handleSearch = async (params: FeatureSearchFormModel) => {
    await searchBarRef.value?.validate?.()
    emit('search', params)
  }
</script>
```

## 3. 标准弹窗 / 抽屉表单示例

简单表单优先 `ElDialog`，复杂表单优先 `ElDrawer`。两者共同点是：

- 父页面控制显隐
- 子组件只负责加载、校验、提交
- 成功后抛 `submit` 或 `success`

```vue
<template>
  <ElDialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'">
    <ElForm ref="formRef" :model="formData" :rules="rules" v-loading="detailLoading">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入名称" />
      </ElFormItem>
      <ElFormItem label="状态" prop="enabled">
        <ElSwitch v-model="formData.enabled" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'
  import { fetchCreateFeature, fetchUpdateFeature, fetchGetFeatureDetail } from '@/api/feature'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    featureData?: Partial<Api.Feature.FeatureVo>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: 'add' | 'edit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)
  const rules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }

  const formData = reactive({
    name: '',
    enabled: true
  })

  watch(
    () => [props.visible, props.type, props.featureData],
    async ([visible]) => {
      if (!visible) return

      if (props.type === 'edit' && props.featureData?.id) {
        detailLoading.value = true
        try {
          const detail = await fetchGetFeatureDetail(props.featureData.id)
          Object.assign(formData, detail)
        } finally {
          detailLoading.value = false
        }
      } else {
        Object.assign(formData, { name: '', enabled: true })
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()

    submitLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await fetchCreateFeature(formData)
      } else if (props.featureData?.id) {
        await fetchUpdateFeature(props.featureData.id, formData)
      }

      emit('submit', dialogType.value)
      dialogVisible.value = false
    } finally {
      submitLoading.value = false
    }
  }
</script>
```

## 4. 标准删除 / 刷新事件流示例

最常见的 4 个动作：

```ts
const handleSearch = (params: FeatureSearchFilters) => {
  Object.assign(searchParams, params)
  getData()
}

const handleDialogSubmit = (type: 'add' | 'edit') => {
  if (type === 'add') {
    refreshCreate()
  } else {
    refreshUpdate()
  }
}

const handleDelete = (row: FeatureListItem) => {
  ElMessageBox.confirm('确定删除该记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await fetchDeleteFeature(row.id)
    ElMessage.success('删除成功')
    refreshRemove()
  })
}

const handleRefresh = () => {
  refreshData()
}
```

## 使用边界

- 这里只放骨架，不放完整业务代码。
- 如果某个页面明显偏离这个骨架，先回头看：
  - [workflow.md](./workflow.md)
  - [page-patterns.md](./page-patterns.md)
  - [component-selection.md](./component-selection.md)
