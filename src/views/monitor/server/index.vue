<!-- 服务器监控页面 -->
<template>
  <div class="page-content" v-loading="loading">
    <div class="flex justify-end mb-4">
      <ElButton :icon="Refresh" :loading="loading" @click="loadData">刷新</ElButton>
    </div>

    <template v-if="serverInfo">
      <ElRow :gutter="20">
        <ElCol :lg="12" :xs="24" class="mb-5">
          <CpuInfo :data="serverInfo.cpu" />
        </ElCol>
        <ElCol :lg="12" :xs="24" class="mb-5">
          <MemoryInfo :data="serverInfo.memory" />
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :lg="12" :xs="24" class="mb-5">
          <SysInfo :data="serverInfo.sys" />
        </ElCol>
        <ElCol :lg="12" :xs="24" class="mb-5">
          <ProcessInfo :data="serverInfo.process" />
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="24" class="mb-5">
          <DiskInfo :data="serverInfo.disks" />
        </ElCol>
      </ElRow>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { Refresh } from '@element-plus/icons-vue'
  import { fetchGetServerInfo } from '@/api/monitor'
  import CpuInfo from './modules/cpu-info.vue'
  import MemoryInfo from './modules/memory-info.vue'
  import SysInfo from './modules/sys-info.vue'
  import ProcessInfo from './modules/process-info.vue'
  import DiskInfo from './modules/disk-info.vue'

  defineOptions({ name: 'ServerMonitor' })

  const POLL_INTERVAL = 10000

  const loading = ref(false)
  const serverInfo = ref<Api.Monitor.ServerInfoVo>()

  let timer: number | null = null

  async function loadData() {
    loading.value = true
    try {
      const res = await fetchGetServerInfo()
      serverInfo.value = res
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadData()
    timer = window.setInterval(loadData, POLL_INTERVAL)
  })

  onUnmounted(() => {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  })
</script>
