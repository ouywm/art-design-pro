<template>
  <div class="notice-page art-full-height">
    <NoticeSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>
              新增系统公告
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <NoticeFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :notice-data="currentNoticeData"
      @success="handleFormSuccess"
    />

    <NoticeDetailDialog v-model="detailVisible" :notice-id="currentNoticeId" />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchDeleteNotice,
    fetchGetNoticeList,
    fetchPinNotice,
    fetchPublishNotice,
    fetchRevokeNotice,
    fetchUnpinNotice
  } from '@/api/notice'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useDict } from '@/utils/dict'
  import { mittBus } from '@/utils/sys'
  import type { NoticeListItem, NoticeSearchFormModel } from './types'
  import NoticeDetailDialog from './modules/notice-detail-dialog.vue'
  import NoticeFormPanel from './modules/notice-form-panel.vue'
  import NoticeSearch from './modules/notice-search.vue'

  defineOptions({ name: 'Notice' })

  const createDefaultSearchForm = (): NoticeSearchFormModel => ({
    noticeTitle: undefined,
    noticeLevel: undefined,
    noticeScope: undefined,
    publishStatus: undefined,
    pinned: undefined,
    enabled: undefined,
    publishTimeRange: undefined,
    createTimeRange: undefined
  })

  const searchForm = ref<NoticeSearchFormModel>(createDefaultSearchForm())
  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const detailVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentNoticeData = ref<NoticeListItem | undefined>(undefined)
  const currentNoticeId = ref<number>()
  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'
  const NOTICE_SCOPE_DICT = 'notice_scope'
  const NOTICE_PUBLISH_STATUS_DICT = 'notice_publish_status'

  const PUBLISH_STATUS_PUBLISHED: Api.Notice.PublishStatus = 2

  const {
    columns,
    columnChecks,
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
      apiFn: fetchGetNoticeList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['publishTimeRange', 'createTimeRange'],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'noticeTitle',
          label: '公告信息',
          minWidth: 320,
          showOverflowTooltip: false,
          formatter: (row: NoticeListItem) => {
            const children = []

            if (row.pinned) {
              children.push(
                h(
                  ElTag,
                  {
                    type: 'danger',
                    size: 'small',
                    effect: 'plain',
                    class: 'notice-pinned-tag'
                  },
                  () => '置顶'
                )
              )
            }

            children.push(
              h(
                'span',
                {
                  class: 'notice-title-text',
                  onClick: () => showDetail(row)
                },
                row.noticeTitle
              )
            )

            return h('div', { class: 'notice-title-cell' }, [
              h('div', { class: 'notice-title-row' }, children),
              h('p', { class: 'notice-subtext' }, row.remark || '暂无备注')
            ])
          }
        },
        {
          prop: 'noticeLevel',
          label: '公告级别',
          width: 100,
          formatter: (row: NoticeListItem) =>
            h(
              ElTag,
              { type: getDictTagType(NOTICE_LEVEL_DICT, row.noticeLevel), size: 'small' },
              () => getDictLabel(NOTICE_LEVEL_DICT, row.noticeLevel)
            )
        },
        {
          prop: 'noticeScope',
          label: '公告范围',
          width: 120,
          formatter: (row: NoticeListItem) =>
            h(
              ElTag,
              { type: getDictTagType(NOTICE_SCOPE_DICT, row.noticeScope), size: 'small' },
              () => getDictLabel(NOTICE_SCOPE_DICT, row.noticeScope)
            )
        },
        {
          prop: 'publishStatus',
          label: '发布状态',
          width: 100,
          formatter: (row: NoticeListItem) =>
            h(
              ElTag,
              {
                type: getDictTagType(NOTICE_PUBLISH_STATUS_DICT, row.publishStatus),
                size: 'small'
              },
              () => getDictLabel(NOTICE_PUBLISH_STATUS_DICT, row.publishStatus)
            )
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 90,
          formatter: (row: NoticeListItem) =>
            h(ElTag, { type: row.enabled ? 'success' : 'warning', size: 'small' }, () =>
              row.enabled ? '启用' : '停用'
            )
        },
        {
          prop: 'publishInfo',
          label: '发布信息',
          minWidth: 180,
          formatter: (row: NoticeListItem) =>
            h('div', { class: 'notice-meta-cell' }, [
              h('p', { class: 'notice-meta-primary' }, row.publishBy || '-'),
              h('p', { class: 'notice-meta-secondary' }, row.publishTime || '未发布')
            ])
        },
        {
          prop: 'expireTime',
          label: '过期时间',
          width: 180,
          formatter: (row: NoticeListItem) => row.expireTime || '-'
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: NoticeListItem) =>
            h('div', [
              h(ArtButtonMore, {
                list: getActionList(row),
                onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
              })
            ])
        }
      ]
    }
  })

  const getActionList = (row: NoticeListItem) => {
    const actionList = [
      {
        key: 'detail',
        label: '查看详情',
        icon: 'ri:eye-line'
      },
      {
        key: 'edit',
        label: '编辑公告',
        icon: 'ri:edit-2-line'
      },
      row.publishStatus === PUBLISH_STATUS_PUBLISHED
        ? {
            key: 'revoke',
            label: '撤回公告',
            icon: 'ri:reply-line',
            color: '#e6a23c'
          }
        : {
            key: 'publish',
            label: '发布公告',
            icon: 'ri:send-plane-line',
            color: '#67c23a'
          },
      row.pinned
        ? {
            key: 'unpin',
            label: '取消置顶',
            icon: 'ri:pushpin-2-line'
          }
        : {
            key: 'pin',
            label: '置顶公告',
            icon: 'ri:pushpin-line'
          },
      {
        key: 'delete',
        label: '删除公告',
        icon: 'ri:delete-bin-4-line',
        color: '#f56c6c'
      }
    ]

    return actionList
  }

  const showFormPanel = (mode: 'add' | 'edit', row?: NoticeListItem) => {
    formPanelMode.value = mode
    currentNoticeData.value = row
    formPanelVisible.value = true
  }

  const showDetail = (row: NoticeListItem) => {
    currentNoticeId.value = row.id
    detailVisible.value = true
  }

  const handleSearch = (params: NoticeSearchFormModel) => {
    const { publishTimeRange, createTimeRange, ...filters } = params

    const [publishTimeStart, publishTimeEnd] = Array.isArray(publishTimeRange)
      ? publishTimeRange
      : [undefined, undefined]
    const [createTimeStart, createTimeEnd] = Array.isArray(createTimeRange)
      ? createTimeRange
      : [undefined, undefined]

    Object.assign(searchParams, filters, {
      publishTimeStart,
      publishTimeEnd,
      createTimeStart,
      createTimeEnd
    })
    getData()
  }

  const handleFormSuccess = () => {
    currentNoticeData.value = undefined
    refreshData()
  }

  const handleDelete = (row: NoticeListItem) => {
    ElMessageBox.confirm(`确定要删除公告「${row.noticeTitle}」吗？`, '删除公告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteNotice(row.id)
      mittBus.emit('refreshNoticeUnread')
      ElMessage.success('删除成功')
      refreshData()
    })
  }

  const handlePublish = async (row: NoticeListItem) => {
    await fetchPublishNotice(row.id)
    mittBus.emit('refreshNoticeUnread')
    ElMessage.success('发布成功')
    refreshData()
  }

  const handleRevoke = async (row: NoticeListItem) => {
    await fetchRevokeNotice(row.id)
    mittBus.emit('refreshNoticeUnread')
    ElMessage.success('撤回成功')
    refreshData()
  }

  const handlePin = async (row: NoticeListItem) => {
    await fetchPinNotice(row.id)
    ElMessage.success('置顶成功')
    refreshData()
  }

  const handleUnpin = async (row: NoticeListItem) => {
    await fetchUnpinNotice(row.id)
    ElMessage.success('已取消置顶')
    refreshData()
  }

  const handleMoreClick = (item: ButtonMoreItem, row: NoticeListItem) => {
    switch (item.key) {
      case 'detail':
        showDetail(row)
        break
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'publish':
        void handlePublish(row)
        break
      case 'revoke':
        void handleRevoke(row)
        break
      case 'pin':
        void handlePin(row)
        break
      case 'unpin':
        void handleUnpin(row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }
</script>

<style scoped lang="scss">
  .notice-page {
    .notice-title-cell,
    .notice-meta-cell {
      width: 100%;
      min-width: 0;
    }

    .notice-title-row {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .notice-title-text {
      display: block;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      font-weight: 600;
      color: var(--el-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    .notice-title-text:hover {
      text-decoration: underline;
    }

    .notice-subtext,
    .notice-meta-primary,
    .notice-meta-secondary {
      display: block;
      width: 100%;
      min-width: 0;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notice-subtext,
    .notice-meta-secondary {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }

    .notice-meta-primary {
      font-weight: 600;
      line-height: 1.4;
      color: var(--art-text-gray-900);
    }
  }
</style>
