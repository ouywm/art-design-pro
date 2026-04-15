<template>
  <div
    class="flex h-full min-h-[640px] flex-col rounded-custom-sm border border-[var(--default-border)] bg-box"
  >
    <div class="border-b-d px-5 py-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-g-900">目录管理</div>
          <div class="mt-1 text-sm text-g-600">目录只负责业务归类，不直接映射对象存储路径。</div>
        </div>
        <ElButton size="small" text @click="emit('refresh')">刷新</ElButton>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <div
          class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--default-bg-color)] px-3 py-3"
        >
          <div class="text-xs uppercase tracking-[0.16em] text-g-500">目录数</div>
          <div class="mt-2 text-xl font-semibold text-g-900">{{ folderCount }}</div>
        </div>
        <div
          class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--default-bg-color)] px-3 py-3"
        >
          <div class="text-xs uppercase tracking-[0.16em] text-g-500">当前目录</div>
          <div class="mt-2 truncate text-sm font-semibold text-g-900" :title="currentFolderName">
            {{ currentFolderName }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex min-h-0 flex-1 flex-col p-3" v-loading="loading">
      <!-- Root -->
      <button
        class="flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left transition-colors"
        :class="
          selectedFolderId == null
            ? 'bg-[color:color-mix(in_oklch,var(--color-primary)_12%,var(--color-box))] text-g-900'
            : 'hover:bg-[var(--default-bg-color)] text-g-900'
        "
        @click="selectRoot"
      >
        <span class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:folder-3-line" class="text-base" />
          <span class="text-sm font-semibold">全部文件</span>
        </span>
        <span class="text-xs text-g-500">{{ totalFileCount }}</span>
      </button>

      <!-- Tree -->
      <div class="mt-3 min-h-0 flex-1 overflow-auto pr-1">
        <ElTree
          :data="treeData"
          node-key="id"
          :indent="18"
          :current-node-key="currentNodeKey"
          :props="{ label: 'name', children: 'children' }"
          highlight-current
          :expand-on-click-node="false"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="group flex min-w-0 flex-1 items-center justify-between gap-2 py-1.5">
              <div class="flex min-w-0 items-center gap-2">
                <ArtSvgIcon icon="ri:folder-3-line" class="text-g-600" />
                <span class="truncate text-sm text-g-800" :title="data.name">{{ data.name }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-xs text-g-500">{{ getNodeCount(data) }}</span>

                <ElDropdown trigger="click" @command="(cmd) => handleCommand(cmd as any, data)">
                  <button
                    class="flex size-7 cursor-pointer items-center justify-center rounded-full text-g-500 transition-colors hover:text-g-900"
                    type="button"
                    @click.stop
                  >
                    <ArtSvgIcon icon="ri:more-2-fill" />
                  </button>

                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="createChild">新建子目录</ElDropdownItem>
                      <ElDropdownItem command="edit">编辑目录</ElDropdownItem>
                      <ElDropdownItem command="delete" divided class="text-danger"
                        >删除目录</ElDropdownItem
                      >
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
            </div>
          </template>
        </ElTree>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import type { FileFolderTreeNode } from '../types'

  defineOptions({ name: 'FileFolderTree' })

  interface Props {
    treeData: FileFolderTreeNode[]
    loading?: boolean
    folderCount: number
    currentFolderName: string
    totalFileCount: number
  }

  withDefaults(defineProps<Props>(), {
    treeData: () => [],
    loading: false,
    totalFileCount: 0
  })

  const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'create-child', node: FileFolderTreeNode): void
    (e: 'edit', node: FileFolderTreeNode): void
    (e: 'delete', node: FileFolderTreeNode): void
  }>()

  const selectedFolderId = defineModel<number | null>({ default: null })
  const currentNodeKey = computed(() => selectedFolderId.value ?? undefined)

  function getNodeCount(node: FileFolderTreeNode): number {
    return node.fileCount
  }

  function selectRoot() {
    selectedFolderId.value = null
  }

  function handleNodeClick(data: FileFolderTreeNode) {
    selectedFolderId.value = data.id
  }

  type FolderCommand = 'createChild' | 'edit' | 'delete'
  function handleCommand(cmd: FolderCommand, node: FileFolderTreeNode) {
    if (cmd === 'createChild') emit('create-child', node)
    if (cmd === 'edit') emit('edit', node)
    if (cmd === 'delete') emit('delete', node)
  }
</script>
