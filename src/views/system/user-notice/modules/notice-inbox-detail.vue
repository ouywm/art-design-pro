<template>
  <section class="notice-inbox-detail">
    <template v-if="detail">
      <header class="notice-inbox-detail__header">
        <div class="notice-inbox-detail__heading">
          <h1 class="notice-inbox-detail__title">{{ detail.noticeTitle }}</h1>
          <p class="notice-inbox-detail__subtitle">{{ summary }}</p>
        </div>

        <ElSpace class="notice-inbox-detail__actions" wrap>
          <ElButton @click="$emit('manage')">进入通知管理</ElButton>
          <ElButton plain type="primary" @click="$emit('open-detail')">独立页查看</ElButton>
        </ElSpace>

        <div class="notice-inbox-detail__meta-grid">
          <div class="notice-inbox-detail__meta-card">
            <div class="notice-inbox-detail__meta-label">通知类型</div>
            <div class="notice-inbox-detail__meta-value">
              <span
                class="notice-inbox-detail__level-dot"
                :class="`is-${getDictTagType(NOTICE_LEVEL_DICT, detail.noticeLevel) || 'info'}`"
              ></span>
              {{ getDictLabel(NOTICE_LEVEL_DICT, detail.noticeLevel) }}
            </div>
          </div>
          <div class="notice-inbox-detail__meta-card">
            <div class="notice-inbox-detail__meta-label">阅读状态</div>
            <div class="notice-inbox-detail__meta-value">
              {{ detail.readFlag ? '已读' : '未读' }}
            </div>
          </div>
          <div class="notice-inbox-detail__meta-card">
            <div class="notice-inbox-detail__meta-label">发送人</div>
            <div class="notice-inbox-detail__meta-value">
              {{ detail.publishBy || '系统' }}
            </div>
          </div>
          <div class="notice-inbox-detail__meta-card">
            <div class="notice-inbox-detail__meta-label">发布时间</div>
            <div class="notice-inbox-detail__meta-value">
              {{ detail.publishTime || '-' }}
            </div>
          </div>
        </div>
      </header>

      <ElScrollbar class="notice-inbox-detail__body">
        <div class="notice-inbox-detail__body-inner">
          <div class="notice-inbox-detail__tags">
            <ElTag :type="getDictTagType(NOTICE_LEVEL_DICT, detail.noticeLevel)">
              {{ getDictLabel(NOTICE_LEVEL_DICT, detail.noticeLevel) }}
            </ElTag>
            <ElTag :type="detail.readFlag ? 'info' : 'warning'">
              {{ detail.readFlag ? '已读' : '未读' }}
            </ElTag>
            <ElTag type="info">收件箱通知</ElTag>
            <ElTag v-if="detail.pinned" type="danger" effect="plain">置顶通知</ElTag>
            <ElTag v-if="detail.readTime" type="info">阅读于：{{ detail.readTime }}</ElTag>
          </div>

          <div class="notice-inbox-detail__summary">
            {{ summary }}
          </div>

          <div
            class="notice-inbox-detail__content detail-content markdown-body"
            v-html="detail.noticeContent"
          ></div>
        </div>
      </ElScrollbar>
    </template>

    <div v-else v-loading="loading" class="notice-inbox-detail__empty">
      <ElEmpty description="请选择一条通知" :image-size="120" />
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
  import type { UserNoticeInboxDetail } from '../types'

  interface Props {
    detail?: UserNoticeInboxDetail
    loading?: boolean
  }

  interface Emits {
    (e: 'manage'): void
    (e: 'open-detail'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    detail: undefined,
    loading: false
  })

  defineEmits<Emits>()

  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'

  const stripHtml = (value?: string | null) => {
    return (value || '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const summary = computed(() => {
    if (!props.detail) {
      return ''
    }

    const explicitSummary = props.detail.noticeSummary?.trim()
    if (explicitSummary) {
      return explicitSummary
    }

    const contentSummary = stripHtml(props.detail.noticeContent)
    if (contentSummary) {
      return contentSummary.length > 120 ? `${contentSummary.slice(0, 120)}...` : contentSummary
    }

    return props.detail.readFlag
      ? '该通知已完成阅读，你可以继续查看完整正文内容。'
      : '该通知尚未阅读，建议优先查看正文内容并及时确认。'
  })
</script>

<style scoped lang="scss">
  .notice-inbox-detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .notice-inbox-detail__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    padding: 24px;
    border-bottom: 1px solid var(--art-card-border);
  }

  .notice-inbox-detail__heading {
    min-width: 0;
  }

  .notice-inbox-detail__title {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    font-size: 20px;
    font-weight: 650;
    line-height: 1.6;
    color: var(--art-text-gray-900);
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .notice-inbox-detail__subtitle {
    display: -webkit-box;
    margin: 8px 0 0;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.8;
    color: var(--art-text-gray-500);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .notice-inbox-detail__actions {
    align-self: flex-start;
  }

  .notice-inbox-detail__meta-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-column: 1 / -1;
    gap: 12px;
  }

  .notice-inbox-detail__meta-card {
    min-width: 0;
    padding: 12px;
    background: var(--art-gray-100);
    border-radius: var(--custom-radius);
  }

  .notice-inbox-detail__meta-label {
    font-size: 12px;
    line-height: 1.4;
    color: var(--art-text-gray-500);
  }

  .notice-inbox-detail__meta-value {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
    margin-top: 8px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--art-text-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-inbox-detail__level-dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    background: var(--el-color-info);
    border-radius: 50%;
  }

  .notice-inbox-detail__level-dot.is-primary {
    background: var(--el-color-primary);
  }

  .notice-inbox-detail__level-dot.is-success {
    background: var(--el-color-success);
  }

  .notice-inbox-detail__level-dot.is-warning {
    background: var(--el-color-warning);
  }

  .notice-inbox-detail__level-dot.is-danger {
    background: var(--el-color-danger);
  }

  .notice-inbox-detail__body {
    flex: 1;
    min-height: 0;
  }

  .notice-inbox-detail__body-inner {
    padding: 20px 24px 24px;
  }

  .notice-inbox-detail__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .notice-inbox-detail__summary {
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--art-text-gray-600);
    overflow-wrap: anywhere;
    background: var(--art-gray-100);
    border-radius: var(--custom-radius);
  }

  .notice-inbox-detail__content {
    min-height: 160px;
    padding: 20px;
    font-size: 15px;
    line-height: 1.8;
    color: var(--art-text-gray-800);
    overflow-wrap: anywhere;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-card-border);
    border-radius: var(--custom-radius);

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    :deep(p) {
      margin-top: 0;
      font-size: 15px;
      line-height: 1.8;
    }

    :deep(table) {
      width: 100%;
      overflow: auto;
      border-collapse: collapse;
    }
  }

  .notice-inbox-detail__empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }

  @media screen and (width <= 1280px) {
    .notice-inbox-detail__meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (width <= 1024px) {
    .notice-inbox-detail__header {
      grid-template-columns: minmax(0, 1fr);
    }

    .notice-inbox-detail__actions {
      justify-self: flex-start;
    }
  }

  @media screen and (width <= 640px) {
    .notice-inbox-detail__header,
    .notice-inbox-detail__body-inner {
      padding-inline: 16px;
    }

    .notice-inbox-detail__meta-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
