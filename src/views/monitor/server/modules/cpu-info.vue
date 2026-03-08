<!-- CPU 信息卡片 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center gap-2">
        <ArtSvgIcon icon="ri:cpu-line" class="text-lg" />
        <span>CPU 信息</span>
      </div>
    </template>
    <div class="flex items-center gap-8 max-md:flex-col">
      <div class="flex-shrink-0">
        <ElProgress type="dashboard" :percentage="data.usage" :width="120">
          <template #default="{ percentage }">
            <span class="text-xl font-bold">{{ percentage }}%</span>
          </template>
        </ElProgress>
      </div>
      <ElDescriptions :column="1" border class="flex-1">
        <ElDescriptionsItem label="CPU 型号">{{ data.modelName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="物理核心数">{{ data.physicalCoreCount }} 核</ElDescriptionsItem>
        <ElDescriptionsItem label="逻辑核心数">{{ data.logicalCoreCount }} 核</ElDescriptionsItem>
        <ElDescriptionsItem label="CPU 使用率">{{ data.usage }}%</ElDescriptionsItem>
        <ElDescriptionsItem label="每核使用率" v-if="data.perCoreUsage?.length">
          <div class="flex flex-wrap gap-2">
            <ElTag
              v-for="(usage, index) in data.perCoreUsage"
              :key="index"
              :type="usage >= 90 ? 'danger' : usage >= 70 ? 'warning' : 'success'"
              size="small"
            >
              核{{ index }}: {{ usage }}%
            </ElTag>
          </div>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'CpuInfo' })

  defineProps<{
    data: Api.Monitor.CpuInfo
  }>()
</script>
