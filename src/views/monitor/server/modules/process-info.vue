<!-- 进程信息卡片 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center gap-2">
        <ArtSvgIcon icon="ri:terminal-box-line" class="text-lg" />
        <span>进程信息</span>
      </div>
    </template>
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="进程名称">{{ data.name }}</ElDescriptionsItem>
      <ElDescriptionsItem label="进程 PID">{{ data.pid }}</ElDescriptionsItem>
      <ElDescriptionsItem label="内存占用">{{ formatFileSize(data.memory) }}</ElDescriptionsItem>
      <ElDescriptionsItem label="CPU 使用率">{{ data.cpuUsage }}%</ElDescriptionsItem>
      <ElDescriptionsItem label="运行时间">{{ formatUptime(data.uptime) }}</ElDescriptionsItem>
      <ElDescriptionsItem label="启动时间">{{
        formatStartTime(data.startTime)
      }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElCard>
</template>

<script setup lang="ts">
  import { formatFileSize, formatUptime } from '@/utils/format'

  defineOptions({ name: 'ProcessInfo' })

  defineProps<{
    data: Api.Monitor.ProcessInfo
  }>()

  function formatStartTime(timestamp: number): string {
    if (!timestamp) return '-'
    return new Date(timestamp * 1000).toLocaleString()
  }
</script>
