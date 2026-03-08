<!-- 系统信息卡片 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center gap-2">
        <ArtSvgIcon icon="ri:computer-line" class="text-lg" />
        <span>系统信息</span>
      </div>
    </template>
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="操作系统">{{ data.osName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="系统版本">{{ data.osVersion }}</ElDescriptionsItem>
      <ElDescriptionsItem label="内核版本">{{ data.kernelVersion }}</ElDescriptionsItem>
      <ElDescriptionsItem label="系统架构">{{ data.arch }}</ElDescriptionsItem>
      <ElDescriptionsItem label="主机名">{{ data.hostName }}</ElDescriptionsItem>
      <ElDescriptionsItem label="运行时间">{{ formatUptime(data.uptime) }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElCard>
</template>

<script setup lang="ts">
  import { formatUptime } from '@/utils/format'

  defineOptions({ name: 'SysInfo' })

  defineProps<{
    data: Api.Monitor.SysInfo
  }>()
</script>
