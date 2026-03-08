<!-- 磁盘信息卡片 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center gap-2">
        <ArtSvgIcon icon="ri:hard-drive-2-line" class="text-lg" />
        <span>磁盘信息</span>
      </div>
    </template>
    <ElTable :data="data" stripe>
      <ElTableColumn prop="name" label="磁盘名称" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="mountPoint" label="挂载点" min-width="120" show-overflow-tooltip />
      <ElTableColumn prop="fsType" label="文件系统" width="120" />
      <ElTableColumn label="总空间" width="120">
        <template #default="{ row }">{{ formatFileSize(row.total) }}</template>
      </ElTableColumn>
      <ElTableColumn label="已用空间" width="120">
        <template #default="{ row }">{{ formatFileSize(row.used) }}</template>
      </ElTableColumn>
      <ElTableColumn label="可用空间" width="120">
        <template #default="{ row }">{{ formatFileSize(row.available) }}</template>
      </ElTableColumn>
      <ElTableColumn label="使用率" min-width="200">
        <template #default="{ row }">
          <ElProgress
            :percentage="row.usage"
            :stroke-width="14"
            text-inside
            :status="row.usage >= 90 ? 'exception' : row.usage >= 70 ? 'warning' : 'success'"
          />
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { formatFileSize } from '@/utils/format'

  defineOptions({ name: 'DiskInfo' })

  defineProps<{
    data: Api.Monitor.DiskInfo[]
  }>()
</script>
