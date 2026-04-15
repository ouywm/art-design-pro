<template>
  <ElDrawer v-model="visible" direction="rtl" :with-header="false" size="520px" append-to-body>
    <div v-if="!file" class="h-full flex flex-col">
      <div class="border-b-d px-5 py-5">
        <div class="text-xl font-semibold text-g-900">文件详情</div>
        <div class="mt-2 text-sm text-g-600">请选择一个文件查看详情</div>
      </div>
      <div class="flex-1 px-5 py-5">
        <ElEmpty description="暂无文件" />
      </div>
    </div>

    <div v-else class="flex h-full flex-col" v-loading="loading">
      <!-- Header -->
      <div class="border-b-d px-5 py-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-xl font-semibold text-g-900">
              {{ detail?.displayName || file.displayName || file.originalName }}
            </div>
            <div class="mt-2 text-sm text-g-600">
              {{ detail?.originalName || file.originalName }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <ElButton size="small" text @click="handleEditDisplayName" v-ripple>编辑名称</ElButton>
            <ElTag :type="isPublic ? 'success' : 'info'" effect="light">
              {{ isPublic ? '公开' : '私有' }}
            </ElTag>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-auto px-5 py-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="art-card-sm border border-[var(--default-border)] p-4">
            <div class="text-xs uppercase tracking-[0.18em] text-g-500">Storage</div>
            <div class="mt-2 text-sm font-medium text-g-900">{{ providerLabel }}</div>
          </div>
          <div class="art-card-sm border border-[var(--default-border)] p-4">
            <div class="text-xs uppercase tracking-[0.18em] text-g-500">Size</div>
            <div class="mt-2 text-sm font-medium text-g-900">{{ sizeLabel }}</div>
          </div>
          <div class="art-card-sm border border-[var(--default-border)] p-4">
            <div class="text-xs uppercase tracking-[0.18em] text-g-500">Kind</div>
            <div class="mt-2 text-sm font-medium text-g-900">{{ detail?.kind || file.kind }}</div>
          </div>
          <div class="art-card-sm border border-[var(--default-border)] p-4">
            <div class="text-xs uppercase tracking-[0.18em] text-g-500">Folder</div>
            <div class="mt-2 text-sm font-medium text-g-900">{{ folderLabel }}</div>
          </div>
        </div>

        <div class="mt-5 art-card-sm border border-[var(--default-border)] p-4">
          <div class="text-sm font-semibold text-g-900">元数据</div>
          <div class="mt-3 space-y-2 text-sm text-g-600">
            <div>MIME：{{ detail?.mimeType || file.mimeType || '-' }}</div>
            <div>对象 Key：{{ detail?.objectKey || file.objectKey || '-' }}</div>
            <div>上传时间：{{ formatDateTime(detail?.createdAt || file.createdAt) }}</div>
            <div v-if="detail?.updatedAt || file.updatedAt">
              更新时间：{{ formatDateTime(detail?.updatedAt || file.updatedAt) }}
            </div>
          </div>
        </div>

        <div
          class="mt-5 art-card-sm border border-[var(--default-border)] p-4"
          v-loading="shareLoading"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-semibold text-g-900">公开链接</div>
              <div class="mt-1 text-xs text-g-500">生成免登录分享链接，可设置有效期。</div>
            </div>
            <ElTag :type="hasPublicLink ? 'success' : 'info'" effect="light">
              {{ hasPublicLink ? '已开启' : '未开启' }}
            </ElTag>
          </div>

          <div class="mt-3 text-xs text-g-500">过期时间：{{ publicUrlExpiresLabel }}</div>

          <div v-if="hasPublicLink" class="mt-3 flex items-center gap-2">
            <ElInput :model-value="shareUrl" readonly />
            <ElButton type="primary" text :disabled="!shareUrl" @click="copyShareUrl" v-ripple>
              复制
            </ElButton>
          </div>

          <div class="mt-4 text-sm font-semibold text-g-900">临时链接有效期</div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <ElButton size="small" plain @click="fillDuration(0, 0, 0)" v-ripple>永久</ElButton>
            <ElButton size="small" plain @click="fillDuration(0, 1, 0)" v-ripple>1 小时</ElButton>
            <ElButton size="small" plain @click="fillDuration(1, 0, 0)" v-ripple>1 天</ElButton>
            <ElButton size="small" plain @click="fillDuration(7, 0, 0)" v-ripple>7 天</ElButton>
            <ElButton size="small" @click="resetDuration" v-ripple>清零</ElButton>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div class="flex items-center gap-1.5 shrink-0">
              <ElInputNumber
                v-model="days"
                class="w-20 shrink-0"
                :min="0"
                :max="7"
                controls-position="right"
                placeholder="天"
              />
              <span class="text-sm text-g-500 whitespace-nowrap">天</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <ElInputNumber
                v-model="hours"
                class="w-20 shrink-0"
                :min="0"
                :max="23"
                controls-position="right"
                placeholder="小时"
              />
              <span class="text-sm text-g-500 whitespace-nowrap">小时</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <ElInputNumber
                v-model="minutes"
                class="w-20 shrink-0"
                :min="0"
                :max="59"
                controls-position="right"
                placeholder="分钟"
              />
              <span class="text-sm text-g-500 whitespace-nowrap">分钟</span>
            </div>

            <ElButton
              size="small"
              type="primary"
              :loading="shareLoading"
              @click="generatePublicLink"
              v-ripple
            >
              {{ hasPublicLink ? '重新生成并复制' : '生成并复制' }}
            </ElButton>
            <ElButton
              v-if="hasPublicLink"
              size="small"
              plain
              type="danger"
              :loading="shareLoading"
              @click="revokePublicLink"
              v-ripple
            >
              取消分享
            </ElButton>
          </div>

          <div class="mt-2 text-xs text-g-500"> 总时长：{{ durationLabel }} </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t-d px-5 py-4">
        <div class="flex flex-wrap items-center gap-2">
          <ElButton type="primary" @click="handleDownload" v-ripple>下载</ElButton>
          <ElButton plain type="danger" :disabled="!canDelete" @click="handleDelete" v-ripple>
            删除
          </ElButton>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchDeleteFile,
    fetchGeneratePublicLink,
    fetchGetFileDetail,
    fetchProxyDownload,
    fetchRevokePublicLink,
    fetchUpdateFileDisplayName
  } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'
  import { parseFilenameFromDisposition, triggerBlobDownload } from '@/utils/file'

  defineOptions({ name: 'FileDetailDrawer' })

  interface Props {
    file: Api.FileUpload.FileVo | null
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    (e: 'deleted'): void
    (e: 'changed'): void
  }>()

  const visible = defineModel<boolean>({ default: false })

  const loading = ref(false)
  const detail = ref<Api.FileUpload.FileVo | null>(null)
  const shareLoading = ref(false)

  const days = ref<number>(0)
  const hours = ref<number>(0)
  const minutes = ref<number>(0)

  const isPublic = computed(() => (detail.value?.visibility || props.file?.visibility) === 'PUBLIC')
  const publicToken = computed(() =>
    String(detail.value?.publicToken || props.file?.publicToken || '').trim()
  )
  const publicUrlExpiresAt = computed(
    () => (detail.value?.publicUrlExpiresAt ?? props.file?.publicUrlExpiresAt ?? null) as any
  )
  const hasPublicLink = computed(() => publicToken.value.length > 0)
  const shareUrl = computed(() =>
    hasPublicLink.value ? resolvePublicUrl(`/api/public/file/${publicToken.value}`) : ''
  )
  const publicUrlExpiresLabel = computed(() => {
    if (!hasPublicLink.value) return '-'
    return publicUrlExpiresAt.value ? formatDateTime(publicUrlExpiresAt.value) : '永久'
  })

  const expiresInSeconds = computed(() => {
    const d = Number(days.value || 0)
    const h = Number(hours.value || 0)
    const m = Number(minutes.value || 0)
    const total = d * 86400 + h * 3600 + m * 60
    if (!Number.isFinite(total) || total <= 0) return null
    return Math.floor(total)
  })

  const durationLabel = computed(() => {
    const d = Number(days.value || 0)
    const h = Number(hours.value || 0)
    const m = Number(minutes.value || 0)
    if (d + h + m === 0) return '永久'
    const parts: string[] = []
    if (d) parts.push(`${d} 天`)
    if (h) parts.push(`${h} 小时`)
    if (m) parts.push(`${m} 分钟`)
    return parts.join(' ')
  })

  const providerLabel = computed(() => {
    const p = detail.value?.provider || props.file?.provider
    if (p === 'OSS') return '阿里云 OSS'
    if (p === 'COS') return '腾讯云 COS'
    if (p === 'S3') return 'Amazon S3'
    if (p === 'LOCAL') return '本地存储'
    return p ? String(p) : '-'
  })

  const sizeLabel = computed(() => formatFileSize((detail.value?.size ?? props.file?.size) || 0))
  const folderLabel = computed(
    () => detail.value?.folder?.name || props.file?.folder?.name || '根目录'
  )

  const canDelete = computed(() => {
    const status = detail.value?.status ?? props.file?.status
    return status === 'NORMAL' || status === undefined || status === null
  })

  watch(
    () => [visible.value, props.file?.id] as const,
    async ([isOpen, id]) => {
      if (!isOpen || !id) return

      loading.value = true
      try {
        // 详情（可选）
        const d = await fetchGetFileDetail(id).catch(() => null)
        detail.value = d || props.file
        resetDuration()
      } catch {
        ElMessage.error('获取文件详情失败')
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  watch(visible, (val) => {
    if (!val) {
      detail.value = null
      shareLoading.value = false
    }
  })

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

  function resolvePublicUrl(publicUrl: string): string {
    if (!publicUrl) return ''
    if (publicUrl.startsWith('http://') || publicUrl.startsWith('https://')) return publicUrl

    const apiUrl = String(import.meta.env.VITE_API_URL || '')
    const proxyUrl = String((import.meta.env as any).VITE_API_PROXY_URL || '')
    let base = apiUrl && apiUrl !== '/' ? apiUrl : proxyUrl || location.origin
    base = base.replace(/\/+$/, '')

    const path = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`
    return `${base}${path}`
  }

  async function copyShareUrl() {
    if (!shareUrl.value) return
    try {
      await navigator.clipboard.writeText(shareUrl.value)
      ElMessage.success('链接已复制')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  async function handleDownload() {
    if (!props.file) return
    const res = await fetchProxyDownload(props.file.id)
    const disposition = res.headers.get('content-disposition') || ''
    const filename = parseFilenameFromDisposition(
      disposition,
      props.file.originalName || 'download'
    )
    const blob = await res.blob()
    triggerBlobDownload(blob, filename)
    ElMessage.success('下载完成')
  }

  async function handleEditDisplayName() {
    if (!props.file) return

    const currentName = String(
      detail.value?.displayName || props.file.displayName || props.file.originalName || ''
    ).trim()

    try {
      const res = await ElMessageBox.prompt('请输入展示名称', '更新展示名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        inputValue: currentName,
        inputPlaceholder: '例如：品牌主视觉 / 产品截图',
        inputValidator: (val: string) => {
          if (!String(val || '').trim()) return '请输入展示名称'
          if (String(val || '').trim().length > 120) return '最多 120 字'
          return true
        }
      })

      const nextName = String((res as any)?.value ?? '').trim()
      if (!nextName || nextName === currentName) return

      await fetchUpdateFileDisplayName(props.file.id, { displayName: nextName })
      if (detail.value) {
        ;(detail.value as any).displayName = nextName
      }
      ElMessage.success('更新成功')
      emit('changed')
    } catch {
      // cancel
    }
  }

  function fillDuration(d: number, h: number, m: number) {
    days.value = d
    hours.value = h
    minutes.value = m
  }

  function resetDuration() {
    fillDuration(0, 0, 0)
  }

  async function generatePublicLink() {
    if (!props.file) return
    if (shareLoading.value) return

    shareLoading.value = true
    try {
      const expiresIn = expiresInSeconds.value
      const res = await fetchGeneratePublicLink(props.file.id, expiresIn ? { expiresIn } : {})

      // 同步本地状态
      if (detail.value) {
        ;(detail.value as any).publicToken = res.token
        ;(detail.value as any).publicUrlExpiresAt = res.expiresAt
      }

      // 复制
      await navigator.clipboard.writeText(resolvePublicUrl(res.publicUrl))
      ElMessage.success('链接已生成并复制')
      emit('changed')
    } catch (err: any) {
      ElMessage.error(err?.message || '生成失败')
    } finally {
      shareLoading.value = false
    }
  }

  async function revokePublicLink() {
    if (!props.file) return

    ElMessageBox.confirm('确定要取消该文件的公开分享链接吗？', '取消分享', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      shareLoading.value = true
      try {
        await fetchRevokePublicLink(props.file!.id)
        if (detail.value) {
          ;(detail.value as any).publicToken = ''
          ;(detail.value as any).publicUrlExpiresAt = null
        }
        ElMessage.success('已取消分享')
        emit('changed')
      } finally {
        shareLoading.value = false
      }
    })
  }

  async function handleDelete() {
    if (!props.file) return

    ElMessageBox.confirm(
      `确定要删除文件「${props.file.displayName || props.file.originalName}」吗？`,
      '删除文件',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchDeleteFile(props.file!.id)
      ElMessage.success('删除成功')
      visible.value = false
      emit('deleted')
    })
  }
</script>
