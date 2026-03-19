<!-- 文件列表组件 -->
<!-- 支持文件展示、下载、删除、预览操作，单向数据流 -->
<template>
  <div class="art-file-list">
    <div v-if="modelValue.length === 0" class="art-file-list__empty">
      <ElEmpty :description="emptyText" :image-size="80" />
    </div>

    <div v-else class="art-file-list__content" :class="`is-${mode}`">
      <div v-for="file in modelValue" :key="file.fileId" class="art-file-list__item">
        <!-- 文件缩略图（仅 card 模式且有 URL 时显示） -->
        <div v-if="mode === 'card' && file.url && isImage(file)" class="file-thumb">
          <ElImage :src="file.url" fit="cover" :preview-src-list="previewUrls" lazy />
        </div>

        <!-- 文件信息 -->
        <div class="file-info">
          <ElIcon class="file-icon" :size="18">
            <Document />
          </ElIcon>
          <span class="file-name" :title="file.originalName">{{ file.originalName }}</span>
          <span v-if="file.fileSize" class="file-size">{{ formatFileSize(file.fileSize) }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="file-actions">
          <ElButton
            v-if="showPreview && isPreviewable(file)"
            type="primary"
            link
            size="small"
            @click="handlePreview(file)"
          >
            预览
          </ElButton>
          <ElButton
            v-if="showDownload"
            type="primary"
            link
            size="small"
            @click="handleDownload(file)"
          >
            下载
          </ElButton>
          <ElButton v-if="showDelete" type="danger" link size="small" @click="handleDelete(file)">
            删除
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { Document } from '@element-plus/icons-vue'
  import { formatFileSize } from '@/utils/format'

  defineOptions({ name: 'ArtFileList' })

  // ==================== Props ====================
  interface ArtFileListProps {
    /** 展示模式 */
    mode?: 'list' | 'card'
    /** 是否显示下载按钮 */
    showDownload?: boolean
    /** 是否显示删除按钮 */
    showDelete?: boolean
    /** 是否显示预览按钮 */
    showPreview?: boolean
    /** 删除前是否弹出确认 */
    confirmDelete?: boolean
    /** 空数据提示文字 */
    emptyText?: string
  }

  const props = withDefaults(defineProps<ArtFileListProps>(), {
    mode: 'list',
    showDownload: true,
    showDelete: true,
    showPreview: true,
    confirmDelete: true,
    emptyText: '暂无文件'
  })

  // ==================== Emits ====================
  interface ArtFileListEmits {
    /** 下载文件（由父组件处理下载逻辑） */
    download: [file: Api.FileUpload.FileUploadVo]
    /** 删除文件（由父组件处理删除逻辑并更新列表） */
    delete: [file: Api.FileUpload.FileUploadVo]
    /** 预览文件（由父组件处理预览逻辑） */
    preview: [file: Api.FileUpload.FileUploadVo]
  }

  const emit = defineEmits<ArtFileListEmits>()

  // ==================== Model ====================
  /** 文件列表（双向绑定） */
  const modelValue = defineModel<Api.FileUpload.FileUploadVo[]>({ default: () => [] })

  // ==================== 常量 ====================
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
  const PREVIEWABLE_EXTENSIONS = [...IMAGE_EXTENSIONS, '.pdf']

  // ==================== 计算属性 ====================
  const previewUrls = computed(() =>
    modelValue.value.filter((f) => f.url && isImage(f)).map((f) => f.url)
  )

  // ==================== 工具函数 ====================
  function getExtension(name: string): string {
    const idx = name.lastIndexOf('.')
    return idx > -1 ? name.substring(idx).toLowerCase() : ''
  }

  function isImage(file: Api.FileUpload.FileUploadVo): boolean {
    return IMAGE_EXTENSIONS.includes(getExtension(file.originalName))
  }

  function isPreviewable(file: Api.FileUpload.FileUploadVo): boolean {
    if (!file.url) return false
    return PREVIEWABLE_EXTENSIONS.includes(getExtension(file.originalName))
  }

  // ==================== 事件处理 ====================
  function handlePreview(file: Api.FileUpload.FileUploadVo) {
    emit('preview', file)
  }

  function handleDownload(file: Api.FileUpload.FileUploadVo) {
    emit('download', file)
  }

  function handleDelete(file: Api.FileUpload.FileUploadVo) {
    if (props.confirmDelete) {
      ElMessageBox.confirm(`确定删除文件 "${file.originalName}"？`, '确认删除', {
        type: 'warning'
      }).then(() => {
        emit('delete', file)
      })
      return
    }
    emit('delete', file)
  }
</script>

<style lang="scss" scoped>
  @use './style';
</style>
