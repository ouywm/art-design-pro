<template>
  <div class="config-table-toolbar">
    <div class="config-table-toolbar__top">
      <ElSpace wrap>
        <ElButton type="primary" @click="$emit('add-config')" v-ripple>新增参数</ElButton>
        <ElButton :disabled="selectedCount === 0" @click="$emit('batch-delete')" v-ripple>
          批量删除
        </ElButton>
        <ElButton plain @click="$emit('refresh-cache')" v-ripple>刷新缓存</ElButton>
      </ElSpace>

      <ElTag type="info">当前页 {{ pageCount }} 条</ElTag>
    </div>

    <ArtTableHeader
      v-model:columns="columnsModel"
      layout="refresh,size,fullscreen,columns,settings"
      :loading="loading"
      @refresh="$emit('refresh')"
    >
      <template #left>
        <div class="config-table-toolbar__groups">
          <ElTag
            class="config-table-toolbar__group"
            :effect="activeGroupId == null ? 'dark' : 'plain'"
            type="primary"
            @click="$emit('group-change', undefined)"
          >
            全部分组
          </ElTag>
          <ElTag
            v-for="group in groups"
            :key="group.groupId"
            class="config-table-toolbar__group"
            :effect="activeGroupId === group.groupId ? 'dark' : 'plain'"
            type="primary"
            @click="$emit('group-change', group.groupId)"
          >
            {{ group.groupName }} ({{ group.items.length }})
          </ElTag>
        </div>
      </template>

      <template #right>
        <button class="config-table-toolbar__focus" type="button" aria-label="专注模式">
          <ArtSvgIcon icon="ri:settings-5-line" />
          <span>专注模式</span>
        </button>
      </template>
    </ArtTableHeader>
  </div>
</template>

<script setup lang="ts">
  import type { ColumnOption } from '@/types/component'
  import type { ConfigGroupSection } from '../types'

  interface Props {
    groups: ConfigGroupSection[]
    activeGroupId?: number
    pageCount: number
    selectedCount: number
    loading?: boolean
  }

  interface Emits {
    (e: 'add-config'): void
    (e: 'batch-delete'): void
    (e: 'refresh-cache'): void
    (e: 'refresh'): void
    (e: 'group-change', value?: number): void
  }

  withDefaults(defineProps<Props>(), {
    activeGroupId: undefined,
    loading: false
  })

  defineEmits<Emits>()

  const columnsModel = defineModel<ColumnOption[]>('columns', {
    required: false,
    default: () => []
  })
</script>

<style scoped lang="scss">
  .config-table-toolbar {
    border-bottom: 1px solid var(--default-border);
  }

  .config-table-toolbar__top {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--default-border);
  }

  :deep(#art-table-header) {
    padding: 16px 16px 0;
  }

  .config-table-toolbar__groups {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .config-table-toolbar__group {
    cursor: pointer;
  }

  .config-table-toolbar__focus {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 12px;
    margin-left: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--art-gray-700);
    cursor: pointer;
    background: var(--art-gray-200);
    border: 0;
    border-radius: 6px;
    transition: background-color 0.2s ease;
  }

  .config-table-toolbar__focus:hover {
    background: var(--art-gray-300);
  }
</style>
