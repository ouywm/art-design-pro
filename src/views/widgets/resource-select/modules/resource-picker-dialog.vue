<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="960px"
    align-center
    destroy-on-close
    class="resource-picker-dialog"
  >
    <div class="resource-picker">
      <aside class="resource-picker__folders">
        <div class="resource-picker__folders-head">
          <strong>资源目录</strong>
          <ElButton link type="primary" @click="handleCreateFolder">新建</ElButton>
        </div>

        <button
          type="button"
          class="resource-picker__folder"
          :class="{ 'is-active': activeFolderId === 0 }"
          @click="activeFolderId = 0"
        >
          <span>
            <ArtSvgIcon icon="ri:folder-3-line" />
            全部资源
          </span>
          <em>{{ allowedResources.length }}</em>
        </button>

        <button
          v-for="folder in resourceFolders"
          :key="folder.id"
          type="button"
          class="resource-picker__folder"
          :class="{ 'is-active': activeFolderId === folder.id }"
          @click="activeFolderId = folder.id"
        >
          <span>
            <ArtSvgIcon icon="ri:folder-3-line" />
            {{ folder.name }}
          </span>
          <em>{{ getFolderCount(folder.id) }}</em>
        </button>
      </aside>

      <section class="resource-picker__main">
        <div class="resource-picker__toolbar">
          <ElInput
            v-model="keyword"
            class="resource-picker__search"
            clearable
            placeholder="搜索资源名称、描述"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </ElInput>

          <ElSelect
            v-model="activeKind"
            class="resource-picker__kind"
            clearable
            placeholder="资源类型"
          >
            <ElOption
              v-for="option in allowedKindOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>

          <ElButton plain @click="handleMockUpload">
            <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
            上传
          </ElButton>
        </div>

        <div class="resource-picker__meta">
          <span>已选 {{ localSelected.length }}{{ multiple ? `/${max}` : '' }}</span>
          <span>{{ activeFolderName }}</span>
        </div>

        <div v-if="pagedResources.length > 0" class="resource-picker__grid">
          <button
            v-for="item in pagedResources"
            :key="item.id"
            type="button"
            class="resource-picker__item"
            :class="{ 'is-selected': isSelected(item) }"
            @click="toggleResource(item)"
          >
            <div
              class="resource-picker__thumb"
              :class="{ 'is-visual': hasThumbImage(item) }"
              :style="getThumbStyle(item)"
            >
              <ArtSvgIcon v-if="shouldShowThumbIcon(item)" :icon="getResourceIcon(item)" />
            </div>
            <div class="resource-picker__item-body">
              <strong>{{ item.name }}</strong>
              <span>{{ item.folderName }} · {{ item.size }}</span>
            </div>
            <i v-if="isSelected(item)" class="resource-picker__check">
              <ArtSvgIcon icon="ri:check-line" />
            </i>
          </button>
        </div>
        <ElEmpty v-else description="暂无匹配资源" />

        <div class="resource-picker__pagination">
          <ElPagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[6, 9, 12]"
            :total="filteredResources.length"
            layout="total, sizes, prev, pager, next"
            small
          />
        </div>
      </section>

      <aside class="resource-picker__selected">
        <div class="resource-picker__selected-head">
          <strong>已选资源</strong>
          <ElButton v-if="localSelected.length > 0" link type="primary" @click="clearSelected">
            清空
          </ElButton>
        </div>

        <ElScrollbar class="resource-picker__selected-list">
          <div v-if="localSelected.length === 0" class="resource-picker__empty">暂无选择</div>
          <div v-for="item in localSelected" :key="item.id" class="resource-picker__selected-item">
            <div
              class="resource-picker__selected-icon"
              :class="{ 'is-visual': hasThumbImage(item) }"
              :style="getThumbStyle(item)"
            >
              <ArtSvgIcon v-if="shouldShowThumbIcon(item)" :icon="getResourceIcon(item)" />
            </div>
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.extension.toUpperCase() }}</span>
            </div>
            <button type="button" @click="removeSelected(item)">
              <ArtSvgIcon icon="ri:close-line" />
            </button>
          </div>
        </ElScrollbar>
      </aside>
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="confirm">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue'
  import { ElMessage } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { resourceFolders, resourceItems, resourceKindOptions } from '../mock'
  import type { ResourceItem, ResourceKind } from '../types'

  defineOptions({ name: 'ResourcePickerDialog' })

  const props = withDefaults(
    defineProps<{
      title: string
      multiple?: boolean
      max?: number
      acceptKinds?: ResourceKind[]
    }>(),
    {
      multiple: false,
      max: 1,
      acceptKinds: () => ['image', 'video', 'document', 'archive'] as ResourceKind[]
    }
  )

  const visible = defineModel<boolean>('visible', { default: false })
  const selectedResources = defineModel<ResourceItem[]>({ default: () => [] })

  const keyword = ref('')
  const activeFolderId = ref(0)
  const activeKind = ref<ResourceKind | ''>('')
  const currentPage = ref(1)
  const pageSize = ref(6)
  const localSelected = ref<ResourceItem[]>([])

  const allowedKindSet = computed(() => new Set<ResourceKind>(props.acceptKinds))
  const allowedKindOptions = computed(() =>
    resourceKindOptions.filter((option) => allowedKindSet.value.has(option.value))
  )

  const allowedResources = computed(() =>
    resourceItems.filter((item) => allowedKindSet.value.has(item.kind))
  )

  const filteredResources = computed(() => {
    const searchValue = keyword.value.trim().toLowerCase()

    return allowedResources.value.filter((item) => {
      const folderMatched = activeFolderId.value === 0 || item.folderId === activeFolderId.value
      const kindMatched = !activeKind.value || item.kind === activeKind.value
      const keywordMatched =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue)

      return folderMatched && kindMatched && keywordMatched
    })
  })

  const pagedResources = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredResources.value.slice(start, start + pageSize.value)
  })

  const activeFolderName = computed(() => {
    if (activeFolderId.value === 0) return '全部资源'
    return resourceFolders.find((folder) => folder.id === activeFolderId.value)?.name || '全部资源'
  })

  watch(
    visible,
    (value) => {
      if (!value) return

      localSelected.value = [...selectedResources.value]
      keyword.value = ''
      activeFolderId.value = 0
      activeKind.value = props.acceptKinds.length === 1 ? props.acceptKinds[0] : ''
      currentPage.value = 1
    },
    { immediate: true }
  )

  watch([keyword, activeFolderId, activeKind, pageSize], () => {
    currentPage.value = 1
  })

  function getFolderCount(folderId: number) {
    return allowedResources.value.filter((item) => item.folderId === folderId).length
  }

  function isSelected(item: ResourceItem) {
    return localSelected.value.some((selected) => selected.id === item.id)
  }

  function toggleResource(item: ResourceItem) {
    if (!props.multiple) {
      localSelected.value = [item]
      return
    }

    if (isSelected(item)) {
      removeSelected(item)
      return
    }

    if (localSelected.value.length >= props.max) {
      ElMessage.warning(`最多选择 ${props.max} 个资源`)
      return
    }

    localSelected.value = [...localSelected.value, item]
  }

  function removeSelected(item: ResourceItem) {
    localSelected.value = localSelected.value.filter((selected) => selected.id !== item.id)
  }

  function clearSelected() {
    localSelected.value = []
  }

  function confirm() {
    selectedResources.value = [...localSelected.value]
    visible.value = false
  }

  function handleMockUpload() {
    ElMessage.info('当前为 mock 演示，后续接文件中心上传接口')
  }

  function handleCreateFolder() {
    ElMessage.info('当前为 mock 演示，后续接文件中心目录接口')
  }

  function getResourceIcon(item: ResourceItem) {
    if (item.kind === 'image') return 'ri:image-line'
    if (item.kind === 'video') return 'ri:video-line'
    if (item.kind === 'archive') return 'ri:file-zip-line'
    return 'ri:file-text-line'
  }

  function getThumbUrl(item: ResourceItem) {
    return item.thumbnailUrl || item.url
  }

  function hasThumbImage(item: ResourceItem) {
    return Boolean(getThumbUrl(item)) && ['image', 'video'].includes(item.kind)
  }

  function shouldShowThumbIcon(item: ResourceItem) {
    return item.kind !== 'image'
  }

  function getThumbStyle(item: ResourceItem): CSSProperties {
    const thumbUrl = getThumbUrl(item)

    if (thumbUrl && ['image', 'video'].includes(item.kind)) {
      return {
        backgroundImage:
          item.kind === 'video'
            ? `linear-gradient(135deg, rgb(0 0 0 / 24%), rgb(0 0 0 / 38%)), url(${thumbUrl})`
            : `url(${thumbUrl})`
      }
    }

    return {
      background: item.kind === 'image' || item.kind === 'video' ? item.color : undefined
    }
  }
</script>
