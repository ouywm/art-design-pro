<template>
  <ElDialog v-model="visible" width="640px" :close-on-click-modal="false">
    <template #header>
      <div class="flex items-center justify-between gap-3 pr-8">
        <div class="text-base font-semibold text-g-900">上传文件</div>
        <ElTag effect="light" :type="mode === 'direct' ? 'success' : 'warning'">
          {{ mode === 'direct' ? '直传云存储' : '后端中转' }}
        </ElTag>
      </div>
    </template>

    <div class="mb-4">
      <div class="text-sm text-g-500">上传到</div>
      <div class="mt-2 flex items-center gap-2">
        <ElTreeSelect
          v-model="targetFolderKey"
          class="flex-1 min-w-0"
          :data="folderTreeData"
          :props="{ value: 'value', label: 'label', children: 'children' }"
          :check-strictly="true"
          :render-after-expand="false"
          :default-expanded-keys="[0]"
          filterable
          placeholder="选择目录"
        />

        <ElRadioGroup v-if="mode === 'proxy'" v-model="proxyUploadType" size="default">
          <ElRadioButton label="file">文件</ElRadioButton>
          <ElRadioButton label="folder">文件夹</ElRadioButton>
        </ElRadioGroup>
      </div>
    </div>

    <!-- 后端中转 -->
    <template v-if="mode === 'proxy'">
      <ArtFileUploadTarget
        v-show="proxyUploadType === 'file'"
        v-model="proxyFileUploaded"
        multiple
        drag
        :max-count="20"
        :upload-query="proxyUploadQuery"
        @all-done="handleProxyBatchUploaded"
      />

      <ArtFolderUpload
        v-show="proxyUploadType === 'folder'"
        v-model="proxyFolderUploaded"
        :upload-query="proxyUploadQuery"
        :max-count="5000"
        @uploaded="handleProxyBatchUploaded"
      />
    </template>

    <!-- 直传云存储 -->
    <template v-else>
      <ElUpload
        v-model:file-list="directFileList"
        :auto-upload="false"
        multiple
        :limit="20"
        :disabled="directUploading"
        :on-exceed="handleDirectExceed"
      >
        <ElButton :disabled="directUploading" v-ripple>选择文件</ElButton>
        <template #tip>
          <div class="el-upload__tip">流程：获取预签名 URL → PUT 文件到对象存储 → 回调确认入库</div>
        </template>
      </ElUpload>

      <ElProgress
        v-if="directUploading"
        class="mt-4"
        :percentage="directPercent"
        :stroke-width="14"
      />
    </template>

    <template #footer>
      <ElButton @click="visible = false" :disabled="directUploading" v-ripple>关闭</ElButton>
      <ElButton
        v-if="mode === 'direct'"
        type="primary"
        :loading="directUploading"
        :disabled="directFileList.length === 0"
        @click="handleDirectUpload"
        v-ripple
      >
        开始直传
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { UploadUserFile } from 'element-plus'
  import {
    fetchMoveFile,
    fetchPresignUpload,
    fetchPresignUploadCallback,
    fetchPutFileToPresignedUrl
  } from '@/api/file-upload'
  import type { FileFolderTreeNode, UploadMode } from '../types'

  defineOptions({ name: 'FileUploadDialog' })

  interface Props {
    mode: UploadMode
    folderId: number | null
    treeData: FileFolderTreeNode[]
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'proxy',
    folderId: null,
    treeData: () => []
  })

  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  const visible = defineModel<boolean>({ default: false })
  const targetFolderKey = ref<number>(0)

  const resolvedFolderId = computed<number | null>(() =>
    targetFolderKey.value === 0 ? null : targetFolderKey.value
  )

  type TreeSelectNode = { value: number; label: string; children?: TreeSelectNode[] }
  const folderTreeData = computed<TreeSelectNode[]>(() => {
    const convert = (nodes: FileFolderTreeNode[]): TreeSelectNode[] => {
      return (nodes || []).map((n) => ({
        value: n.id,
        label: n.name,
        children: n.children.length ? convert(n.children) : undefined
      }))
    }
    return [{ value: 0, label: '全部文件', children: convert(props.treeData || []) }]
  })

  watch(
    () => visible.value,
    (isOpen) => {
      if (!isOpen) return
      // 打开弹窗时默认使用外部当前目录，但之后以弹窗内选择为准
      targetFolderKey.value = props.folderId ?? 0
    },
    { immediate: true }
  )

  // ─── 后端中转 ────────────────────────────────────────────────────────────
  const proxyFileUploaded = ref<Api.FileUpload.FileUploadVo[]>([])
  const proxyFolderUploaded = ref<Api.FileUpload.FileUploadVo[]>([])
  const proxyUploadType = ref<'file' | 'folder'>('file')
  const proxyPreservePath = computed(() => proxyUploadType.value === 'folder')
  const proxyUploadQuery = computed<Api.FileUpload.FileUploadQueryDto>(() => ({
    folderId: resolvedFolderId.value ?? 0,
    preservePath: proxyPreservePath.value
  }))

  let proxyEmitTimer: number | null = null
  function scheduleProxyEmitSuccess() {
    if (proxyEmitTimer != null) window.clearTimeout(proxyEmitTimer)
    proxyEmitTimer = window.setTimeout(() => {
      proxyEmitTimer = null
      emit('success')
    }, 600)
  }

  function handleProxyBatchUploaded() {
    scheduleProxyEmitSuccess()
  }

  // ─── 直传云存储 ────────────────────────────────────────────────────────────
  const directFileList = ref<UploadUserFile[]>([])
  const directUploading = ref(false)
  const directPercent = ref(0)

  function resetDirectState() {
    directFileList.value = []
    directUploading.value = false
    directPercent.value = 0
  }

  watch(visible, (val) => {
    if (!val) {
      resetDirectState()
      proxyFileUploaded.value = []
      proxyFolderUploaded.value = []
    }
  })

  function handleDirectExceed() {
    ElMessage.warning('最多只能选择 20 个文件')
  }

  async function handleDirectUpload() {
    if (directUploading.value) return
    const pending = directFileList.value.filter((f) => f.status !== 'success')
    if (pending.length === 0) {
      ElMessage.info('没有待上传的文件')
      return
    }

    directUploading.value = true
    directPercent.value = 0

    try {
      const total = pending.length

      for (let i = 0; i < total; i++) {
        const item = pending[i]
        const raw = item.raw
        if (!raw) continue
        item.status = 'uploading'

        // 1) 获取预签名 URL
        const presign = await fetchPresignUpload({ fileName: raw.name, fileSize: raw.size })

        let uploaded: Api.FileUpload.FileUploadVo | null = null

        if (presign.fastUploaded && presign.file) {
          uploaded = presign.file
        } else {
          if (!presign.uploadUrl || !presign.objectKey) {
            throw new Error('预签名参数缺失，请联系后端检查返回值')
          }

          // 2) PUT 文件到对象存储
          await fetchPutFileToPresignedUrl(presign.uploadUrl, raw, (p) => {
            directPercent.value = Math.round(((i + p / 100) / total) * 100)
          })

          // 3) 回调确认入库
          uploaded = await fetchPresignUploadCallback({
            objectKey: presign.objectKey,
            originalName: raw.name,
            fileSize: raw.size
          })
        }

        // 上传到指定目录（非根目录）
        if (uploaded && resolvedFolderId.value != null) {
          await fetchMoveFile(uploaded.fileId, { folderId: resolvedFolderId.value })
        }

        directPercent.value = Math.round(((i + 1) / total) * 100)
        item.status = 'success'
        item.percentage = 100
      }

      ElMessage.success('上传完成')
      emit('success')
    } catch (err: any) {
      // 标记失败
      for (const item of pending) {
        if (item.status === 'uploading') item.status = 'fail'
      }
      ElMessage.error(err?.message || '上传失败')
    } finally {
      directUploading.value = false
    }
  }
</script>
