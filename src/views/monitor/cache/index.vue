<!-- 缓存监控页面 -->
<template>
  <div class="page-content" v-loading="loading">
    <template v-if="info">
      <!-- 第一行：核心指标卡片 -->
      <ElRow :gutter="20" class="flex">
        <ElCol v-for="(item, index) in topCards" :key="index" :sm="12" :md="6" :lg="6">
          <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
            <span class="text-g-700 text-sm">{{ item.label }}</span>
            <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
            <div class="flex-c mt-1">
              <span class="text-xs text-g-600">{{ item.subLabel }}</span>
              <span class="ml-1 text-xs font-semibold text-g-500">{{ item.subValue }}</span>
            </div>
            <div
              class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc"
              :class="item.iconBg"
            >
              <ArtSvgIcon :icon="item.icon" class="text-xl" :class="item.iconColor" />
            </div>
          </div>
        </ElCol>
      </ElRow>

      <!-- 第二行：缓存命中率 + 键类型分布（统一卡片风格） -->
      <ElRow :gutter="20">
        <ElCol :sm="24" :md="12" class="mb-5">
          <ArtDonutChartCard
            title="缓存命中率"
            :value="info.keyspaceHits"
            :percentage="info.hitRate"
            :height="14"
            percentage-label="命中"
            current-value="命中"
            previous-value="未命中"
            :data="[info.keyspaceHits, info.keyspaceMisses]"
            color="#67C23A"
          />
        </ElCol>
        <ElCol :sm="24" :md="12" class="mb-5">
          <ArtDonutChartCard
            title="键类型分布"
            :value="info.totalKeys"
            :percentage="topTypePercentage"
            :height="14"
            :percentage-label="topTypeName"
            :current-value="topTypeName"
            previous-value="其他"
            :data="topTypeDonutData"
            color="#409EFF"
          />
        </ElCol>
      </ElRow>

      <!-- 第三行：Redis 基础信息 + 内存详情 + 持久化状态 -->
      <ElRow :gutter="20">
        <ElCol :lg="8" :sm="24" class="mb-5">
          <ElCard shadow="never">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ArtSvgIcon icon="ri:server-line" class="text-lg" />
                  <span>Redis 信息</span>
                </div>
                <ElTooltip content="刷新数据" placement="top">
                  <ElButton :loading="loading" circle size="small" @click="loadData">
                    <template v-if="!loading" #icon>
                      <ArtSvgIcon icon="ri:refresh-line" />
                    </template>
                  </ElButton>
                </ElTooltip>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="Redis 版本">
                <span class="font-medium">{{ info.version }}</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="运行模式">{{ info.mode }}</ElDescriptionsItem>
              <ElDescriptionsItem label="运行时间">
                {{ formatUptime(info.uptime) }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="连接客户端数">
                <span class="font-medium">{{ info.connectedClients }}</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="已用 DB 数量">{{ info.dbCount }}</ElDescriptionsItem>
              <ElDescriptionsItem label="TCP 端口">{{ info.tcpPort }}</ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>
        </ElCol>
        <ElCol :lg="8" :sm="24" class="mb-5">
          <ElCard shadow="never">
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:ram-line" class="text-lg" />
                <span>内存信息</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="已用内存">{{ info.usedMemoryHuman }}</ElDescriptionsItem>
              <ElDescriptionsItem label="内存峰值">
                {{ info.usedMemoryPeakHuman }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="最大内存限制">
                <template v-if="!info.maxmemoryHuman || info.maxmemoryHuman === '0B'">
                  <ElTag type="info" size="small">无限制</ElTag>
                </template>
                <span v-else>{{ info.maxmemoryHuman }}</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="内存碎片率">
                <span class="font-medium">{{ info.memFragmentationRatio }}</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="总键数">
                <span class="font-medium">{{ info.totalKeys }}</span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="过期键数">{{ info.expiresKeys }}</ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>
        </ElCol>
        <ElCol :lg="8" :sm="24" class="mb-5">
          <ElCard shadow="never">
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:save-3-line" class="text-lg" />
                <span>持久化 & 统计</span>
              </div>
            </template>
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="AOF 持久化">
                <ElTag :type="info.aofEnabled ? 'success' : 'info'" size="small">
                  {{ info.aofEnabled ? '已开启' : '未开启' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="RDB 最近保存">{{ rdbSaveTimeStr }}</ElDescriptionsItem>
              <ElDescriptionsItem label="命中次数">
                <span class="text-success font-medium">
                  {{ info.keyspaceHits.toLocaleString() }}
                </span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="未命中次数">
                <span class="text-danger font-medium">
                  {{ info.keyspaceMisses.toLocaleString() }}
                </span>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="命中率">
                <div class="flex items-center gap-2 w-full">
                  <ElProgress
                    :percentage="info.hitRate"
                    :stroke-width="4"
                    :show-text="false"
                    :color="'var(--art-success)'"
                    class="flex-1"
                  />
                  <span class="text-sm font-medium text-success">{{ info.hitRate }}%</span>
                </div>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="每秒处理命令">
                <span class="font-medium">
                  {{ info.instantaneousOpsPerSec.toLocaleString() }}
                </span>
              </ElDescriptionsItem>
            </ElDescriptions>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 第四行：缓存键管理 -->
      <CacheKeys />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetCacheInfo } from '@/api/monitor'
  import { formatUptime } from '@/utils/format'
  import ArtDonutChartCard from '@/components/core/cards/art-donut-chart-card/index.vue'
  import CacheKeys from './modules/cache-keys.vue'

  defineOptions({ name: 'CacheMonitor' })

  const POLL_INTERVAL = 10000

  const loading = ref(false)
  const info = ref<Api.Monitor.CacheInfoVo>()

  let timer: number | null = null

  async function loadData() {
    loading.value = true
    try {
      info.value = await fetchGetCacheInfo()
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

  // ==================== 顶部统计卡片 ====================
  const topCards = computed(() => {
    if (!info.value) return []
    const d = info.value
    return [
      {
        label: '总键数',
        num: d.totalKeys,
        subLabel: '过期键',
        subValue: String(d.expiresKeys),
        icon: 'ri:key-2-line',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500'
      },
      {
        label: '命中次数',
        num: d.keyspaceHits,
        subLabel: '命中率',
        subValue: `${d.hitRate}%`,
        icon: 'ri:flashlight-line',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-500'
      },
      {
        label: '内存使用 (MB)',
        num: +(d.usedMemory / 1048576).toFixed(2),
        subLabel: '峰值',
        subValue: d.usedMemoryPeakHuman,
        icon: 'ri:database-2-line',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500'
      },
      {
        label: '连接客户端',
        num: d.connectedClients,
        subLabel: '每秒命令',
        subValue: String(d.instantaneousOpsPerSec),
        icon: 'ri:link',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500'
      }
    ]
  })

  // ==================== 键类型分布（ArtDonutChartCard 格式） ====================
  const topTypeName = computed(() => {
    const dist = info.value?.keyTypeDistribution
    if (!dist?.length) return ''
    return dist.reduce((a, b) => (a.value > b.value ? a : b)).name
  })

  const topTypePercentage = computed(() => {
    const dist = info.value?.keyTypeDistribution
    if (!dist?.length || !info.value?.totalKeys) return 0
    const top = dist.reduce((a, b) => (a.value > b.value ? a : b))
    return +((top.value / info.value.totalKeys) * 100).toFixed(1)
  })

  const topTypeDonutData = computed((): [number, number] => {
    const dist = info.value?.keyTypeDistribution
    if (!dist?.length) return [0, 0]
    const top = dist.reduce((a, b) => (a.value > b.value ? a : b))
    const rest = (info.value?.totalKeys || 0) - top.value
    return [top.value, rest]
  })

  // ==================== 辅助计算 ====================
  const rdbSaveTimeStr = computed(() => {
    const t = info.value?.rdbLastSaveTime
    if (!t) return '无'
    return new Date(t * 1000).toLocaleString()
  })
</script>
