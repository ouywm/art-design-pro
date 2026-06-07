<template>
  <ElDrawer v-model="visible" title="反馈详情" size="760px" destroy-on-close>
    <div v-if="row" class="feedback-detail">
      <section class="feedback-detail__hero art-surface-muted">
        <div>
          <h3>{{ row.title }}</h3>
          <p>{{ row.id }}</p>
        </div>
        <div class="feedback-detail__tags">
          <ElTag :type="statusTagType[row.status]">{{ FEEDBACK_STATUS_LABEL[row.status] }}</ElTag>
          <ElTag :type="priorityTagType[row.priority]">
            {{ FEEDBACK_PRIORITY_LABEL[row.priority] }}
          </ElTag>
        </div>
      </section>

      <section class="feedback-detail__grid art-surface-muted">
        <div>
          <span>反馈类型</span>
          <strong>{{ FEEDBACK_TYPE_LABEL[row.type] }}</strong>
        </div>
        <div>
          <span>提交用户</span>
          <strong>{{ row.submitUser }}</strong>
        </div>
        <div>
          <span>联系人</span>
          <strong>{{ row.contactName }}</strong>
        </div>
        <div>
          <span>联系方式</span>
          <strong>{{ row.contactWay }}</strong>
        </div>
        <div>
          <span>页面路径</span>
          <strong>{{ row.pagePath }}</strong>
        </div>
        <div>
          <span>提交时间</span>
          <strong>{{ row.submitTime }}</strong>
        </div>
      </section>

      <section class="feedback-detail__content art-surface-muted">
        <span>反馈描述</span>
        <p>{{ row.description }}</p>
      </section>
    </div>
    <ElEmpty v-else description="暂无反馈详情" />
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { FeedbackItem, FeedbackPriority, FeedbackStatus } from '../types'
  import { FEEDBACK_PRIORITY_LABEL, FEEDBACK_STATUS_LABEL, FEEDBACK_TYPE_LABEL } from '../mock'

  defineOptions({ name: 'FeedbackDetailDrawer' })

  defineProps<{
    row: FeedbackItem | null
  }>()

  const visible = defineModel<boolean>('visible', { default: false })

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
</script>
