<template>
  <ElDialog
    v-model="dialogVisible"
    title="资源关联按钮"
    width="620px"
    align-center
    destroy-on-close
  >
    <div v-loading="loading" class="resource-action-dialog">
      <div class="resource-summary">
        <div>
          <span class="label">资源名称</span>
          <strong>{{ detail?.resourceName || '-' }}</strong>
        </div>
        <div>
          <span class="label">资源编码</span>
          <code>{{ detail?.resourceCode || '-' }}</code>
        </div>
        <div>
          <span class="label">接口路径</span>
          <ElTag v-if="detail" :type="RESOURCE_METHOD_TAG_TYPE[detail.method]" size="small">
            {{ detail.method }}
          </ElTag>
          <code>{{ detail?.path || '-' }}</code>
        </div>
      </div>

      <ElTable :data="detail?.actions || []" border>
        <ElTableColumn prop="title" label="按钮名称" min-width="160" />
        <ElTableColumn prop="authMark" label="权限标识" min-width="220" />
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElTag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '停用' }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetResourceActions } from '@/api/resource-permission'
  import { RESOURCE_METHOD_TAG_TYPE } from '../constants'
  import type { ResourceListItem } from '../types'

  interface Props {
    visible: boolean
    row?: Partial<ResourceListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const loading = ref(false)
  const detail = ref<Api.ResourcePermission.ResourceAction>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
  })

  const loadDetail = async () => {
    if (!props.row?.id) {
      detail.value = undefined
      return
    }

    loading.value = true
    try {
      detail.value = await fetchGetResourceActions(Number(props.row.id))
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadDetail()
      }
    }
  )
</script>

<style scoped lang="scss">
  .resource-action-dialog {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .resource-summary {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
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
      word-break: break-all;
    }
  }
</style>
