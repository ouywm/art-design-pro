<template>
  <div class="user-notice-page page-content art-page-view">
    <NoticeInboxSidebar
      v-model="keyword"
      v-model:filter="filterMode"
      :notices="data"
      :selected-id="selectedNoticeId"
      :loading="loading"
      :total="pagination.total"
      :notice-total="noticeTotal"
      :unread-count="unreadCount"
      :current-page="pagination.page"
      :page-size="pagination.size"
      :all-read-loading="allReadLoading"
      @search="handleSearch"
      @select="handleSelectNotice"
      @read-all="handleReadAll"
      @page-change="handleCurrentChange"
    />

    <NoticeInboxDetail
      :detail="selectedNoticeDetail"
      :loading="detailLoading"
      @manage="goNoticeManage"
      @open-detail="goIndependentDetail"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useRoute, useRouter } from 'vue-router'
  import {
    fetchGetUserNoticeDetail,
    fetchGetUserNoticeList,
    fetchGetUserNoticeUnreadCount,
    fetchReadAllUserNotice,
    fetchReadUserNotice
  } from '@/api/user-notice'
  import { useTable } from '@/hooks/core/useTable'
  import NoticeInboxDetail from './modules/notice-inbox-detail.vue'
  import NoticeInboxSidebar from './modules/notice-inbox-sidebar.vue'
  import type {
    UserNoticeFilterMode,
    UserNoticeInboxDetail,
    UserNoticeListItem,
    UserNoticeSearchFormModel
  } from './types'

  defineOptions({ name: 'UserNotice' })

  const route = useRoute()
  const router = useRouter()

  const keyword = ref('')
  const filterMode = ref<UserNoticeFilterMode>('all')
  const selectedNoticeId = ref<number>()
  const selectedNoticeDetail = ref<UserNoticeInboxDetail>()
  const detailLoading = ref(false)
  const allReadLoading = ref(false)
  const noticeTotal = ref(0)
  const unreadCount = ref(0)
  const hasActivated = ref(false)

  const {
    data,
    loading,
    pagination,
    getData,
    searchParams,
    handleCurrentChange,
    refreshData,
    refreshSoft
  } = useTable({
    core: {
      apiFn: fetchGetUserNoticeList,
      apiParams: {
        page: 1,
        size: 20
      }
    },
    hooks: {
      onSuccess: (items) => {
        syncSelectedNotice(items)
      }
    }
  })

  const queryNoticeId = computed(() => {
    const rawId = route.query.id
    const value = Array.isArray(rawId) ? rawId[0] : rawId
    const parsedId = Number(value)
    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined
  })

  const buildSearchParams = (): UserNoticeSearchFormModel => ({
    noticeTitle: keyword.value.trim() || undefined,
    readFlag: filterMode.value === 'unread' ? false : undefined
  })

  const getPaginationTotal = (response: Api.Common.PaginatedResponse<unknown>) => {
    const rawResponse = response as Api.Common.PaginatedResponse<unknown> & {
      total_elements?: number
      total?: number
    }

    return rawResponse.totalElements ?? rawResponse.total_elements ?? rawResponse.total ?? 0
  }

  const loadUnreadCount = async () => {
    const result = await fetchGetUserNoticeUnreadCount()
    unreadCount.value = result.unreadCount
  }

  const loadNoticeTotal = async () => {
    const result = await fetchGetUserNoticeList({
      page: 1,
      size: 1
    })

    noticeTotal.value = getPaginationTotal(result)
  }

  const syncSelectedNotice = (items: UserNoticeListItem[]) => {
    if (items.length === 0) {
      selectedNoticeId.value = undefined
      selectedNoticeDetail.value = undefined
      return
    }

    const matchedNotice = items.find((item) => item.id === queryNoticeId.value)
    const currentNotice = items.find((item) => item.id === selectedNoticeId.value)
    const nextNotice = matchedNotice || currentNotice || items[0]

    if (nextNotice && nextNotice.id !== selectedNoticeId.value) {
      void selectNotice(nextNotice, false)
    }
  }

  const selectNotice = async (notice: UserNoticeListItem, syncQuery = true) => {
    selectedNoticeId.value = notice.id

    if (syncQuery && queryNoticeId.value !== notice.id) {
      await router.replace({
        name: 'UserNotice',
        query: {
          ...route.query,
          id: notice.id
        }
      })
    }

    await loadNoticeDetail(notice)
  }

  const loadNoticeDetail = async (notice?: UserNoticeListItem) => {
    const noticeId = notice?.id || selectedNoticeId.value
    if (!noticeId) {
      selectedNoticeDetail.value = undefined
      return
    }

    detailLoading.value = true

    try {
      selectedNoticeDetail.value = await fetchGetUserNoticeDetail(noticeId)

      if (notice && !notice.readFlag) {
        await fetchReadUserNotice(noticeId)
        if (selectedNoticeDetail.value?.id === noticeId) {
          selectedNoticeDetail.value = {
            ...selectedNoticeDetail.value,
            readFlag: true
          }
        }
        await Promise.all([refreshSoft(), loadUnreadCount()])
      }
    } finally {
      detailLoading.value = false
    }
  }

  const handleSearch = async () => {
    Object.assign(searchParams, buildSearchParams())
    await getData()
    await loadUnreadCount()
  }

  const handleSelectNotice = async (notice: UserNoticeListItem) => {
    await selectNotice(notice)
  }

  const handleReadAll = async () => {
    allReadLoading.value = true

    try {
      await fetchReadAllUserNotice()
      ElMessage.success('已全部标记为已读')
      await Promise.all([refreshData(), loadUnreadCount()])
    } finally {
      allReadLoading.value = false
    }
  }

  const goNoticeManage = () => {
    router.push({ name: 'Notice' })
  }

  const goIndependentDetail = () => {
    if (!selectedNoticeId.value) {
      return
    }

    router.push({
      name: 'UserNoticeDetail',
      params: { id: selectedNoticeId.value }
    })
  }

  watch(
    () => queryNoticeId.value,
    (noticeId) => {
      if (!noticeId || noticeId === selectedNoticeId.value) {
        return
      }

      const notice = data.value.find((item) => item.id === noticeId)
      if (notice) {
        void selectNotice(notice, false)
      }
    }
  )

  onMounted(() => {
    void Promise.all([loadNoticeTotal(), loadUnreadCount()])
  })

  onActivated(() => {
    if (!hasActivated.value) {
      hasActivated.value = true
      return
    }

    void Promise.all([refreshData(), loadNoticeTotal(), loadUnreadCount()])
  })
</script>

<style scoped lang="scss">
  .user-notice-page {
    display: flex;
    height: 100%;
    min-height: calc(100vh - 119px);
    padding: 0 !important;
    overflow: hidden;
    background: var(--art-main-bg-color);
    border: 1px solid var(--art-card-border);
    border-radius: var(--custom-radius);
  }

  @media screen and (width <= 1024px) {
    .user-notice-page {
      flex-direction: column;
      overflow: auto;
    }
  }
</style>
