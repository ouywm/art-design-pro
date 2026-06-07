<template>
  <div class="feedback-page art-page-view">
    <section class="feedback-stats">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="feedback-stat-card art-surface-sm"
      >
        <div class="feedback-stat-card__top">
          <span>{{ card.label }}</span>
          <div class="feedback-stat-card__icon" :class="`is-${card.tone}`">
            <ArtSvgIcon :icon="card.icon" />
          </div>
        </div>
        <strong>{{ card.value }}</strong>
        <p>{{ card.desc }}</p>
      </article>
    </section>

    <section class="feedback-insights">
      <article class="feedback-panel art-surface-sm">
        <div class="feedback-panel__head">
          <h3>反馈状态分布</h3>
          <p>优先关注待处理和处理中反馈，缩短外部体验闭环。</p>
        </div>

        <ElScrollbar max-height="300px" class="feedback-panel__scroll">
          <div class="feedback-status-grid">
            <article
              v-for="item in statusDistribution"
              :key="item.status"
              class="feedback-muted-card art-surface-muted"
            >
              <div>
                <ElTag :type="statusTagType[item.status]">
                  {{ FEEDBACK_STATUS_LABEL[item.status] }}
                </ElTag>
                <strong>{{ item.count }}</strong>
              </div>
              <p>当前处于 {{ FEEDBACK_STATUS_LABEL[item.status] }} 的反馈量</p>
            </article>
          </div>
        </ElScrollbar>
      </article>

      <article class="feedback-panel art-surface-sm">
        <div class="feedback-panel__head">
          <h3>最新反馈</h3>
          <p>快速查看刚刚收到的问题，决定是否需要优先处理。</p>
        </div>

        <ElScrollbar max-height="300px" class="feedback-panel__scroll">
          <div class="feedback-latest-list">
            <article
              v-for="item in latestFeedback"
              :key="item.id"
              class="feedback-muted-card art-surface-muted"
            >
              <div class="feedback-latest-list__top">
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>
                    {{ FEEDBACK_TYPE_LABEL[item.type] }} · {{ item.submitUser }} ·
                    {{ item.submitTime }}
                  </span>
                </div>
                <ElTag :type="priorityTagType[item.priority]">
                  {{ FEEDBACK_PRIORITY_LABEL[item.priority] }}
                </ElTag>
              </div>
              <div class="feedback-latest-list__bottom">
                <ElTag :type="statusTagType[item.status]">
                  {{ FEEDBACK_STATUS_LABEL[item.status] }}
                </ElTag>
                <ElButton text type="primary" @click="openDetail(item)">查看</ElButton>
              </div>
            </article>
          </div>
        </ElScrollbar>
      </article>
    </section>

    <FeedbackSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="art-table-card feedback-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <FeedbackDetailDrawer v-model:visible="detailVisible" :row="currentFeedback" />
  </div>
</template>

<script setup lang="ts">
  import { ElTag } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import FeedbackSearch from './modules/feedback-search.vue'
  import FeedbackDetailDrawer from './modules/feedback-detail-drawer.vue'
  import type { FeedbackItem, FeedbackPriority, FeedbackSearchForm, FeedbackStatus } from './types'
  import {
    FEEDBACK_PRIORITY_LABEL,
    FEEDBACK_STATUS_LABEL,
    FEEDBACK_TYPE_LABEL,
    feedbackList,
    fetchFeedbackList
  } from './mock'
  import './style.scss'

  defineOptions({ name: 'SystemFeedback' })

  const searchForm = ref<FeedbackSearchForm>({
    keyword: undefined,
    type: undefined,
    status: undefined
  })
  const detailVisible = ref(false)
  const currentFeedback = ref<FeedbackItem | null>(null)

  const statusTagType: Record<FeedbackStatus, 'danger' | 'success' | 'info'> = {
    pending: 'danger',
    resolved: 'success',
    closed: 'info'
  }

  const priorityTagType: Record<FeedbackPriority, 'danger' | 'warning' | 'info'> = {
    urgent: 'danger',
    medium: 'warning',
    low: 'info'
  }

  const pendingStatuses: FeedbackStatus[] = ['pending']
  const closedStatuses: FeedbackStatus[] = ['resolved', 'closed']

  const statusDistribution = computed(() =>
    (['resolved', 'pending', 'closed'] as FeedbackStatus[]).map((status) => ({
      status,
      count: feedbackList.filter((item) => item.status === status).length
    }))
  )

  const latestFeedback = computed(() =>
    [...feedbackList].sort((a, b) => b.submitTime.localeCompare(a.submitTime)).slice(0, 6)
  )

  const statCards = computed(() => [
    {
      label: '反馈总量',
      value: feedbackList.length,
      desc: '累计收到的全部用户反馈',
      icon: 'ri:chat-3-line',
      tone: 'primary'
    },
    {
      label: '待推进',
      value: feedbackList.filter((item) => pendingStatuses.includes(item.status)).length,
      desc: '待处理、分析中、已规划、处理中',
      icon: 'ri:stack-line',
      tone: 'warning'
    },
    {
      label: '今日新增',
      value: feedbackList.filter((item) => item.submitTime.startsWith('2026-06-07')).length,
      desc: '今天新收到的体验反馈',
      icon: 'ri:flashlight-line',
      tone: 'secondary'
    },
    {
      label: '已闭环',
      value: feedbackList.filter((item) => closedStatuses.includes(item.status)).length,
      desc: '已解决或已关闭的反馈',
      icon: 'ri:checkbox-circle-line',
      tone: 'success'
    }
  ])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchFeedbackList,
      apiParams: {
        page: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '编号',
          minWidth: 170
        },
        {
          prop: 'title',
          label: '标题',
          minWidth: 220
        },
        {
          prop: 'type',
          label: '类型',
          minWidth: 120,
          formatter: (row) => FEEDBACK_TYPE_LABEL[row.type]
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) =>
            h(ElTag, { type: statusTagType[row.status] }, () => FEEDBACK_STATUS_LABEL[row.status])
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 120,
          formatter: (row) =>
            h(
              ElTag,
              { type: priorityTagType[row.priority] },
              () => FEEDBACK_PRIORITY_LABEL[row.priority]
            )
        },
        {
          prop: 'contactName',
          label: '联系人',
          minWidth: 120
        },
        {
          prop: 'pagePath',
          label: '页面路径',
          minWidth: 180
        },
        {
          prop: 'submitTime',
          label: '提交时间',
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 110,
          fixed: 'right',
          formatter: (row) =>
            h(ArtButtonTable, {
              type: 'view',
              onClick: () => openDetail(row)
            })
        }
      ]
    }
  })

  const handleSearch = (params: FeedbackSearchForm) => {
    replaceSearchParams(params)
    getData()
  }

  const handleReset = () => {
    searchForm.value = {
      keyword: undefined,
      type: undefined,
      status: undefined
    }
    resetSearchParams()
  }

  const openDetail = (row: FeedbackItem) => {
    currentFeedback.value = row
    detailVisible.value = true
  }
</script>
