<template>
  <aside class="notice-inbox-sidebar">
    <div class="notice-inbox-sidebar__header">
      <div class="notice-inbox-sidebar__title-row">
        <div>
          <h2 class="notice-inbox-sidebar__title">通知收件箱</h2>
          <p class="notice-inbox-sidebar__subtitle">集中查看发给当前账号的系统消息与提醒</p>
        </div>
      </div>

      <ElInput
        v-model="keyword"
        class="notice-inbox-sidebar__search"
        clearable
        placeholder="搜索通知标题或摘要"
        @clear="emitSearch"
        @keyup.enter="emitSearch"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" class="notice-inbox-sidebar__search-icon" />
        </template>
      </ElInput>

      <div class="notice-inbox-sidebar__stats">
        <div class="notice-inbox-sidebar__stat-card">
          <div class="notice-inbox-sidebar__stat-label">全部通知</div>
          <div class="notice-inbox-sidebar__stat-value">{{ noticeTotal }}</div>
        </div>
        <div class="notice-inbox-sidebar__stat-card">
          <div class="notice-inbox-sidebar__stat-label">未读消息</div>
          <div class="notice-inbox-sidebar__stat-value">{{ unreadCount }}</div>
        </div>
      </div>

      <div class="notice-inbox-sidebar__toolbar">
        <ElRadioGroup v-model="filterMode" @change="emitSearch">
          <ElRadioButton value="all">全部</ElRadioButton>
          <ElRadioButton value="unread">未读</ElRadioButton>
        </ElRadioGroup>

        <ElButton
          text
          type="primary"
          :disabled="unreadCount === 0"
          :loading="allReadLoading"
          @click="$emit('read-all')"
        >
          全部已读
        </ElButton>
      </div>

      <div class="notice-inbox-sidebar__count">当前展示 {{ notices.length }} 条通知</div>
    </div>

    <ElScrollbar class="notice-inbox-sidebar__list">
      <div v-loading="loading" class="notice-inbox-sidebar__list-inner">
        <button
          v-for="item in notices"
          :key="item.id"
          class="notice-inbox-item"
          :class="{
            'is-active': item.id === selectedId,
            'is-unread': !item.readFlag
          }"
          type="button"
          @click="$emit('select', item)"
        >
          <span v-if="!item.readFlag" class="notice-inbox-item__dot"></span>
          <div class="notice-inbox-item__content">
            <div class="notice-inbox-item__title-row">
              <span class="notice-inbox-item__title">{{ item.noticeTitle }}</span>
              <ElTag v-if="item.pinned" size="small" type="danger" effect="plain">置顶</ElTag>
            </div>

            <p class="notice-inbox-item__desc">
              {{ getNoticeSummary(item) }}
            </p>

            <div class="notice-inbox-item__footer">
              <ElTag
                class="notice-inbox-item__level"
                :type="getDictTagType(NOTICE_LEVEL_DICT, item.noticeLevel)"
                size="small"
              >
                {{ getDictLabel(NOTICE_LEVEL_DICT, item.noticeLevel) }}
              </ElTag>
              <span class="notice-inbox-item__time">{{ item.publishTime || '-' }}</span>
            </div>
          </div>
        </button>

        <ElEmpty v-if="!loading && notices.length === 0" description="暂无通知" :image-size="96" />
      </div>
    </ElScrollbar>

    <div v-if="notices.length > 0" class="notice-inbox-sidebar__pagination">
      <ElPagination
        small
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="$emit('page-change', $event)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { useDict } from '@/utils/dict'
  import type { UserNoticeFilterMode, UserNoticeListItem } from '../types'

  interface Props {
    notices: UserNoticeListItem[]
    selectedId?: number
    loading?: boolean
    total: number
    noticeTotal: number
    unreadCount: number
    currentPage: number
    pageSize: number
    allReadLoading?: boolean
    modelValue: string
    filter: UserNoticeFilterMode
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'update:filter', value: UserNoticeFilterMode): void
    (e: 'search'): void
    (e: 'select', value: UserNoticeListItem): void
    (e: 'read-all'): void
    (e: 'page-change', value: number): void
  }

  const props = withDefaults(defineProps<Props>(), {
    selectedId: undefined,
    loading: false,
    allReadLoading: false
  })

  const emit = defineEmits<Emits>()
  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'

  const keyword = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value)
  })

  const filterMode = computed({
    get: () => props.filter,
    set: (value: UserNoticeFilterMode) => emit('update:filter', value)
  })

  const emitSearch = () => {
    emit('search')
  }

  const getNoticeSummary = (item: UserNoticeListItem) => {
    if (item.readFlag) {
      return '该通知已阅读，可在右侧查看完整内容。'
    }

    return '你有一条未读通知，建议优先查看详情。'
  }
