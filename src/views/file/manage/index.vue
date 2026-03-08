<!-- 文件管理页面 -->
<template>
  <div class="file-manage-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="previewVisible"
      :url-list="previewUrls"
      :initial-index="previewIndex"
      teleported
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag, ElButton, ElMessageBox, ElMessage, ElImage } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetFileList, fetchDeleteFile, fetchPresignDownload } from '@/api/file-upload'
  import { formatFileSize } from '@/utils/format'
  import { isImageFile, canBrowserPreview, downloadFileByUrl } from '@/utils/file'
  import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'

  defineOptions({ name: 'FileManage' })

  type FileDetailVo = Api.FileUpload.FileDetailVo

  // ==================== 搜索 ====================
  const searchForm = ref({
    originalName: undefined as string | undefined,
    fileSuffix: undefined as string | undefined
  })

  const searchItems: SearchFormItem[] = [
    { label: '文件名', key: 'originalName', type: 'input', placeholder: '请输入文件名' },
    { label: '文件类型', key: 'fileSuffix', type: 'input', placeholder: '如 .pdf .jpg' }
  ]

  // ==================== 图片预览 ====================
  const previewVisible = ref(false)
  const previewUrls = ref<string[]>([])
  const previewIndex = ref(0)

  function handlePreview(row: FileDetailVo) {
    if (isImageFile(row.fileSuffix) && row.url) {
      // 图片：收集当前页所有图片的 URL，支持左右切换
      const imageRows = data.value.filter((r: FileDetailVo) => r.url && isImageFile(r.fileSuffix))
      previewUrls.value = imageRows.map((r: FileDetailVo) => r.url)
      previewIndex.value = Math.max(
        imageRows.findIndex((r: FileDetailVo) => r.id === row.id),
        0
      )
      previewVisible.value = true
      return
    }

    if (canBrowserPreview(row.fileSuffix) && row.url) {
      // PDF、文本、视频等浏览器可直接渲染的文件
      window.open(row.url, '_blank')
      return
    }

    ElMessage.info('该文件类型暂不支持在线预览，请下载后查看')
  }

  // ==================== useTable ====================
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetFileList,
      apiParams: {
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'originalName',
          label: '文件名',
          minWidth: 200,
          formatter: (row: FileDetailVo) => {
            if (row.url && isImageFile(row.fileSuffix)) {
              return h('div', { class: 'flex items-center gap-2' }, [
                h(ElImage, {
                  class: 'size-8 rounded cursor-pointer',
                  src: row.url,
                  fit: 'cover',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    handlePreview(row)
                  }
                }),
                h('span', {}, row.originalName)
              ])
            }
            return row.originalName
          }
        },
        {
          prop: 'fileSuffix',
          label: '类型',
          width: 100,
          formatter: (row: FileDetailVo) =>
            h(ElTag, { size: 'small', effect: 'light' }, () => row.fileSuffix || '-')
        },
        {
          prop: 'fileSize',
          label: '大小',
          width: 120,
          sortable: true,
          formatter: (row: FileDetailVo) => formatFileSize(row.fileSize)
        },
        { prop: 'bucket', label: '存储桶', width: 120 },
        { prop: 'uploadBy', label: '上传者', width: 120 },
        { prop: 'createTime', label: '上传时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          formatter: (row: FileDetailVo) => {
            const previewable = canBrowserPreview(row.fileSuffix) && row.url
            return h('div', { class: 'flex gap-1' }, [
              h(
                ElButton,
                {
                  link: true,
                  size: 'small',
                  disabled: !previewable,
                  onClick: () => handlePreview(row)
                },
                () => '预览'
              ),
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  size: 'small',
                  onClick: () => handleDownload(row)
                },
                () => '下载'
              ),
              h(
                ElButton,
                {
                  type: 'danger',
                  link: true,
                  size: 'small',
                  onClick: () => handleDelete(row)
                },
                () => '删除'
              )
            ])
          }
        }
      ]
    }
  })

  // ==================== 搜索处理 ====================
  function handleSearch() {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  // ==================== 操作处理 ====================
  async function handleDownload(row: FileDetailVo) {
    try {
      const res = await fetchPresignDownload(row.id)
      await downloadFileByUrl(res.downloadUrl, row.originalName)
      ElMessage.success('下载完成')
    } catch {
      // 拦截器已处理错误提示
    }
  }

  function handleDelete(row: FileDetailVo) {
    ElMessageBox.confirm(`确定要删除文件「${row.originalName}」吗？`, '删除文件', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteFile(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    })
  }
</script>
