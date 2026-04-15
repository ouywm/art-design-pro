<!-- 文件中心页面 -->
<template>
  <div class="flex min-h-0 flex-col gap-4 pb-5 art-page-view art-full-height overflow-auto">
    <!-- Hero -->
    <section
      class="art-page-hero relative shrink-0 overflow-hidden rounded-custom-sm border border-[var(--default-border)] px-5 py-4 md:px-6 md:py-5"
      style="
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--default-box-color) 94%, var(--art-primary) 6%),
          var(--default-box-color)
        );
      "
    >
      <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:justify-between xl:items-center">
        <div class="min-w-0 max-w-3xl">
          <h1 class="font-semibold tracking-tight text-g-900 text-xl">文件中心</h1>
          <p class="mt-2 text-sm leading-7 text-g-600">上传、整理目录并管理文件公开分发。</p>
        </div>

        <div class="min-w-0 flex flex-wrap items-center gap-2">
          <ElRadioGroup v-model="uploadMode" class="min-w-0" size="default">
            <ElRadioButton label="direct">直传云存储</ElRadioButton>
            <ElRadioButton label="proxy">后端中转</ElRadioButton>
          </ElRadioGroup>

          <ElButton plain @click="openCreateFolder()" v-ripple>新建目录</ElButton>
          <ElButton type="primary" @click="openUploadDialog" v-ripple>上传文件</ElButton>
          <input ref="fileInputRef" type="file" class="hidden" multiple />
        </div>
      </div>

      <div class="relative z-10 mt-4">
        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div
            class="rounded-[var(--custom-radius)] border border-[var(--default-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--default-box-color)_95%,var(--art-primary)_5%),var(--default-box-color))] px-4 py-3"
          >
            <div class="text-xs uppercase tracking-[0.14em] text-g-500">总文件数</div>
            <div class="mt-2 leading-none text-g-900 text-[26px] font-semibold">
              {{ fileSummary.total }}
            </div>
            <div class="mt-1 text-xs leading-5 text-g-600">当前筛选条件下的可访问资源数量</div>
          </div>
          <div
            class="rounded-[var(--custom-radius)] border border-[var(--default-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--default-box-color)_95%,var(--art-primary)_5%),var(--default-box-color))] px-4 py-3"
          >
            <div class="text-xs uppercase tracking-[0.14em] text-g-500">私有文件</div>
            <div class="mt-2 leading-none text-g-900 text-[26px] font-semibold">
              {{ fileSummary.privateCount }}
            </div>
            <div class="mt-1 text-xs leading-5 text-g-600">默认安全边界内可追踪的内部资源</div>
          </div>
          <div
            class="rounded-[var(--custom-radius)] border border-[var(--default-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--default-box-color)_95%,var(--art-primary)_5%),var(--default-box-color))] px-4 py-3"
          >
            <div class="text-xs uppercase tracking-[0.14em] text-g-500">公开文件</div>
            <div class="mt-2 leading-none text-g-900 text-[26px] font-semibold">
              {{ fileSummary.publicCount }}
            </div>
            <div class="mt-1 text-xs leading-5 text-g-600">已生成公开链接的对外分发资源</div>
          </div>
          <div
            class="rounded-[var(--custom-radius)] border border-[var(--default-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--default-box-color)_95%,var(--art-primary)_5%),var(--default-box-color))] px-4 py-3"
          >
            <div class="text-xs uppercase tracking-[0.14em] text-g-500">当前模式</div>
            <div class="mt-2 leading-none text-g-900 text-[22px] font-semibold">{{
              uploadModeLabel
            }}</div>
            <div class="mt-1 text-xs leading-5 text-g-600">{{ uploadModeDesc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main -->
    <section class="grid grid-cols-12 items-stretch gap-4 xl:flex-1 xl:min-h-0">
      <aside class="col-span-12 h-full xl:col-span-3 min-w-0">
        <FileFolderTree
          v-model="selectedFolderId"
          :tree-data="folderTree"
          :loading="folderTreeLoading"
          :folder-count="folderCount"
          :current-folder-name="currentFolderName"
          :total-file-count="fileSummary.total"
          @refresh="loadFolderTree"
          @create-child="(node) => openCreateFolder(node.id)"
          @edit="openEditFolder"
          @delete="handleDeleteFolder"
        />
      </aside>

      <div class="col-span-12 h-full xl:col-span-9 min-w-0">
        <div
          class="flex h-full min-h-[640px] flex-col rounded-custom-sm border border-[var(--default-border)] bg-box"
        >
          <!-- Search -->
          <div class="border-b-d px-5 py-5">
            <div
              class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.2fr)_repeat(4,minmax(0,0.72fr))_auto]"
            >
              <ElInput
                v-model="searchForm.keyword"
                class="min-w-0 md:col-span-2 xl:col-span-1"
                placeholder="搜索文件名、显示名、对象 Key"
                clearable
                @keyup.enter="doQuery"
              />

              <ElSelect v-model="searchForm.kind" class="min-w-0" placeholder="文件类型" clearable>
                <ElOption
                  v-for="opt in KIND_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>

              <ElSelect
                v-model="searchForm.visibility"
                class="min-w-0"
                placeholder="可见性"
                clearable
              >
                <ElOption
                  v-for="opt in VISIBILITY_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>

              <ElSelect
                v-model="searchForm.provider"
                class="min-w-0"
                placeholder="云厂商"
                clearable
              >
                <ElOption
                  v-for="opt in PROVIDER_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>

              <ElSelect v-model="searchForm.status" class="min-w-0" placeholder="状态" clearable>
                <ElOption
                  v-for="opt in STATUS_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </ElSelect>

              <div class="flex items-center gap-2 md:col-span-2 xl:col-span-1 xl:justify-end">
                <ElButton @click="resetFilters">重置</ElButton>
                <ElButton type="primary" @click="doQuery" v-ripple>查询</ElButton>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <ElTag type="info" effect="light">当前目录：{{ currentFolderName }}</ElTag>
                <ElTag type="info" effect="light">当前页 {{ data.length }} 条</ElTag>
                <template v-for="tag in activeFilterTags" :key="tag.key">
                  <ElTag type="info" effect="light" closable @close="tag.onClose">{{
                    tag.label
                  }}</ElTag>
                </template>
                <ElTag :type="uploadMode === 'direct' ? 'success' : 'warning'" effect="light">
                  上传模式：{{ uploadMode === 'direct' ? '直传云存储' : '后端中转' }}
                </ElTag>
              </div>
              <div class="flex flex-wrap items-center gap-2"></div>
            </div>
          </div>

          <div class="px-5 pb-4 pt-4 flex-1 min-h-0">
            <ArtTable
              class="h-full w-full"
              :loading="loading"
              :data="data"
              :columns="columns"
              :pagination="pagination"
              :row-class-name="rowClassName"
              @row-click="handleRowClick"
              @pagination:size-change="handleSizeChange"
              @pagination:current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 上传文件 -->
    <FileUploadDialog
      v-model="uploadDialogVisible"
      :mode="uploadMode"
      :folder-id="selectedFolderId"
      :tree-data="folderTree"
      @success="handleUploadSuccess"
    />

    <!-- 新建/编辑目录 -->
    <FolderDialog
      v-model="folderDialogVisible"
      :mode="folderDialogMode"
      :folder="editingFolder"
      :tree-data="folderTree"
      :default-parent-id="folderDialogDefaultParentId"
      @success="handleFolderChanged"
    />

    <!-- 文件详情抽屉 -->
    <FileDetailDrawer
      v-model="detailDrawerVisible"
      :file="currentFile"
      @deleted="handleDrawerDeleted"
      @changed="handleDrawerChanged"
    />

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="imagePreviewVisible"
      :url-list="imagePreviewUrls"
      :initial-index="imagePreviewIndex"
      teleported
      @close="imagePreviewVisible = false"
    />

    <!-- 非图片预览（PDF/视频/音频/可浏览器展示） -->
    <ElDialog
      v-model="richPreviewVisible"
      width="980px"
      align-center
      :close-on-click-modal="false"
      class="file-preview-dialog"
      header-class="file-preview-dialog__header"
      body-class="file-preview-dialog__body"
      close-on-press-escape
    >
      <template #header>
        <div class="flex min-w-0 items-center justify-between gap-3 pr-10">
          <div class="min-w-0 truncate text-base font-semibold text-g-900">
            {{ richPreviewTitle }}
          </div>
          <ElButton
            v-if="richPreviewUrl"
            text
            class="!px-2"
            title="新窗口打开"
            @click="openPreviewInNewTab"
            v-ripple
          >
            <ArtSvgIcon icon="ri:external-link-line" class="text-base" />
          </ElButton>
        </div>
      </template>

      <div
        class="file-preview-content w-full"
        :class="{
          'is-video': richPreviewKind === 'video',
          'is-audio': richPreviewKind === 'audio'
        }"
      >
        <iframe
          v-if="richPreviewKind === 'iframe' || richPreviewKind === 'pdf'"
          class="w-full h-full rounded-[10px] border border-[var(--default-border)]"
          :src="richPreviewUrl"
        />
        <ArtVideoPlayer
          v-else-if="richPreviewKind === 'video'"
          :key="richPreviewUrl"
          class="w-full overflow-hidden rounded-[10px] border border-[var(--default-border)]"
          player-id="file-preview-video"
          :video-url="richPreviewUrl"
          poster-url=""
          :autoplay="false"
        />
        <audio
          v-else-if="richPreviewKind === 'audio'"
          class="w-full"
          controls
          :src="richPreviewUrl"
        />
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ContainerWidthEnum } from '@/enums/appEnum'
  import { useTable } from '@/hooks/core/useTable'
  import { useSettingStore } from '@/store/modules/setting'
  import {
    fetchDeleteFile,
    fetchDeleteFolder,
    fetchGetFileList,
    fetchGetFolderTree,
    fetchPresignDownload,
    fetchProxyDownload
  } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'
  import {
    parseFilenameFromDisposition,
    triggerBlobDownload,
    isImageFile,
    canBrowserPreview
  } from '@/utils/file'
  import ArtVideoPlayer from '@/components/core/media/art-video-player/index.vue'
  import FileFolderTree from './modules/file-folder-tree.vue'
  import FolderDialog from './modules/folder-dialog.vue'
  import FileUploadDialog from './modules/file-upload-dialog.vue'
  import FileDetailDrawer from './modules/file-detail-drawer.vue'
  import type { FileFolderTreeNode, FileSearchFormModel, UploadMode } from './types'

  defineOptions({ name: 'FileManage' })

  type FileVo = Api.FileUpload.FileVo

  const DEFAULT_PAGE_SIZE = 12

  const fileInputRef = ref<HTMLInputElement | null>(null)

  // ─── 容器宽度（该页面需要满宽展示） ───────────────────────────────────────
  const settingStore = useSettingStore()
  const prevContainerWidth = shallowRef(settingStore.containerWidth)
  const didForceFullWidth = ref(false)

  function enterFullWidth() {
    if (didForceFullWidth.value) return
    didForceFullWidth.value = true
    prevContainerWidth.value = settingStore.containerWidth
    settingStore.setContainerWidth(ContainerWidthEnum.FULL)
  }

  function leaveFullWidth() {
    if (!didForceFullWidth.value) return
    didForceFullWidth.value = false
    settingStore.setContainerWidth(prevContainerWidth.value)
  }

  onMounted(enterFullWidth)
  onUnmounted(leaveFullWidth)
  onActivated(enterFullWidth)
  onDeactivated(leaveFullWidth)

  // ─── 模式 ────────────────────────────────────────────────────────────────
  const uploadMode = ref<UploadMode>('proxy')
  const uploadModeLabel = computed(() => (uploadMode.value === 'direct' ? '直传' : '中转'))
  const uploadModeDesc = computed(() =>
    uploadMode.value === 'direct' ? '文件直接进入对象存储' : '文件先进入业务服务'
  )

  // ─── 概览统计 ────────────────────────────────────────────────────────────
  const fileSummary = ref<Api.FileUpload.FileSummaryVo>({
    total: 0,
    privateCount: 0,
    publicCount: 0
  })

  // ─── 目录树 ────────────────────────────────────────────────────────────────
  const folderTreeLoading = ref(false)
  const folderTree = ref<FileFolderTreeNode[]>([])
  const selectedFolderId = ref<number | null>(null)

  const folderCount = computed(() => countFolders(folderTree.value))
  const currentFolderName = computed(() => {
    if (selectedFolderId.value == null) return '全部文件'
    return findFolderNameById(folderTree.value, selectedFolderId.value) || '全部文件'
  })

  function countFolders(nodes: FileFolderTreeNode[]): number {
    return nodes.reduce((acc, n) => acc + 1 + countFolders(n.children), 0)
  }

  function findFolderNameById(nodes: FileFolderTreeNode[], id: number): string | null {
    for (const n of nodes) {
      if (n.id === id) return n.name
      const hit = n.children.length ? findFolderNameById(n.children, id) : null
      if (hit) return hit
    }
    return null
  }

  function toFolderTree(nodes: Api.FileUpload.FileFolderTreeVo[]): FileFolderTreeNode[] {
    const hasChildren = nodes.some((n) => Array.isArray((n as any)?.children))
    if (hasChildren) {
      const walk = (n: any): FileFolderTreeNode => ({
        id: n.id,
        parentId: n.parentId,
        name: n.name,
        slug: n.slug,
        visibility: n.visibility,
        sort: n.sort,
        fileCount: n.fileCount,
        children: Array.isArray(n.children) ? n.children.map(walk) : []
      })
      return nodes.map((n) => walk(n))
    }

    const items: FileFolderTreeNode[] = nodes.map((n) => ({
      ...n,
      children: []
    }))
    const byId = new Map<number, FileFolderTreeNode>()
    for (const item of items) byId.set(item.id, item)

    const roots: FileFolderTreeNode[] = []
    for (const item of items) {
      const pid = item.parentId
      const parent = pid && pid !== 0 ? byId.get(pid) : undefined
      if (parent) parent.children.push(item)
      else roots.push(item)
    }

    const sortTree = (arr: FileFolderTreeNode[]) => {
      arr.sort((a, b) => a.sort - b.sort || a.id - b.id)
      for (const n of arr) sortTree(n.children)
    }
    sortTree(roots)

    return roots
  }

  async function loadFolderTree() {
    folderTreeLoading.value = true
    try {
      const res = await fetchGetFolderTree()
      folderTree.value = Array.isArray(res) ? toFolderTree(res) : []
    } finally {
      folderTreeLoading.value = false
    }
  }

  // ─── 弹窗 ────────────────────────────────────────────────────────────────
  const uploadDialogVisible = ref(false)

  const folderDialogVisible = ref(false)
  const folderDialogMode = ref<'create' | 'edit'>('create')
  const editingFolder = ref<Partial<Api.FileUpload.FileFolderVo> | null>(null)
  const folderDialogDefaultParentId = ref<number | null>(null)

  async function openUploadDialog() {
    try {
      await loadFolderTree()
    } finally {
      uploadDialogVisible.value = true
    }
  }

  function openCreateFolder(parentId?: number | null) {
    folderDialogMode.value = 'create'
    editingFolder.value = null
    folderDialogDefaultParentId.value =
      typeof parentId === 'number' ? parentId : (selectedFolderId.value ?? null)
    folderDialogVisible.value = true
  }

  function openEditFolder(node: FileFolderTreeNode) {
    folderDialogMode.value = 'edit'
    editingFolder.value = {
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      slug: node.slug,
      visibility: node.visibility,
      sort: node.sort
    }
    folderDialogDefaultParentId.value = null
    folderDialogVisible.value = true
  }

  async function handleDeleteFolder(node: FileFolderTreeNode) {
    ElMessageBox.confirm(`确定删除目录「${node.name}」吗？`, '删除目录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteFolder(node.id)
      ElMessage.success('删除成功')
      if (selectedFolderId.value === node.id) {
        selectedFolderId.value = node.parentId === 0 ? null : node.parentId
      }
      await loadFolderTree()
      doQuery()
    })
  }

  // ─── 搜索 ────────────────────────────────────────────────────────────────
  const searchForm = reactive<FileSearchFormModel>({
    keyword: '',
    kind: undefined,
    visibility: undefined,
    provider: undefined,
    status: undefined
  })

  const KIND_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileKind }> = [
    { label: '图片', value: 'IMAGE' },
    { label: '视频', value: 'VIDEO' },
    { label: '音频', value: 'AUDIO' },
    { label: '文件', value: 'FILE' }
  ]

  const VISIBILITY_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileVisibility }> = [
    { label: '公开', value: 'PUBLIC' },
    { label: '私有', value: 'PRIVATE' }
  ]

  const PROVIDER_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileProvider }> = [
    { label: 'S3', value: 'S3' },
    { label: 'OSS', value: 'OSS' },
    { label: 'COS', value: 'COS' },
    { label: 'LOCAL', value: 'LOCAL' }
  ]

  const STATUS_OPTIONS: Array<{ label: string; value: Api.FileUpload.FileStatus }> = [
    { label: '正常', value: 'NORMAL' },
    { label: '禁用', value: 'DISABLED' },
    { label: '删除', value: 'DELETED' }
  ]

  function buildFilters(form: FileSearchFormModel): Partial<Api.FileUpload.FileQueryParams> {
    const keyword = (form.keyword || '').trim()
    const filters: Partial<Api.FileUpload.FileQueryParams> = {
      folderId: selectedFolderId.value ?? undefined,
      kind: form.kind,
      visibility: form.visibility,
      provider: form.provider,
      status: form.status
    }

    if (keyword) {
      filters.originalName = keyword
      filters.displayName = keyword
    }

    return filters
  }

  const activeFilterTags = computed(() => {
    const tags: Array<{ key: string; label: string; onClose: () => void }> = []
    const keyword = (searchForm.keyword || '').trim()
    if (keyword)
      tags.push({
        key: 'keyword',
        label: `关键词：${keyword}`,
        onClose: () => (searchForm.keyword = '')
      })
    if (searchForm.kind)
      tags.push({
        key: 'kind',
        label: `类型：${searchForm.kind}`,
        onClose: () => (searchForm.kind = undefined)
      })
    if (searchForm.visibility)
      tags.push({
        key: 'visibility',
        label: `可见性：${searchForm.visibility === 'PUBLIC' ? '公开' : '私有'}`,
        onClose: () => (searchForm.visibility = undefined)
      })
    if (searchForm.provider)
      tags.push({
        key: 'provider',
        label: `云厂商：${searchForm.provider}`,
        onClose: () => (searchForm.provider = undefined)
      })
    if (searchForm.status)
      tags.push({
        key: 'status',
        label: `状态：${searchForm.status}`,
        onClose: () => (searchForm.status = undefined)
      })

    return tags.map((t) => ({
      ...t,
      onClose: () => {
        t.onClose()
        doQuery()
      }
    }))
  })

  function resetFilters() {
    searchForm.keyword = ''
    searchForm.kind = undefined
    searchForm.visibility = undefined
    searchForm.provider = undefined
    searchForm.status = undefined
    doQuery()
  }

  // ─── useTable ────────────────────────────────────────────────────────────
  const fetchFilePage = async (params: Api.FileUpload.FileQueryParams) => {
    const res = await fetchGetFileList(params)
    if ((res as any)?.summary) {
      fileSummary.value = (res as any).summary
    } else {
      fileSummary.value = {
        total: (res as any)?.total ?? 0,
        privateCount: 0,
        publicCount: 0
      }
    }
    return res
  }

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchFilePage,
      apiParams: {
        page: 1,
        size: DEFAULT_PAGE_SIZE
      },
      columnsFactory: () => [
        { type: 'selection', width: 52 },
        {
          prop: 'displayName',
          label: '文件',
          minWidth: 280,
          formatter: (row: FileVo) => {
            const icon = getFileKindIcon(row.kind)
            const mainText = row.displayName || row.originalName || '-'
            const subText = row.originalName || row.objectKey || row.fileNo || ''

            return h('div', { class: 'flex items-center gap-3 min-w-0' }, [
              h(
                'div',
                {
                  class:
                    'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--default-border)] bg-[var(--default-bg-color)]'
                },
                [h(ArtSvgIcon, { icon, class: 'text-xl text-g-500' })]
              ),
              h('div', { class: 'min-w-0' }, [
                h('div', { class: 'truncate text-sm font-medium text-g-900' }, mainText),
                h('div', { class: 'truncate text-xs text-g-500' }, subText)
              ])
            ])
          }
        },
        { prop: 'kind', label: '类型', width: 110 },
        {
          prop: 'size',
          label: '大小',
          width: 120,
          formatter: (row: FileVo) => formatFileSize(row.size)
        },
        {
          prop: 'folder',
          label: '目录',
          width: 120,
          formatter: (row: FileVo) => row.folder?.name || '根目录'
        },
        {
          prop: 'visibility',
          label: '可见性',
          width: 110,
          formatter: (row: FileVo) => {
            const isPublic = row.visibility === 'PUBLIC'
            return h(
              ElTag,
              { size: 'small', effect: 'light', type: isPublic ? 'success' : 'info' },
              () => (isPublic ? '公开' : '私有')
            )
          }
        },
        {
          prop: 'createdAt',
          label: '上传时间',
          width: 180,
          formatter: (row: FileVo) => formatDateTime(row.createdAt)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 260,
          fixed: 'right',
          align: 'center',
          formatter: (row: FileVo) =>
            h('div', { class: 'flex items-center gap-0.5 whitespace-nowrap' }, [
              h(
                ElButton,
                {
                  type: 'primary',
                  text: true,
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    handlePreview(row)
                  }
                },
                () => '预览'
              ),
              h(
                ElButton,
                {
                  type: 'primary',
                  text: true,
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    handleDownload(row)
                  }
                },
                () => '下载'
              ),
              h(
                ElButton,
                {
                  type: 'danger',
                  text: true,
                  disabled: !canDeleteFile(row),
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation()
                    handleDelete(row)
                  }
                },
                () => '删除'
              )
            ])
        }
      ]
    }
  })

  function doQuery() {
    replaceSearchParams(buildFilters(searchForm))
    getData()
  }

  watch(selectedFolderId, () => {
    doQuery()
  })

  onMounted(async () => {
    await loadFolderTree()
  })

  // ─── 文件操作 ────────────────────────────────────────────────────────────
  const detailDrawerVisible = ref(false)
  const currentFile = ref<FileVo | null>(null)

  const rowClassName = () => 'cursor-pointer'

  function openDetailDrawer(row: FileVo) {
    currentFile.value = row
    detailDrawerVisible.value = true
  }

  function handleRowClick(row: FileVo, column: any) {
    // 避免点到选择框/操作列时弹出抽屉
    if (column?.type === 'selection') return
    if (column?.property === 'operation' || column?.label === '操作') return
    openDetailDrawer(row)
  }

  function canDeleteFile(row: FileVo): boolean {
    return row.status === 'NORMAL' || row.status === undefined || row.status === null
  }

  function pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`
  }

  function formatDateTime(value: string | undefined): string {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    const yyyy = d.getFullYear()
    const m = d.getMonth() + 1
    const dd = d.getDate()
    const hh = pad2(d.getHours())
    const mm = pad2(d.getMinutes())
    const ss = pad2(d.getSeconds())
    return `${yyyy}/${m}/${dd} ${hh}:${mm}:${ss}`
  }

  function getFileKindIcon(kind: Api.FileUpload.FileKind | undefined): string {
    if (kind === 'IMAGE') return 'ri:image-2-line'
    if (kind === 'VIDEO') return 'ri:video-line'
    if (kind === 'AUDIO') return 'ri:volume-up-line'
    return 'ri:file-3-line'
  }

  // ─── 预览 ────────────────────────────────────────────────────────────
  const imagePreviewVisible = ref(false)
  const imagePreviewUrls = ref<string[]>([])
  const imagePreviewIndex = ref(0)

  const richPreviewVisible = ref(false)
  const richPreviewUrl = ref('')
  const richPreviewTitle = ref('')
  const richPreviewKind = ref<'pdf' | 'video' | 'audio' | 'iframe'>('iframe')

  watch(richPreviewVisible, (val) => {
    if (!val) {
      richPreviewUrl.value = ''
      richPreviewTitle.value = ''
      richPreviewKind.value = 'iframe'
    }
  })

  function normalizeExtension(row: FileVo): string {
    const raw = (row.extension || '').trim().toLowerCase()
    if (raw) return raw.startsWith('.') ? raw : `.${raw}`
    const name = (row.originalName || row.displayName || '').toLowerCase()
    const idx = name.lastIndexOf('.')
    return idx > -1 ? name.slice(idx) : ''
  }

  function openPreviewInNewTab() {
    if (!richPreviewUrl.value) return
    window.open(richPreviewUrl.value, '_blank')
  }

  async function handlePreview(row: FileVo) {
    try {
      const res = await fetchPresignDownload(row.id)
      const url = String((res as any)?.url || '').trim()
      if (!url) {
        ElMessage.error('预览链接为空')
        return
      }

      const ext = normalizeExtension(row)
      const kind = row.kind

      // 图片：ElImageViewer
      if (kind === 'IMAGE' || isImageFile(ext)) {
        imagePreviewUrls.value = [url]
        imagePreviewIndex.value = 0
        imagePreviewVisible.value = true
        return
      }

      // PDF/音视频：弹窗内直接预览
      if (ext === '.pdf') {
        richPreviewTitle.value = row.displayName || row.originalName || 'PDF 预览'
        richPreviewUrl.value = url
        richPreviewKind.value = 'pdf'
        richPreviewVisible.value = true
        return
      }

      if (kind === 'VIDEO' || ext === '.mp4' || ext === '.webm') {
        richPreviewTitle.value = row.displayName || row.originalName || '视频预览'
        richPreviewUrl.value = url
        richPreviewKind.value = 'video'
        richPreviewVisible.value = true
        return
      }

      if (kind === 'AUDIO' || ext === '.mp3' || ext === '.wav' || ext === '.ogg') {
        richPreviewTitle.value = row.displayName || row.originalName || '音频预览'
        richPreviewUrl.value = url
        richPreviewKind.value = 'audio'
        richPreviewVisible.value = true
        return
      }

      // 浏览器可展示：弹窗 iframe
      if (canBrowserPreview(ext)) {
        richPreviewTitle.value = row.displayName || row.originalName || '文件预览'
        richPreviewUrl.value = url
        richPreviewKind.value = 'iframe'
        richPreviewVisible.value = true
        return
      }

      // 其他类型：新开标签页
      window.open(url, '_blank')
    } catch {
      ElMessage.error('预览失败')
    }
  }

  async function handleDownload(row: FileVo) {
    const res = await fetchProxyDownload(row.id)
    const disposition = res.headers.get('content-disposition') || ''
    const filename = parseFilenameFromDisposition(
      disposition,
      row.originalName || row.displayName || 'download'
    )
    const blob = await res.blob()
    triggerBlobDownload(blob, filename)
    ElMessage.success('下载完成')
  }

  function handleDelete(row: FileVo) {
    const name = row.displayName || row.originalName || ''
    ElMessageBox.confirm(`确定要删除文件「${name}」吗？`, '删除文件', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteFile(row.id)
      ElMessage.success('删除成功')
      await refreshRemove()
      await loadFolderTree()
    })
  }

  // ─── 弹窗回调 ────────────────────────────────────────────────────────────
  function handleUploadSuccess() {
    doQuery()
    loadFolderTree()
  }

  function handleFolderChanged() {
    loadFolderTree()
  }

  async function handleDrawerDeleted() {
    // useTable 的刷新策略：删除后走 refreshRemove 更顺滑
    await refreshRemove()
    await loadFolderTree()
  }

  function handleDrawerChanged() {
    doQuery()
  }
</script>

<style scoped lang="scss">
  :global(.file-preview-dialog) {
    max-width: 92vw;
  }

  :global(.file-preview-dialog__header) {
    padding: 10px 16px 6px;
    margin-right: 0;
  }

  :global(.el-dialog__body.file-preview-dialog__body) {
    padding: 0 !important;
  }

  .file-preview-content {
    height: min(82vh, 760px);
  }

  .file-preview-content.is-video,
  .file-preview-content.is-audio {
    height: auto;
  }

  .file-preview-content.is-video {
    :deep(.xgplayer) {
      width: 100%;
    }
  }
</style>
