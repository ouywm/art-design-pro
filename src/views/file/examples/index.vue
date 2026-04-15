<!-- 文件上传组件示例 -->
<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- ==================== ArtFileUpload 通用上传 ==================== -->
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-cb">
          <h3 class="m-0">ArtFileUpload - 通用文件上传</h3>
          <div class="flex gap-2">
            <ElTag type="primary" effect="light" size="small">自动上传</ElTag>
            <ElTag type="success" effect="light" size="small">拖拽上传</ElTag>
          </div>
        </div>
      </template>

      <!-- 基础自动上传 -->
      <h4 class="mt-0 mb-3">基础自动上传</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        选择文件后自动上传，支持文件类型、大小限制。上传结果通过 v-model 双向绑定。
      </p>
      <ArtFileUpload
        v-model="autoUploadFiles"
        accept=".jpg,.jpeg,.png,.gif,.pdf"
        :max-size="10 * 1024 * 1024"
        :max-count="5"
        multiple
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
      <div v-if="autoUploadFiles.length" class="mt-3">
        <ElAlert type="success" :closable="false">
          <template #title>已上传 {{ autoUploadFiles.length }} 个文件</template>
          <pre class="m-0 text-xs">{{ JSON.stringify(autoUploadFiles, null, 2) }}</pre>
        </ElAlert>
      </div>

      <ElDivider />

      <!-- 拖拽上传 -->
      <h4 class="mt-0 mb-3">拖拽上传</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        支持将文件拖拽到上传区域进行上传，适用于批量文件场景。
      </p>
      <ArtFileUpload
        v-model="dragUploadFiles"
        drag
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        :max-size="20 * 1024 * 1024"
        :max-count="10"
      />

      <ElDivider />

      <!-- 手动上传 -->
      <h4 class="mt-0 mb-3">手动上传</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        选择文件后不自动上传，点击「开始上传」按钮统一触发。
      </p>
      <ArtFileUpload v-model="manualUploadFiles" :auto-upload="false" multiple :max-count="3" />

      <ElDivider />

      <!-- 照片墙 -->
      <h4 class="mt-0 mb-3">照片墙模式</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        以卡片形式展示已选文件的缩略图，适用于图片上传场景。
      </p>
      <ArtFileUpload
        v-model="pictureCardFiles"
        list-type="picture-card"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        :max-size="5 * 1024 * 1024"
        :max-count="6"
        multiple
      />
    </ElCard>

    <!-- ==================== ArtChunkedUpload 分片上传 ==================== -->
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-cb">
          <h3 class="m-0">ArtChunkedUpload - 大文件分片上传</h3>
          <div class="flex gap-2">
            <ElTag type="success" effect="light" size="small">MD5 秒传</ElTag>
            <ElTag type="primary" effect="light" size="small">断点续传</ElTag>
            <ElTag type="warning" effect="light" size="small">并发控制</ElTag>
          </div>
        </div>
      </template>

      <!-- 基础分片上传 -->
      <h4 class="mt-0 mb-3">基础分片上传</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        Web Worker 计算 MD5 不阻塞 UI，支持秒传检测、暂停/恢复/取消、错误自动重试。
      </p>
      <ArtChunkedUpload
        v-model="chunkedResult"
        :max-size="2 * 1024 * 1024 * 1024"
        :concurrency="3"
        :max-retries="3"
        @upload-success="handleChunkedSuccess"
        @upload-error="handleChunkedError"
      />
      <div v-if="chunkedResult" class="mt-3">
        <ElAlert type="success" :closable="false">
          <template #title>上传完成</template>
          <pre class="m-0 text-xs">{{ JSON.stringify(chunkedResult, null, 2) }}</pre>
        </ElAlert>
      </div>

      <ElDivider />

      <!-- 拖拽分片上传 -->
      <h4 class="mt-0 mb-3">拖拽分片上传</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        拖拽模式选择文件，限制文件类型为压缩包格式，最大 5GB。
      </p>
      <ArtChunkedUpload
        v-model="chunkedDragResult"
        drag
        accept=".zip,.tar.gz,.7z,.rar"
        :max-size="5 * 1024 * 1024 * 1024"
        :concurrency="5"
        tip="支持 .zip、.tar.gz、.7z、.rar 格式，最大 5GB"
      />
    </ElCard>

    <!-- ==================== Presigned URL 直传 ==================== -->
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-cb">
          <h3 class="m-0">Presigned URL 直传</h3>
          <div class="flex gap-2">
            <ElTag type="primary" effect="light" size="small">前端直传 RustFS</ElTag>
            <ElTag type="success" effect="light" size="small">三步流程</ElTag>
          </div>
        </div>
      </template>

      <p class="m-0 mb-3 text-sm text-g-500">
        前端直传到对象存储，不经过后端中转。流程：获取预签名 URL → PUT 文件到 RustFS →
        回调确认入库。
      </p>

      <div class="flex items-center gap-3 mb-4">
        <ElUpload
          :auto-upload="false"
          :show-file-list="false"
          :limit="1"
          :on-change="handlePresignFileChange"
          :on-exceed="handlePresignFileExceed"
        >
          <ElButton :disabled="presignUploading" v-ripple>
            {{ presignFile ? presignFile.name : '选择文件' }}
          </ElButton>
        </ElUpload>
        <ElButton
          type="primary"
          :disabled="!presignFile"
          :loading="presignUploading"
          @click="handlePresignUpload"
          v-ripple
        >
          开始直传
        </ElButton>
      </div>

      <!-- 流程步骤 -->
      <ElSteps v-if="presignStep >= 0" :active="presignStep" finish-status="success" class="mb-4">
        <ElStep title="获取预签名 URL" :description="presignStepDesc[0]" />
        <ElStep title="PUT 文件到 RustFS" :description="presignStepDesc[1]" />
        <ElStep title="回调确认入库" :description="presignStepDesc[2]" />
      </ElSteps>

      <!-- 上传进度 -->
      <ElProgress
        v-if="presignUploading && presignUploadPercent > 0"
        :percentage="presignUploadPercent"
        :stroke-width="14"
        class="mb-3"
      />

      <!-- 结果 -->
      <div v-if="presignResult" class="mt-3">
        <ElAlert type="success" :closable="false">
          <template #title>直传完成</template>
          <pre class="m-0 text-xs">{{ JSON.stringify(presignResult, null, 2) }}</pre>
        </ElAlert>
      </div>
      <div v-if="presignError" class="mt-3">
        <ElAlert type="error" :closable="false">
          <template #title>直传失败</template>
          {{ presignError }}
        </ElAlert>
      </div>
    </ElCard>

    <!-- ==================== 文件下载 ==================== -->
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-cb">
          <h3 class="m-0">文件下载</h3>
          <div class="flex gap-2">
            <ElTag type="primary" effect="light" size="small">Presigned 下载</ElTag>
            <ElTag type="success" effect="light" size="small">代理下载</ElTag>
          </div>
        </div>
      </template>

      <!-- Presigned 下载 -->
      <h4 class="mt-0 mb-3">Presigned URL 下载</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        通过后端获取带签名的临时下载 URL，浏览器直接从 RustFS 下载，不消耗后端带宽。
      </p>
      <div class="flex items-center gap-3 mb-3">
        <ElInputNumber
          v-model="presignDownloadId"
          :min="1"
          placeholder="文件 ID"
          controls-position="right"
        />
        <ElButton
          type="primary"
          :loading="presignDownloading"
          :disabled="!presignDownloadId"
          @click="handlePresignDownload"
          v-ripple
        >
          获取下载链接
        </ElButton>
      </div>
      <div v-if="presignDownloadUrl" class="mb-3">
        <ElAlert type="success" :closable="false">
          <template #title>已获取预签名下载 URL，正在下载...</template>
        </ElAlert>
      </div>

      <ElDivider />

      <!-- 代理下载 -->
      <h4 class="mt-0 mb-3">服务端代理下载</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        文件流经后端中转，适用于需要权限校验、日志记录或私有桶场景。后端返回二进制流，前端触发下载。
      </p>
      <div class="flex items-center gap-3">
        <ElInputNumber
          v-model="proxyDownloadId"
          :min="1"
          placeholder="文件 ID"
          controls-position="right"
        />
        <ElButton
          type="primary"
          :loading="proxyDownloading"
          :disabled="!proxyDownloadId"
          @click="handleProxyDownload"
          v-ripple
        >
          代理下载
        </ElButton>
      </div>
    </ElCard>

    <!-- ==================== ArtFileList 文件列表 ==================== -->
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-cb">
          <h3 class="m-0">ArtFileList - 文件列表展示</h3>
          <ElButton size="small" @click="resetMockFiles" v-ripple>重置数据</ElButton>
        </div>
      </template>

      <!-- 列表模式 -->
      <h4 class="mt-0 mb-3">列表模式</h4>
      <p class="m-0 mb-3 text-sm text-g-500">
        默认模式，展示文件名、大小，支持预览、下载、删除。组件遵循单向数据流，操作通过事件通知父组件。
      </p>
      <ArtFileList
        v-model="listFiles"
        @download="handleDownload"
        @delete="handleListDelete"
        @preview="handlePreview"
      />

      <ElDivider />

      <!-- 卡片模式 -->
      <h4 class="mt-0 mb-3">卡片模式</h4>
      <p class="m-0 mb-3 text-sm text-g-500"> 以网格形式展示文件，图片文件会显示缩略图预览。</p>
      <ArtFileList
        v-model="cardFiles"
        mode="card"
        @download="handleDownload"
        @delete="handleCardDelete"
        @preview="handlePreview"
      />

      <ElDivider />

      <!-- 仅下载 -->
      <h4 class="mt-0 mb-3">自定义按钮</h4>
      <p class="m-0 mb-3 text-sm text-g-500">此示例仅显示下载按钮，隐藏删除和预览。</p>
      <ArtFileList
        v-model="downloadOnlyFiles"
        :show-download="true"
        :show-delete="false"
        :show-preview="false"
        @download="handleDownload"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import {
    fetchPresignUpload,
    fetchPresignUploadCallback,
    fetchPresignDownload,
    fetchProxyDownload,
    fetchPutFileToPresignedUrl
  } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'
  import {
    downloadFileByUrl,
    triggerBlobDownload,
    parseFilenameFromDisposition
  } from '@/utils/file'

  defineOptions({ name: 'FileExamples' })

  // ==================== ArtFileUpload ====================
  const autoUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const dragUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const manualUploadFiles = ref<Api.FileUpload.FileUploadVo[]>([])
  const pictureCardFiles = ref<Api.FileUpload.FileUploadVo[]>([])

  function handleUploadSuccess(file: Api.FileUpload.FileUploadVo) {
    ElMessage.success(`文件 "${file.originalName}" 上传成功`)
  }

  function handleUploadError() {}

  // ==================== ArtChunkedUpload ====================
  const chunkedResult = ref<Api.FileUpload.FileUploadVo | null>(null)
  const chunkedDragResult = ref<Api.FileUpload.FileUploadVo | null>(null)

  function handleChunkedSuccess(file: Api.FileUpload.FileUploadVo) {
    ElMessage.success(`文件 "${file.originalName}" 上传完成`)
  }

  function handleChunkedError() {}

  // ==================== Presigned URL 直传 ====================
  const presignFile = ref<File | null>(null)
  const presignUploading = ref(false)
  const presignStep = ref(-1)
  const presignStepDesc = ref<string[]>(['', '', ''])
  const presignUploadPercent = ref(0)
  const presignResult = ref<Api.FileUpload.FileUploadVo | null>(null)
  const presignError = ref('')

  function handlePresignFileChange(uploadFile: UploadFile) {
    presignFile.value = uploadFile.raw || null
    // 重置状态
    presignStep.value = -1
    presignStepDesc.value = ['', '', '']
    presignUploadPercent.value = 0
    presignResult.value = null
    presignError.value = ''
  }

  function handlePresignFileExceed(files: File[]) {
    presignFile.value = files[0]
    presignStep.value = -1
    presignStepDesc.value = ['', '', '']
    presignUploadPercent.value = 0
    presignResult.value = null
    presignError.value = ''
  }

  async function handlePresignUpload() {
    if (!presignFile.value) return

    const file = presignFile.value
    presignUploading.value = true
    presignError.value = ''
    presignResult.value = null

    try {
      // Step 1: 获取预签名 URL（支持秒传检查）
      presignStep.value = 0
      presignStepDesc.value[0] = '请求中...'
      const presignRes = await fetchPresignUpload({
        fileName: file.name,
        fileSize: file.size
      })

      // 秒传命中 → 直接完成
      if (presignRes.fastUploaded && presignRes.file) {
        presignStepDesc.value[0] = '秒传命中'
        presignStep.value = 3
        presignResult.value = presignRes.file
        ElMessage.success('秒传完成，文件已存在')
        return
      }

      presignStepDesc.value[0] = `有效期 ${presignRes.expiresIn} 秒`

      // Step 2: PUT 文件到 RustFS
      presignStep.value = 1
      presignStepDesc.value[1] = `${formatFileSize(file.size)} 上传中...`
      await fetchPutFileToPresignedUrl(presignRes.uploadUrl!, file, (percent) => {
        presignUploadPercent.value = percent
      })
      presignStepDesc.value[1] = '上传完成'

      // Step 3: 回调确认
      presignStep.value = 2
      presignStepDesc.value[2] = '确认中...'
      const callbackRes = await fetchPresignUploadCallback({
        objectKey: presignRes.objectKey!,
        originalName: file.name,
        fileSize: file.size
      })
      presignStepDesc.value[2] = '入库成功'
      presignStep.value = 3

      presignResult.value = callbackRes
      ElMessage.success('Presigned 直传完成')
    } catch (err: any) {
      presignError.value = err.message || '直传失败'
    } finally {
      presignUploading.value = false
    }
  }

  // ==================== 文件下载 ====================
  const presignDownloadId = ref<number>()
  const presignDownloading = ref(false)
  const presignDownloadUrl = ref('')

  const proxyDownloadId = ref<number>()
  const proxyDownloading = ref(false)

  async function handlePresignDownload() {
    if (!presignDownloadId.value) return

    presignDownloading.value = true
    presignDownloadUrl.value = ''
    try {
      const res = await fetchPresignDownload(presignDownloadId.value)
      presignDownloadUrl.value = res.url
      await downloadFileByUrl(res.url)
      ElMessage.success('下载完成')
    } catch {
      // ignore
    } finally {
      presignDownloading.value = false
    }
  }

  async function handleProxyDownload() {
    if (!proxyDownloadId.value) return

    proxyDownloading.value = true
    try {
      const res = await fetchProxyDownload(proxyDownloadId.value)

      const disposition = res.headers.get('content-disposition') || ''
      const filename = parseFilenameFromDisposition(disposition)

      const blob = await res.blob()
      triggerBlobDownload(blob, filename)

      ElMessage.success(`文件 "${filename}" 下载完成`)
    } catch {
      // ignore
    } finally {
      proxyDownloading.value = false
    }
  }

  // ==================== ArtFileList ====================
  function createMockFiles(): Api.FileUpload.FileUploadVo[] {
    return [
      {
        fileId: 1,
        fileNo: 'F-0001',
        originalName: '项目设计文档.pdf',
        url: '',
        size: 2458624,
        expiresAt: null
      },
      {
        fileId: 2,
        fileNo: 'F-0002',
        originalName: '产品截图.png',
        url: 'https://picsum.photos/400/300?random=1',
        size: 856320,
        expiresAt: null
      },
      {
        fileId: 3,
        fileNo: 'F-0003',
        originalName: '数据导出.xlsx',
        url: '',
        size: 125440,
        expiresAt: null
      },
      {
        fileId: 4,
        fileNo: 'F-0004',
        originalName: '架构图.jpg',
        url: 'https://picsum.photos/400/300?random=2',
        size: 1536000,
        expiresAt: null
      },
      {
        fileId: 5,
        fileNo: 'F-0005',
        originalName: '接口文档.pdf',
        url: 'https://example.com/api-docs.pdf',
        size: 4096000,
        expiresAt: null
      }
    ]
  }

  const listFiles = ref<Api.FileUpload.FileUploadVo[]>(createMockFiles())
  const cardFiles = ref<Api.FileUpload.FileUploadVo[]>(createMockFiles())
  const downloadOnlyFiles = ref<Api.FileUpload.FileUploadVo[]>(createMockFiles().slice(0, 3))

  function resetMockFiles() {
    listFiles.value = createMockFiles()
    cardFiles.value = createMockFiles()
    downloadOnlyFiles.value = createMockFiles().slice(0, 3)
    ElMessage.success('数据已重置')
  }

  function handleDownload(file: Api.FileUpload.FileUploadVo) {
    ElMessage.info(`模拟下载: ${file.originalName}`)
  }

  function handleListDelete(file: Api.FileUpload.FileUploadVo) {
    listFiles.value = listFiles.value.filter((f) => f.fileId !== file.fileId)
    ElMessage.success(`已删除: ${file.originalName}`)
  }

  function handleCardDelete(file: Api.FileUpload.FileUploadVo) {
    cardFiles.value = cardFiles.value.filter((f) => f.fileId !== file.fileId)
    ElMessage.success(`已删除: ${file.originalName}`)
  }

  function handlePreview(file: Api.FileUpload.FileUploadVo) {
    if (file.url) {
      window.open(file.url, '_blank')
    } else {
      ElMessage.warning('该文件暂无可预览的 URL')
    }
  }
</script>
