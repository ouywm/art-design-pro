<template>
  <div class="user-notice-detail-page page-content">
    <div class="detail-toolbar">
      <ElButton link class="detail-back-button" @click="goBack">
        <ArtSvgIcon icon="ri:arrow-left-s-line" class="text-base" />
        返回公告中心
      </ElButton>
    </div>

    <div v-loading="loading" class="detail-main">
      <template v-if="detail">
        <section class="detail-hero" :class="{ 'is-unread': !detail.readFlag }">
          <div class="detail-hero__body">
            <div class="detail-hero__top">
              <div class="detail-tags">
                <ElTag :type="getDictTagType(NOTICE_LEVEL_DICT, detail.noticeLevel)" size="small">
                  {{ getDictLabel(NOTICE_LEVEL_DICT, detail.noticeLevel) }}
                </ElTag>
                <ElTag :type="detail.pinned ? 'danger' : 'info'" size="small">
                  {{ detail.pinned ? '置顶公告' : '普通公告' }}
                </ElTag>
                <ElTag :type="detail.readFlag ? 'success' : 'warning'" size="small">
                  {{ detail.readFlag ? '已读' : '未读' }}
                </ElTag>
              </div>

              <ElButton
                v-if="!detail.readFlag"
                class="detail-read-button"
                :loading="readLoading"
                @click="handleRead"
              >
                标记已读
              </ElButton>
            </div>

            <h1 class="detail-title">{{ detail.noticeTitle }}</h1>
            <div class="detail-summary">
              <p class="detail-subtitle">
                {{
                  detail.readFlag
                    ? '该公告已完成阅读，你可以继续查看完整正文内容。'
                    : '该公告尚未阅读，建议优先查看正文内容并及时确认。'
                }}
              </p>

              <div class="detail-meta-inline">
                <span class="detail-meta-inline__item">
                  <span class="meta-label">发布时间</span>
                  <span class="meta-value">{{ detail.publishTime || '-' }}</span>
                </span>
                <span v-if="detail.expireTime" class="detail-meta-inline__item">
                  <span class="meta-label">过期时间</span>
                  <span class="meta-value">{{ detail.expireTime }}</span>
                </span>
                <span class="detail-meta-inline__item">
                  <span class="meta-label">已读时间</span>
                  <span class="meta-value">{{ detail.readTime || '-' }}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-content-card" :class="{ 'is-unread': !detail.readFlag }">
          <div class="detail-content-card__head">公告正文</div>
          <div class="detail-content" v-html="detail.noticeContent"></div>
        </section>
      </template>

      <ElEmpty v-else description="暂无公告详情" :image-size="120" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { fetchGetUserNoticeDetail, fetchReadUserNotice } from '@/api/user-notice'
  import { useDict } from '@/utils/dict'
  import { mittBus } from '@/utils/sys'

  defineOptions({ name: 'UserNoticeDetail' })

  const route = useRoute()
  const router = useRouter()
  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'

  const loading = ref(false)
  const readLoading = ref(false)
  const detail = ref<Api.UserNotice.UserNoticeDetailVo>()

  const noticeId = computed(() => {
    const rawId = route.params.id
    const value = Array.isArray(rawId) ? rawId[0] : rawId
    const parsedId = Number(value)
    return Number.isFinite(parsedId) ? parsedId : 0
  })

  const loadDetail = async () => {
    if (!noticeId.value) {
      detail.value = undefined
      return
    }

    loading.value = true

    try {
      detail.value = await fetchGetUserNoticeDetail(noticeId.value)
    } finally {
      loading.value = false
    }
  }

  const handleRead = async () => {
    if (!noticeId.value || !detail.value || detail.value.readFlag) {
      return
    }

    readLoading.value = true

    try {
      await fetchReadUserNotice(noticeId.value)
      mittBus.emit('refreshNoticeUnread')
      ElMessage.success('已标记为已读')
      await loadDetail()
    } finally {
      readLoading.value = false
    }
  }

  const goBack = () => {
    router.push({ name: 'UserNotice' })
  }

  watch(
    () => noticeId.value,
    async () => {
      await loadDetail()
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .user-notice-detail-page {
    .detail-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    .detail-back-button {
      padding-left: 0;
      font-weight: 500;
      color: var(--art-text-gray-700);
    }

    .detail-main {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 14px;
    }

    .detail-hero {
      padding: 20px;
      border: 1px solid var(--art-card-border);
      border-radius: var(--custom-radius);
    }

    .detail-hero__body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .detail-hero__top {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }

    .detail-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .detail-read-button {
      flex-shrink: 0;
    }

    .detail-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.45;
      color: var(--art-text-gray-900);
      overflow-wrap: break-word;
    }

    .detail-subtitle {
      flex: 1;
      min-width: 260px;
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
      color: var(--art-text-gray-500);
    }

    .detail-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      align-items: center;
      justify-content: space-between;
    }

    .detail-meta-inline {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .detail-meta-inline__item {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      min-width: 0;
      padding: 0;
    }

    .meta-label {
      font-size: 12px;
      line-height: 1.5;
      color: var(--art-text-gray-500);
    }

    .meta-value {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
      color: var(--art-text-gray-900);
      overflow-wrap: anywhere;
    }

    .detail-content-card {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 20px;
      border: 1px solid var(--art-card-border);
      border-radius: var(--custom-radius);
    }

    .detail-content-card__head {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.5;
      color: var(--art-text-gray-900);
    }

    .detail-content {
      flex: 1;
      min-height: 220px;
      padding: 18px 20px;
      line-height: 1.9;
      overflow-wrap: break-word;
      background: var(--el-fill-color-lighter);
      border-radius: calc(var(--custom-radius) - 2px);

      :deep(p:first-child) {
        margin-top: 0;
      }

      :deep(p:last-child) {
        margin-bottom: 0;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: calc(var(--custom-radius) - 6px);
      }
    }
  }

  @media screen and (width <= 992px) {
    .user-notice-detail-page {
      .detail-summary {
        align-items: flex-start;
      }

      .detail-meta-inline {
        justify-content: flex-start;
      }
    }
  }

  @media screen and (width <= 768px) {
    .user-notice-detail-page {
      .detail-toolbar {
        align-items: flex-start;
      }

      .detail-hero__top {
        flex-direction: column;
        align-items: flex-start;
      }

      .detail-hero,
      .detail-content-card {
        padding: 16px;
      }

      .detail-title {
        font-size: 22px;
      }

      .detail-meta-inline {
        flex-direction: column;
        width: 100%;
      }

      .detail-content {
        padding: 14px 16px;
      }
    }
  }
</style>
