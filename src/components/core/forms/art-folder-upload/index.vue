<!-- 目录文件夹上传组件（支持目录选择/拖拽目录，走 batch 接口，默认 preservePath=true） -->
<template>
  <div class="art-folder-upload">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="text-sm text-g-600">选择或拖拽文件夹上传</div>
      <div class="flex flex-wrap items-center gap-2">
        <ElButton
          size="small"
          type="primary"
          plain
          :disabled="disabled"
          @click="pickFolder"
          v-ripple
        >
          选择文件夹
        </ElButton>
        <ElButton
          size="small"
          type="primary"
          :loading="uploading"
          :disabled="disabled || rows.length === 0"
          @click="handleUpload"
          v-ripple
        >
          开始上传
        </ElButton>
        <ElButton size="small" :disabled="disabled || uploading" @click="clear" v-ripple>
          清空
        </ElButton>
      </div>
    </div>

    <input
      ref="folderInputRef"
      class="hidden"
      type="file"
      multiple
      webkitdirectory
      @change="handleFolderPicked"
    />

    <div class="mt-3 w-full">
      <div class="el-upload w-full">
        <div
          class="el-upload-dragger w-full cursor-pointer art-folder-upload__dragger"
          :class="dragOver ? 'is-dragover' : ''"
          tabindex="0"
          role="button"
          @click="pickFolder"
          @keydown.enter.prevent="pickFolder"
          @keydown.space.prevent="pickFolder"
          @dragenter.prevent="dragOver = true"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
        >
          <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
          <div class="el-upload__text">拖拽文件夹到这里上传，或<em>点击选择</em></div>
          <div class="el-upload__tip">也支持拖拽多个文件（会按相对路径归档）</div>
        </div>
      </div>
    </div>

    <div class="mt-3">
      <ElTable v-if="rows.length" :data="rows" size="small" border height="360" class="w-full">
        <ElTableColumn prop="relativePath" label="路径" min-width="320" show-overflow-tooltip />
        <ElTableColumn prop="size" label="大小" width="120">
          <template #default="{ row }">{{ formatFileSize(row.size) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" width="120">
          <template #default="{ row }">
            <ElTag
              :type="
                row.status === 'success'
                  ? 'success'
                  : row.status === 'fail'
                    ? 'danger'
                    : row.status === 'uploading'
                      ? 'warning'
                      : 'info'
              "
              effect="light"
              size="small"
            >
              {{ row.statusLabel }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="操作" width="86" fixed="right">
          <template #default="{ $index }">
            <ElButton
              size="small"
              text
              type="danger"
              :disabled="disabled || uploading"
              @click="removeAt($index)"
            >
              移除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElEmpty v-else description="暂无选择文件夹" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { fetchUploadFiles } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'

  defineOptions({ name: 'ArtFolderUpload' })

  interface FolderRow {
    file: File
    relativePath: string
    size: number
    status: 'ready' | 'uploading' | 'success' | 'fail'
    reason: string
    statusLabel: string
  }

  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      maxCount?: number
      uploadQuery?: Api.FileUpload.FileUploadQueryDto
    }>(),
    {
      disabled: false,
      maxCount: 0,
      uploadQuery: () => ({})
    }
  )

  const emit = defineEmits<{
    (e: 'uploaded', result: Api.FileUpload.BatchUploadVo): void
  }>()

  const modelValue = defineModel<Api.FileUpload.FileUploadVo[]>({ default: () => [] })

  const rows = ref<FolderRow[]>([])
  const uploading = ref(false)
  const dragOver = ref(false)
  const folderInputRef = ref<HTMLInputElement | null>(null)

  function pickFolder() {
    if (props.disabled) return
    folderInputRef.value?.click()
  }

  function resetFolderInput() {
    if (folderInputRef.value) folderInputRef.value.value = ''
  }

  function clear() {
    rows.value = []
    modelValue.value = []
  }

  function removeAt(idx: number) {
    rows.value.splice(idx, 1)
  }

  function upsertFiles(files: File[]) {
    if (!files.length) return
    const limit = Number(props.maxCount || 0)
    const picked = limit > 0 ? files.slice(0, limit) : files

    rows.value = picked.map((f) => {
      const rel = String(
        (f as any)?.__relativePath || (f as any)?.webkitRelativePath || f.name
      ).trim()
      return {
        file: f,
        relativePath: rel || f.name,
        size: f.size,
        status: 'ready',
        reason: '',
        statusLabel: '待上传'
      } satisfies FolderRow
    })
  }

  async function handleFolderPicked(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    resetFolderInput()
    upsertFiles(files)
  }

  async function handleDrop(e: DragEvent) {
    dragOver.value = false
    const files = await extractFilesFromDataTransfer(e.dataTransfer)
    upsertFiles(files)
  }

  async function handleUpload() {
    if (props.disabled) return
    if (uploading.value) return
    if (!rows.value.length) return

    uploading.value = true
    try {
      for (const r of rows.value) {
        r.status = 'uploading'
        r.statusLabel = '上传中'
        r.reason = ''
      }

      const files = rows.value.map((r) => r.file)
      const res = await fetchUploadFiles(files, {
        ...(props.uploadQuery || {}),
        preservePath: true
      })

      const failed = (res as any)?.failed || []
      const failNames = new Map<string, string>()
      for (const f of failed) {
        const n = String(f.originalName || '').trim()
        if (n) failNames.set(n, String(f.reason || ''))
      }

      for (const r of rows.value) {
        const key = r.relativePath || r.file.name
        const reason = failNames.get(key) ?? failNames.get(r.file.name)
        if (reason) {
          r.status = 'fail'
          r.statusLabel = '失败'
          r.reason = reason
        } else {
          r.status = 'success'
          r.statusLabel = '成功'
        }
      }

      modelValue.value = [...modelValue.value, ...((res as any)?.success || [])]
      ElMessage.success('上传完成')
      emit('uploaded', res as any)
    } catch (err: any) {
      ElMessage.error(err?.message || '上传失败')
      for (const r of rows.value) {
        if (r.status === 'uploading') {
          r.status = 'fail'
          r.statusLabel = '失败'
          r.reason = err?.message || '上传失败'
        }
      }
    } finally {
      uploading.value = false
    }
  }

  async function extractFilesFromDataTransfer(dt: DataTransfer | null): Promise<File[]> {
    if (!dt) return []
    const items = Array.from(dt.items || [])
    if (!items.length) return Array.from(dt.files || [])

    const entries = items.map((it) => (it as any)?.webkitGetAsEntry?.()).filter(Boolean) as any[]

    if (!entries.length) return Array.from(dt.files || [])

    const result: File[] = []

    const readFile = (entry: any) =>
      new Promise<File>((resolve, reject) => entry.file(resolve, reject))

    const readEntries = (reader: any) =>
      new Promise<any[]>((resolve, reject) => reader.readEntries(resolve, reject))

    const walk = async (entry: any, prefix: string) => {
      if (!entry) return
      if (entry.isFile) {
        const file = await readFile(entry)
        // `webkitRelativePath` is a read-only getter on File in modern browsers.
        // Use our own field to preserve directory structure for multipart upload.
        ;(file as any).__relativePath = `${prefix}${file.name}`
        result.push(file)
        return
      }
      if (entry.isDirectory) {
        const dirPrefix = `${prefix}${entry.name}/`
        const reader = entry.createReader()
        while (true) {
          const batch = await readEntries(reader)
          if (!batch || batch.length === 0) break
          for (const child of batch) {
            await walk(child, dirPrefix)
          }
        }
      }
    }

    for (const entry of entries) {
      await walk(entry, '')
    }

    return result
  }
</script>

<style scoped lang="scss">
  .art-folder-upload__dragger {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-height: 180px;
  }
</style>
