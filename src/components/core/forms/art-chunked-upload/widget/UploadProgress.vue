<!-- 上传进度展示组件 -->
<template>
  <div class="art-upload-progress">
    <!-- MD5 计算进度 -->
    <div v-if="showMd5Progress && md5Percent > 0 && md5Percent < 100" class="mb-2">
      <span class="text-sm text-gray-500 mr-2">MD5 计算:</span>
      <ElProgress :percentage="md5Percent" :stroke-width="10" />
    </div>

    <!-- 上传进度 -->
    <div class="mb-2">
      <ElProgress :percentage="percent" :stroke-width="16" :status="progressStatus" />
    </div>

    <!-- 状态信息 -->
    <div class="art-upload-progress__info">
      <ElTag :type="statusTagType" size="small">{{ statusLabel }}</ElTag>
      <template v-if="fastUploaded">
        <ElTag type="success" size="small">秒传命中</ElTag>
      </template>
      <template v-else>
        <span v-if="showSpeed && speed > 0" class="info-item">
          速度: {{ formatSpeed(speed) }}
        </span>
        <span v-if="totalParts > 0" class="info-item">
          分片: {{ completedParts }}/{{ totalParts }}
        </span>
      </template>
      <span v-if="md5Duration > 0" class="info-item"> MD5: {{ formatDuration(md5Duration) }} </span>
      <span v-if="uploadDuration > 0" class="info-item">
        上传: {{ formatDuration(uploadDuration) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { formatSpeed, formatDuration } from '@/utils/format'

  defineOptions({ name: 'UploadProgress' })

  interface UploadProgressProps {
    /** 上传状态 */
    status: Api.FileUpload.UploadStatus
    /** MD5 计算进度 0-100 */
    md5Percent: number
    /** 上传进度 0-100 */
    percent: number
    /** 上传速度（字节/秒） */
    speed: number
    /** 已完成分片数 */
    completedParts: number
    /** 总分片数 */
    totalParts: number
    /** 是否秒传命中 */
    fastUploaded: boolean
    /** 是否显示速度 */
    showSpeed: boolean
    /** 是否显示 MD5 进度 */
    showMd5Progress: boolean
    /** MD5 计算耗时（毫秒） */
    md5Duration: number
    /** 上传耗时（毫秒） */
    uploadDuration: number
  }

  const props = withDefaults(defineProps<UploadProgressProps>(), {
    md5Percent: 0,
    percent: 0,
    speed: 0,
    completedParts: 0,
    totalParts: 0,
    fastUploaded: false,
    showSpeed: true,
    showMd5Progress: true,
    md5Duration: 0,
    uploadDuration: 0
  })

  const statusTagType = computed(() => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      idle: 'info',
      computing_md5: 'warning',
      uploading: 'primary',
      paused: 'warning',
      completed: 'success',
      error: 'danger'
    }
    return map[props.status] ?? 'info'
  })

  const statusLabel = computed(() => {
    const map: Record<string, string> = {
      idle: '待上传',
      computing_md5: '计算 MD5',
      uploading: '上传中',
      paused: '已暂停',
      completed: '已完成',
      error: '上传失败'
    }
    return map[props.status] ?? props.status
  })

  const progressStatus = computed(() => {
    if (props.status === 'completed') return 'success'
    if (props.status === 'error') return 'exception'
    return undefined
  })
</script>

<style lang="scss" scoped>
  .art-upload-progress {
    &__info {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .info-item {
      &::before {
        margin-right: 8px;
        color: var(--el-border-color);
        content: '|';
      }
    }
  }
</style>
