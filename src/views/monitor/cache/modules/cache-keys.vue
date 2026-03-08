<!-- 缓存键列表 -->
<template>
  <ElCard shadow="never">
    <template #header>
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:key-2-line" class="text-lg" />
          <span>缓存键列表</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <ElInput
            v-model="pattern"
            placeholder="匹配模式，如 user:*"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </ElInput>
          <ElButton type="primary" @click="handleSearch">查询</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton
            type="danger"
            :disabled="!pattern || pattern === '*'"
            @click="handleBatchDelete"
          >
            批量删除
          </ElButton>
        </div>
      </div>
    </template>

    <ElTable :data="keyList" stripe v-loading="loading">
      <ElTableColumn type="index" label="#" width="50" />
      <ElTableColumn prop="key" label="键名" min-width="280" show-overflow-tooltip />
      <ElTableColumn label="TTL" width="150">
        <template #default="{ row }">
          <ElTag v-if="row.ttl === -1" type="info" size="small">永不过期</ElTag>
          <span v-else>{{ formatTTL(row.ttl) }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="类型" width="100">
        <template #default="{ row }">
          <ElTag :type="typeTagMap[row.keyType] || 'info'" size="small">{{ row.keyType }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="大小" width="100">
        <template #default="{ row }">
          <span class="text-sm text-g-600">{{ row.size }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <ElButton type="primary" link size="small" @click="handleDetail(row)">详情</ElButton>
          <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="flex items-center justify-between mt-4">
      <span class="text-sm text-g-500">已加载 {{ keyList.length }} 条</span>
      <ElButton v-if="hasMore" type="primary" link :loading="loading" @click="loadMore">
        加载更多
      </ElButton>
    </div>
  </ElCard>

  <!-- 缓存详情弹窗 -->
  <ElDialog v-model="detailVisible" title="缓存详情" width="680px" destroy-on-close>
    <div v-loading="detailLoading">
      <template v-if="detailData">
        <ElDescriptions :column="2" border class="mb-5">
          <ElDescriptionsItem label="键名" :span="2">
            <span class="font-mono text-sm break-all">{{ detailData.key }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="类型">
            <ElTag :type="typeTagMap[detailData.keyType] || 'info'" size="small">
              {{ detailData.keyType }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="大小">{{ detailData.size }}</ElDescriptionsItem>
          <ElDescriptionsItem label="TTL">
            <ElTag v-if="detailData.ttl === -1" type="info" size="small">永不过期</ElTag>
            <span v-else>{{ formatTTL(detailData.ttl) }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="编码">{{ detailData.encoding }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- string 类型 -->
        <template v-if="detailData.value.type === 'string'">
          <p class="text-sm font-medium mb-2 text-g-700">值内容</p>
          <ElInput
            type="textarea"
            :model-value="detailData.value.data"
            :rows="6"
            readonly
            class="font-mono"
          />
        </template>

        <!-- hash 类型 -->
        <template v-else-if="detailData.value.type === 'hash'">
          <p class="text-sm font-medium mb-2 text-g-700">Hash 字段</p>
          <ElTable :data="detailData.value.data" stripe border max-height="300">
            <ElTableColumn prop="field" label="字段" min-width="160" show-overflow-tooltip />
            <ElTableColumn prop="value" label="值" min-width="240" show-overflow-tooltip />
          </ElTable>
        </template>

        <!-- list 类型 -->
        <template v-else-if="detailData.value.type === 'list'">
          <p class="text-sm font-medium mb-2 text-g-700">
            List 元素（共 {{ detailData.value.total }} 个）
          </p>
          <ElTable :data="listTableData" stripe border max-height="300">
            <ElTableColumn label="#" width="60" type="index" />
            <ElTableColumn prop="value" label="值" min-width="300" show-overflow-tooltip />
          </ElTable>
        </template>

        <!-- set 类型 -->
        <template v-else-if="detailData.value.type === 'set'">
          <p class="text-sm font-medium mb-2 text-g-700">
            Set 成员（共 {{ detailData.value.total }} 个）
          </p>
          <div class="flex flex-wrap gap-2">
            <ElTag v-for="(member, i) in detailData.value.data" :key="i" size="small">
              {{ member }}
            </ElTag>
          </div>
        </template>

        <!-- zset 类型 -->
        <template v-else-if="detailData.value.type === 'zset'">
          <p class="text-sm font-medium mb-2 text-g-700">
            Sorted Set 成员（共 {{ detailData.value.total }} 个）
          </p>
          <ElTable :data="detailData.value.data" stripe border max-height="300">
            <ElTableColumn prop="member" label="成员" min-width="240" show-overflow-tooltip />
            <ElTableColumn prop="score" label="分数" width="120" />
          </ElTable>
        </template>

        <!-- stream 类型 -->
        <template v-else-if="detailData.value.type === 'stream'">
          <p class="text-sm font-medium mb-2 text-g-700">
            Stream 消息（共 {{ detailData.value.total }} 条）
          </p>
          <ElTable :data="detailData.value.data" stripe border max-height="300">
            <ElTableColumn prop="id" label="消息 ID" width="200" show-overflow-tooltip />
            <ElTableColumn label="字段" min-width="300">
              <template #default="{ row }">
                <div v-for="f in row.fields" :key="f.field" class="text-xs leading-5">
                  <span class="font-medium">{{ f.field }}</span>
                  : {{ f.value }}
                </div>
              </template>
            </ElTableColumn>
          </ElTable>
        </template>

        <!-- vectorSet 类型 -->
        <template v-else-if="detailData.value.type === 'vectorSet'">
          <p class="text-sm font-medium mb-2 text-g-700">
            VectorSet 成员（共 {{ detailData.value.total }} 个）
          </p>
          <div class="flex flex-wrap gap-2">
            <ElTag v-for="(member, i) in detailData.value.data" :key="i" size="small">
              {{ member }}
            </ElTag>
          </div>
        </template>
      </template>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessageBox, ElMessage } from 'element-plus'
  import {
    fetchGetCacheKeys,
    fetchGetCacheKeyDetail,
    fetchDeleteCacheKey,
    fetchDeleteCacheKeysByPattern
  } from '@/api/monitor'

  defineOptions({ name: 'CacheKeys' })

  const pattern = ref('*')
  const loading = ref(false)
  const keyList = ref<Api.Monitor.CacheKeyItem[]>([])
  const nextCursor = ref(0)
  const hasMore = ref(false)

  const detailVisible = ref(false)
  const detailLoading = ref(false)
  const detailData = ref<Api.Monitor.CacheKeyDetailVo>()

  const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    string: 'primary',
    hash: 'success',
    list: 'warning',
    set: 'danger',
    zset: 'info'
  }

  // list 类型需要转成表格数据
  const listTableData = computed(() => {
    if (!detailData.value || detailData.value.value.type !== 'list') return []
    return detailData.value.value.data.map((v) => ({ value: v }))
  })

  async function loadKeys(reset = false) {
    loading.value = true
    try {
      const cursor = reset ? 0 : nextCursor.value
      const res = await fetchGetCacheKeys({ pattern: pattern.value, cursor, count: 20 })
      if (reset) {
        keyList.value = res.keys
      } else {
        keyList.value.push(...res.keys)
      }
      nextCursor.value = res.nextCursor
      hasMore.value = res.nextCursor !== 0
    } finally {
      loading.value = false
    }
  }

  function loadMore() {
    loadKeys(false)
  }

  function handleSearch() {
    loadKeys(true)
  }

  function handleReset() {
    pattern.value = '*'
    loadKeys(true)
  }

  function handleDetail(row: Api.Monitor.CacheKeyItem) {
    detailLoading.value = true
    detailVisible.value = true
    detailData.value = undefined
    fetchGetCacheKeyDetail(row.key)
      .then((res) => {
        detailData.value = res
      })
      .finally(() => {
        detailLoading.value = false
      })
  }

  function handleDelete(row: Api.Monitor.CacheKeyItem) {
    ElMessageBox.confirm(`确定要删除键「${row.key}」吗？`, '删除缓存键', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteCacheKey(row.key)
      ElMessage.success('删除成功')
      loadKeys(true)
    })
  }

  function handleBatchDelete() {
    const p = pattern.value
    ElMessageBox.confirm(`确定要删除所有匹配「${p}」的缓存键吗？此操作不可逆！`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      await fetchDeleteCacheKeysByPattern({ pattern: p })
      ElMessage.success('批量删除成功')
      loadKeys(true)
    })
  }

  function formatTTL(ttl: number): string {
    if (ttl < 0) return '永不过期'
    if (ttl < 60) return `${ttl} 秒`
    if (ttl < 3600) return `${Math.floor(ttl / 60)} 分 ${ttl % 60} 秒`
    if (ttl < 86400) return `${Math.floor(ttl / 3600)} 时 ${Math.floor((ttl % 3600) / 60)} 分`
    return `${Math.floor(ttl / 86400)} 天 ${Math.floor((ttl % 86400) / 3600)} 时`
  }

  onMounted(() => {
    loadKeys(true)
  })
</script>