</script>

<style scoped lang="scss">
  .notice-inbox-sidebar {
    display: flex;
    flex: 0 0 360px;
    flex-direction: column;
    width: 360px;
    min-width: 0;
    border-right: 1px solid var(--art-card-border);
  }

  .notice-inbox-sidebar__header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--art-card-border);
  }

  .notice-inbox-sidebar__title-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .notice-inbox-sidebar__title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.5;
    color: var(--art-text-gray-900);
  }

  .notice-inbox-sidebar__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--art-text-gray-500);
  }

  .notice-inbox-sidebar__search {
    margin-top: 16px;
  }

  .notice-inbox-sidebar__search-icon {
    font-size: 16px;
    color: var(--art-text-gray-500);
  }

  .notice-inbox-sidebar__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .notice-inbox-sidebar__stat-card,
  .notice-inbox-detail__meta-card {
    min-width: 0;
    padding: 12px;
    background: var(--art-gray-100);
    border-radius: var(--custom-radius);
  }

  .notice-inbox-sidebar__stat-label {
    font-size: 12px;
    line-height: 1.4;
    color: var(--art-text-gray-500);
  }

  .notice-inbox-sidebar__stat-value {
    margin-top: 8px;
    overflow: hidden;
    font-size: 26px;
    font-weight: 650;
    line-height: 1.2;
    color: var(--art-text-gray-900);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-inbox-sidebar__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
  }

  .notice-inbox-sidebar__count {
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--art-text-gray-500);
  }

  .notice-inbox-sidebar__list {
    flex: 1;
    min-height: 0;

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
    }
  }

  .notice-inbox-sidebar__list-inner {
    min-height: 180px;
    padding: 12px;
  }

  .notice-inbox-item {
    position: relative;
    display: block;
    width: 100%;
    min-width: 0;
    padding: 12px;
    margin: 0 0 8px;
    text-align: left;
    appearance: none;
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--art-card-border);
    border-radius: var(--custom-radius);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .notice-inbox-item:hover {
    background: var(--art-gray-100);
  }

  .notice-inbox-item.is-active {
    background: var(--art-gray-200);
    border-color: var(--el-color-primary-light-5);
  }

  .notice-inbox-item__dot {
    position: absolute;
    top: 14px;
    right: 12px;
    width: 8px;
    height: 8px;
    background: var(--el-color-warning);
    border-radius: 50%;
  }

  .notice-inbox-item__content {
    min-width: 0;
  }

  .notice-inbox-item__title-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    min-width: 0;
    padding-right: 10px;
  }

  .notice-inbox-item__title {
    display: -webkit-box;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.7;
    color: var(--art-text-gray-900);
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .notice-inbox-item__desc {
    display: -webkit-box;
    margin: 4px 0 0;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.7;
    color: var(--art-text-gray-500);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .notice-inbox-item__footer {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    margin-top: 12px;
  }

  .notice-inbox-item__level {
    flex-shrink: 0;
  }

  .notice-inbox-item__time {
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--art-text-gray-500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-inbox-sidebar__pagination {
    display: flex;
    justify-content: center;
    padding: 12px;
    border-top: 1px solid var(--art-card-border);
  }

  @media screen and (width <= 1024px) {
    .notice-inbox-sidebar {
      flex: none;
      width: 100%;
      max-height: 520px;
      border-right: 0;
      border-bottom: 1px solid var(--art-card-border);
    }
  }

  @media screen and (width <= 640px) {
    .notice-inbox-sidebar__header {
      padding: 16px;
    }

    .notice-inbox-sidebar__stats {
      gap: 10px;
    }

    .notice-inbox-sidebar__stat-value {
      font-size: 22px;
    }
  }
</style>
