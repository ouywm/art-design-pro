<template>
  <div class="art-full-height">
    <ShowcaseProfileSearch
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
            <ElButton @click="showFormPanel('add')" v-ripple>新增展示档案</ElButton>
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
      />
    </ElCard>

    <ShowcaseProfileFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :showcase-profile-data="currentShowcaseProfileData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetShowcaseProfileList, fetchDeleteShowcaseProfile } from '@/api/showcase-profile'
  import type { ShowcaseProfileListItem, SearchFormModel } from './types'
  import ShowcaseProfileSearch from './modules/showcase-profile-search.vue'
  import ShowcaseProfileFormPanel from './modules/showcase-profile-form-panel.vue'
  import { ElMessage, ElMessageBox, ElTag, ElImage } from 'element-plus'
  import { useDict, dictClassToTagType } from '@/utils/dict'
  import defaultAvatar from '@imgs/user/avatar.webp'

  defineOptions({ name: 'ShowcaseProfile' })

  const { getDictLabel, getDictClass } = useDict()

  const searchForm = ref<SearchFormModel>({
    contactGender: undefined,
    status: undefined,
    featured: undefined,
    createdAtRange: undefined,
    launchAtRange: undefined,
    publishDateRange: undefined,
    updatedAtRange: undefined,
    contactEmail: undefined,
    contactName: undefined,
    contactPhone: undefined,
    showcaseCode: undefined,
    title: undefined,
    officialUrl: undefined,
    priority: undefined,
    score: undefined,
    serviceTime: undefined
  })

  const showSearchBar = ref(false)
  const formPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const currentShowcaseProfileData = ref<ShowcaseProfileListItem | undefined>(undefined)

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
      apiFn: fetchGetShowcaseProfileList,
      apiParams: {
        page: 1,
        size: 20
      },
      excludeParams: ['createdAtRange', 'launchAtRange', 'publishDateRange', 'updatedAtRange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '主键',
          width: 120,
          sortable: true
        },
        {
          prop: 'showcaseCode',
          label: '展示编码',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'title',
          label: '标题',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'avatar',
          label: '头像',
          width: 96,
          formatter: (row) => {
            const src = row.avatar || defaultAvatar
            return h(ElImage, {
              class: 'size-10 rounded-md',
              src,
              fit: 'cover',
              previewSrcList: row.avatar ? [row.avatar] : undefined,
              previewTeleported: true
            })
          }
        },
        {
          prop: 'coverImage',
          label: '封面图片',
          width: 96,
          formatter: (row) => {
            const src = row.coverImage
            if (!src) return '-'
            return h(ElImage, {
              class: 'size-10 rounded-md',
              src,
              fit: 'cover',
              previewSrcList: row.coverImage ? [row.coverImage] : undefined,
              previewTeleported: true
            })
          }
        },
        {
          prop: 'contactName',
          label: '联系人',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'contactGender',
          label: '联系人性别',
          formatter: (row) => {
            const label = getDictLabel('showcase_gender', row.contactGender)
            const listClass = getDictClass('showcase_gender', row.contactGender)
            const type = dictClassToTagType(listClass)
            return h(ElTag, { type }, () => label)
          }
        },
        {
          prop: 'contactPhone',
          label: '联系电话',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'contactEmail',
          label: '联系邮箱',
          minWidth: 140,
          showOverflowTooltip: true,
          formatter: (row) => {
            if (!row.contactEmail) return '-'
            return h(
              'a',
              {
                href: `mailto:${row.contactEmail}`,
                target: '_blank',
                rel: 'noreferrer',
                class: 'text-primary'
              },
              row.contactEmail
            )
          }
        },
        {
          prop: 'officialUrl',
          label: '官网链接',
          width: 220,
          formatter: (row) => {
            if (!row.officialUrl) return '-'
            return h(
              'a',
              {
                href: row.officialUrl,
                target: '_blank',
                rel: 'noreferrer',
                class: 'text-primary'
              },
              row.officialUrl
            )
          }
        },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const label = getDictLabel('showcase_status', row.status)
            const listClass = getDictClass('showcase_status', row.status)
            const type = dictClassToTagType(listClass)
            return h(ElTag, { type }, () => label)
          }
        },
        {
          prop: 'featured',
          label: '推荐',
          width: 110,
          sortable: true,
          formatter: (row) =>
            h(ElTag, { type: row.featured ? 'success' : 'warning' }, () =>
              row.featured ? '是' : '否'
            )
        },
        {
          prop: 'priority',
          label: '优先级',
          width: 120,
          sortable: true
        },
        {
          prop: 'score',
          label: '评分',
          width: 120,
          sortable: true
        },
        {
          prop: 'publishDate',
          label: '发布日期',
          width: 140,
          sortable: true
        },
        {
          prop: 'launchAt',
          label: '上线时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'serviceTime',
          label: '服务时间',
          width: 120,
          sortable: true
        },
        {
          prop: 'attachmentUrl',
          label: '附件',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'description',
          label: '描述',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'extraNotes',
          label: '备注',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'createdAt',
          label: '创建时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'updatedAt',
          label: '更新时间',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'edit',
                    label: '编辑展示档案',
                    icon: 'ri:edit-2-line'
                  },
                  {
                    key: 'delete',
                    label: '删除展示档案',
                    icon: 'ri:delete-bin-4-line',
                    color: '#f56c6c'
                  }
                ],
                onClick: (item: ButtonMoreItem) => handleMoreClick(item, row)
              })
            ])
        }
      ]
    }
  })

  const showFormPanel = (type: 'add' | 'edit', row?: ShowcaseProfileListItem) => {
    formPanelMode.value = type
    currentShowcaseProfileData.value = row
    formPanelVisible.value = true
  }

  const handleSearch = (params: SearchFormModel) => {
    const nextParams = { ...params }
    const createdAtRange = nextParams.createdAtRange
    delete nextParams.createdAtRange
    const [createdAtStart, createdAtEnd] = Array.isArray(createdAtRange)
      ? createdAtRange
      : [undefined, undefined]
    const launchAtRange = nextParams.launchAtRange
    delete nextParams.launchAtRange
    const [launchAtStart, launchAtEnd] = Array.isArray(launchAtRange)
      ? launchAtRange
      : [undefined, undefined]
    const publishDateRange = nextParams.publishDateRange
    delete nextParams.publishDateRange
    const [publishDateStart, publishDateEnd] = Array.isArray(publishDateRange)
      ? publishDateRange
      : [undefined, undefined]
    const updatedAtRange = nextParams.updatedAtRange
    delete nextParams.updatedAtRange
    const [updatedAtStart, updatedAtEnd] = Array.isArray(updatedAtRange)
      ? updatedAtRange
      : [undefined, undefined]
    Object.assign(
      searchParams,
      nextParams,
      {
        createdAtStart: createdAtStart,
        createdAtEnd: createdAtEnd
      },
      {
        launchAtStart: launchAtStart,
        launchAtEnd: launchAtEnd
      },
      {
        publishDateStart: publishDateStart,
        publishDateEnd: publishDateEnd
      },
      {
        updatedAtStart: updatedAtStart,
        updatedAtEnd: updatedAtEnd
      }
    )
    getData()
  }

  const handleMoreClick = (item: ButtonMoreItem, row: ShowcaseProfileListItem) => {
    switch (item.key) {
      case 'edit':
        showFormPanel('edit', row)
        break
      case 'delete':
        handleDelete(row)
        break
    }
  }

  const handleDelete = (row: ShowcaseProfileListItem) => {
    ElMessageBox.confirm(`确定删除展示档案"${row.title}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await fetchDeleteShowcaseProfile(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
