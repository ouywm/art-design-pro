<template>
  <div class="scheduler-instance-page art-full-height" v-loading="loading">
    <ElCard shadow="never" class="instance-card">
      <template #header>
        <div class="instance-card__head">
          <div class="instance-card__title-wrap">
            <span class="instance-card__title">集群实例</span>
            <span class="instance-card__sub"
              >共 {{ instances.length }} 个,主实例 {{ dispatcherCount }} 个</span
            >
          </div>
          <ElSpace>
            <ElCheckbox v-model="autoRefresh">每 30 秒自动刷新</ElCheckbox>
            <ElButton :icon="RefreshRight" @click="reload">刷新</ElButton>
          </ElSpace>
        </div>
      </template>

      <ElTable :data="instances" empty-text="暂无实例" border stripe>
        <ElTableColumn prop="id" label="实例 ID" min-width="200">
          <template #default="{ row }">
            <span class="instance-id">{{ row.id }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="ip" label="IP" min-width="140">
          <template #default="{ row }">
            {{ row.ip || '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="角色" width="90">
          <template #default="{ row }">
            <ElTag v-if="row.isDispatcher" type="success">主</ElTag>
            <ElTag v-else type="info">备</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="runningJobs" label="正在运行" width="110" align="right" />
        <ElTableColumn prop="lastSeen" label="最后心跳" min-width="180" />
        <ElTableColumn prop="createTime" label="创建时间" min-width="180" />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useIntervalFn } from '@vueuse/core'
  import { ElTag } from 'element-plus'
  import { RefreshRight } from '@element-plus/icons-vue'
  import { fetchGetInstances } from '@/api/scheduler-monitor'
  import type { InstanceItem } from './types'

  defineOptions({ name: 'SchedulerInstance' })

  const loading = ref(false)
  const instances = ref<InstanceItem[]>([])
  const autoRefresh = ref(false)

  const dispatcherCount = computed(() => instances.value.filter((i) => i.isDispatcher).length)

  const reload = async () => {
    loading.value = true
    try {
      instances.value = await fetchGetInstances()
    } finally {
      loading.value = false
    }
  }

  const { pause, resume } = useIntervalFn(reload, 30_000, {
    immediate: false,
    immediateCallback: false
  })

  watch(autoRefresh, (v) => {
    if (v) resume()
    else pause()
  })

  onMounted(() => {
    reload()
  })

  onUnmounted(() => {
    pause()
  })
</script>

<style scoped lang="scss">
  .scheduler-instance-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .instance-card {
    &__head {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    &__title-wrap {
      display: flex;
      gap: 12px;
      align-items: baseline;
    }

    &__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }

    &__sub {
      font-size: 12.5px;
      color: var(--art-text-gray-500);
    }
  }

  .instance-id {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 12.5px;
  }
</style>
