<!-- 内存信息卡片 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center gap-2">
        <ArtSvgIcon icon="ri:ram-line" class="text-lg" />
        <span>内存信息</span>
      </div>
    </template>
    <div class="flex items-center gap-8 max-md:flex-col">
      <div class="flex-shrink-0">
        <ElProgress type="dashboard" :percentage="data.usage" :width="120" :color="memoryColor">
          <template #default="{ percentage }">
            <span class="text-xl font-bold">{{ percentage }}%</span>
          </template>
        </ElProgress>
      </div>
      <ElDescriptions :column="1" border class="flex-1">
        <ElDescriptionsItem label="总内存">{{ formatFileSize(data.total) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="已用内存">{{ formatFileSize(data.used) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="可用内存">
          {{ formatFileSize(data.available) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="内存使用率">
          <ElProgress :percentage="data.usage" :stroke-width="14" text-inside />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Swap 总量">
          {{ formatFileSize(data.swapTotal) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Swap 已用">
          {{ formatFileSize(data.swapUsed) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Swap 使用率" v-if="data.swapTotal > 0">
          <ElProgress
            :percentage="Number(((data.swapUsed / data.swapTotal) * 100).toFixed(1))"
            :stroke-width="14"
            status="warning"
            text-inside
          />
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { formatFileSize } from '@/utils/format'

  defineOptions({ name: 'MemoryInfo' })

  const props = defineProps<{
    data: Api.Monitor.MemoryInfo
  }>()

  const memoryColor = computed(() => {
    if (props.data.usage >= 90) return '#f56c6c'
    if (props.data.usage >= 70) return '#e6a23c'
    return '#67c23a'
  })
</script>
