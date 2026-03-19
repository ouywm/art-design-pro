<template>
  <div class="user-notice-page art-full-height">
    <UserNoticeSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard
      class="art-table-card notice-center-panel"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:showSearchBar="showSearchBar"
        layout="search,refresh,fullscreen"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton :loading="allReadLoading" @click="handleReadAll" v-ripple>全部已读</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <div v-loading="loading" class="notice-center-content">
        <template v-if="data.length > 0">
          <div class="notice-center-grid">
            <article
              v-for="item in data"
              :key="item.id"
              class="notice-center-card"
              :class="{ 'is-unread': !item.readFlag }"
              @click="goDetail(item)"
            >
              <div class="notice-center-card__head">
                <ElSpace wrap>
                  <ElTag v-if="item.pinned" type="danger" size="small" effect="plain">置顶</ElTag>
                  <ElTag :type="getDictTagType(NOTICE_LEVEL_DICT, item.noticeLevel)" size="small">
                    {{ getDictLabel(NOTICE_LEVEL_DICT, item.noticeLevel) }}
                  </ElTag>
                  <ElTag :type="item.readFlag ? 'success' : 'warning'" size="small">
                    {{ item.readFlag ? '已读' : '未读' }}
                  </ElTag>
                </ElSpace>

                <ElButton v-if="!item.readFlag" link type="primary" @click.stop="handleRead(item)">
                  标记已读
                </ElButton>
              </div>

              <div class="notice-center-card__body">
                <h3 class="notice-center-card__title">
                  {{ item.noticeTitle }}
                </h3>
                <p class="notice-center-card__desc">
                  {{
                    item.readFlag
                      ? '该公告已阅读，可进入详情查看完整内容。'
                      : '你有一条未读公告，建议优先查看详情。'
                  }}
                </p>
              </div>

              <div class="notice-center-card__footer">
                <div class="notice-center-card__footer-main">
                  <span class="notice-center-card__footer-text">
                    {{ item.readFlag ? '已完成阅读' : '等待阅读' }}
                  </span>
                  <div class="notice-center-card__meta">
                    <span class="notice-center-card__meta-item">
                      <span class="meta-label">发布时间</span>
                      <span class="meta-value">{{ item.publishTime || '-' }}</span>
                    </span>
                    <span v-if="item.expireTime" class="notice-center-card__meta-item">
                      <span class="meta-label">过期时间</span>
                      <span class="meta-value">{{ item.expireTime }}</span>
                    </span>
                  </div>
                </div>
                <ElButton link type="primary" @click.stop="goDetail(item)">查看详情</ElButton>
              </div>
            </article>
          </div>
        </template>

        <ElEmpty v-else description="暂无公告数据" :image-size="120" />
      </div>

      <div v-if="data.length > 0" class="notice-center-pagination">
        <ElPagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          :page-size="pagination.size"
          :current-page="pagination.page"
          :page-sizes="[20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetUserNoticeList,
    fetchReadAllUserNotice,
    fetchReadUserNotice
  } from '@/api/user-notice'
  import { useDict } from '@/utils/dict'
  import { mittBus } from '@/utils/sys'
  import type { UserNoticeListItem, UserNoticeSearchFormModel } from './types'
  import UserNoticeSearch from './modules/user-notice-search.vue'

  defineOptions({ name: 'UserNotice' })

  const router = useRouter()
  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'

  const createDefaultSearchForm = (): UserNoticeSearchFormModel => ({
    noticeTitle: undefined,
    noticeLevel: undefined,
    readFlag: undefined
  })

  const searchForm = ref<UserNoticeSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const allReadLoading = ref(false)
  const hasActivated = ref(false)

  const {
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetUserNoticeList,
      apiParams: {
        page: 1,
        size: 20
      }
    }
  })

  const handleSearch = (params: UserNoticeSearchFormModel) => {
    Object.assign(searchParams, params)
    getData()
  }

  const goDetail = (row: UserNoticeListItem) => {
    router.push({
      name: 'UserNoticeDetail',
      params: { id: row.id }
    })
  }

  const handleRead = async (row: UserNoticeListItem) => {
    await fetchReadUserNotice(row.id)
    mittBus.emit('refreshNoticeUnread')
    ElMessage.success('已标记为已读')
    await refreshData()
  }

  const handleReadAll = async () => {
    allReadLoading.value = true

    try {
      await fetchReadAllUserNotice()
      mittBus.emit('refreshNoticeUnread')
      ElMessage.success('已全部标记为已读')
      await refreshData()
    } finally {
      allReadLoading.value = false
    }
  }

  onActivated(() => {
    if (!hasActivated.value) {
      hasActivated.value = true
      return
    }

    void refreshData()
  })
</script>

<style scoped lang="scss">
  .user-notice-page {
    display: flex;
    flex-direction: column;
    min-height: 0;

    .notice-center-panel {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;

      :deep(#art-table-header) {
        margin-bottom: 18px;
      }

      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }
    }

    .notice-center-content {
      flex: 1;
      min-height: 280px;
      overflow: auto;
    }

    .notice-center-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .notice-center-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
      padding: 20px;
      cursor: pointer;
      border: 1px solid var(--art-card-border);
      border-radius: var(--custom-radius);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
    }

    .notice-center-card:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 8px 18px rgb(15 23 42 / 5%);
    }

    .notice-center-card__head,
    .notice-center-card__footer {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      min-width: 0;
    }

    .notice-center-card__footer-main {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      align-items: center;
      min-width: 0;
    }

    .notice-center-card__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .notice-center-card__title {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.6;
      color: var(--art-text-gray-900);
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .notice-center-card__desc {
      margin: 0;
      font-size: 13px;
      line-height: 1.8;
      color: var(--art-text-gray-500);
    }

    .notice-center-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 18px;
      align-items: center;
      min-width: 0;
    }

    .notice-center-card__meta-item {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      min-width: 0;
    }

    .meta-label {
      font-size: 12px;
      line-height: 1;
      color: var(--art-text-gray-500);
    }

    .meta-value,
    .notice-center-card__footer-text {
      overflow: hidden;
      font-size: 13px;
      line-height: 1.6;
      color: var(--art-text-gray-900);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notice-center-card__footer-text {
      color: var(--art-text-gray-500);
    }

    .notice-center-pagination {
      display: flex;
      justify-content: flex-end;
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px solid var(--art-card-border);
    }
  }

  @media screen and (width <= 1200px) {
    .user-notice-page {
      .notice-center-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  }

  @media screen and (width <= 768px) {
    .user-notice-page {
      .notice-center-card {
        padding: 16px;
      }

      .notice-center-card__head,
      .notice-center-card__footer {
        flex-direction: column;
        align-items: flex-start;
      }

      .notice-center-card__footer-main,
      .notice-center-card__meta {
        gap: 6px 12px;
      }

      .notice-center-pagination {
        justify-content: center;

        :deep(.el-pagination) {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    }
  }
</style>
