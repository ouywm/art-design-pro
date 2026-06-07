<template>
  <ElDialog v-model="dialogVisible" title="绑定资源" width="760px" align-center destroy-on-close>
    <div v-loading="loading" class="resource-bind-dialog">
      <div class="action-summary">
        <div>
          <span class="label">按钮名称</span>
          <strong>{{ actionTitle }}</strong>
        </div>
        <div>
          <span class="label">权限标识</span>
          <code>{{ authMark || '-' }}</code>
        </div>
      </div>

      <ElForm label-width="82px">
        <ElFormItem label="后端资源">
          <ArtDataSelect
            v-model="selectedResourceIds"
            multiple
            title="选择后端资源"
            selected-title="已绑定资源"
            placeholder="请选择该按钮依赖的后端 API 资源"
            empty-text="暂未绑定资源"
            value-key="id"
            label-key="resourceName"
            :page-size="10"
            :dialog-width="'980px'"
            :searchable="false"
            :columns="resourceColumns"
            :request="loadResourcePage"
            :filter-items="resourceFilterItems"
            :selected-records="selectedResources"
            @change="handleSelectedResourcesChange"
          />
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import ArtDataSelect from '@/components/core/forms/art-data-select/index.vue'
  import type {
    DataSelectColumn,
    DataSelectFilterItem,
    DataSelectRecord,
    DataSelectRequestParams
  } from '@/components/core/forms/art-data-select/types'
  import {
    fetchGetActionResources,
    fetchGetResourceList,
    fetchSaveActionResources
  } from '@/api/resource-permission'
  import { RESOURCE_METHOD_TAG_TYPE } from '@/views/system/resource-permission/constants'
  import { RESOURCE_METHOD_OPTIONS } from '@/views/system/resource-permission/constants'
  import { ElTag } from 'element-plus'

  interface Props {
    visible: boolean
    actionMenuId?: number
    actionTitle?: string
    authMark?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const submitLoading = ref(false)
  const selectedResourceIds = ref<number[]>([])
  const selectedResources = ref<DataSelectRecord[]>([])

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
  })

  const actionTitle = computed(() => props.actionTitle || '-')
  const authMark = computed(() => props.authMark || '')

  const resourceColumns: DataSelectColumn[] = [
    { prop: 'resourceName', label: '资源名称', minWidth: 160 },
    { prop: 'resourceCode', label: '资源编码', minWidth: 180 },
    {
      prop: 'method',
      label: '请求方式',
      width: 100,
      formatter: (row) =>
        h(
          ElTag,
          { type: RESOURCE_METHOD_TAG_TYPE[row.method as Api.ResourcePermission.ResourceMethod] },
          () => String(row.method || '-')
        )
    },
    { prop: 'path', label: '接口路径', minWidth: 240 },
    {
      prop: 'enabled',
      label: '状态',
      width: 90,
      formatter: (row) =>
        h(ElTag, { type: row.enabled ? 'success' : 'info' }, () => (row.enabled ? '启用' : '停用'))
    }
  ]

  const resourceFilterItems: DataSelectFilterItem[] = [
    {
      key: 'resourceName',
      label: '资源名称',
      placeholder: '资源名称',
      width: 150
    },
    {
      key: 'resourceCode',
      label: '资源编码',
      placeholder: '资源编码',
      width: 150
    },
    {
      key: 'method',
      label: '请求方式',
      type: 'select',
      placeholder: '请求方式',
      width: 130,
      options: RESOURCE_METHOD_OPTIONS
    },
    {
      key: 'path',
      label: '接口路径',
      placeholder: '接口路径',
      width: 180
    },
    {
      key: 'enabled',
      label: '状态',
      type: 'select',
      placeholder: '状态',
      width: 110,
      options: [
        { label: '启用', value: true },
        { label: '停用', value: false }
      ]
    }
  ]

  const toResourceRecord = (
    item: Api.ResourcePermission.Resource | Api.ResourcePermission.ResourceOption
  ): DataSelectRecord => ({
    id: item.id,
    resourceName: item.resourceName,
    resourceCode: item.resourceCode,
    method: item.method,
    path: item.path,
    enabled: item.enabled
  })

  const loadData = async () => {
    if (!props.actionMenuId) {
      selectedResourceIds.value = []
      selectedResources.value = []
      return
    }

    loading.value = true
    try {
      const binding = await fetchGetActionResources(props.actionMenuId)
      selectedResourceIds.value = binding.resources.map((item) => item.id)
      selectedResources.value = binding.resources.map(toResourceRecord)
    } finally {
      loading.value = false
    }
  }

  const loadResourcePage = async (params: DataSelectRequestParams) => {
    const result = await fetchGetResourceList({
      page: params.page,
      size: params.size,
      resourceName: params.resourceName as string | undefined,
      resourceCode: params.resourceCode as string | undefined,
      method: params.method as Api.ResourcePermission.ResourceMethod | undefined,
      path: params.path as string | undefined,
      enabled: params.enabled as boolean | undefined
    })

    return {
      ...result,
      content: result.content.map(toResourceRecord)
    }
  }

  const handleSelectedResourcesChange = (records: DataSelectRecord[]) => {
    selectedResources.value = records
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadData()
      }
    }
  )

  const handleSubmit = async () => {
    if (!props.actionMenuId) {
      ElMessage.error('按钮权限 ID 不存在')
      return
    }

    submitLoading.value = true
    try {
      await fetchSaveActionResources(props.actionMenuId, {
        resourceIds: selectedResourceIds.value
      })
      ElMessage.success('资源绑定已保存')
      dialogVisible.value = false
      emit('success')
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .resource-bind-dialog {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .action-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-card-border);
    border-radius: 6px;

    > div {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    .label {
      flex: 0 0 64px;
      color: var(--art-gray-600);
    }

    code {
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      color: var(--art-gray-800);
    }
  }

  :deep(.art-data-select) {
    width: 100%;
  }

  @media (width <= 640px) {
    .action-summary {
      grid-template-columns: 1fr;
    }
  }
</style>
