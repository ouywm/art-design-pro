<!-- 在线用户页面 -->
<template>
  <div class="online-page art-full-height">
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
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
  </div>
</template>

<script setup lang="ts">
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { fetchGetOnlineUserList, fetchKickOnlineDevice, fetchKickOnlineUser } from '@/api/online'
  import { useTable } from '@/hooks/core/useTable'
  import defaultAvatar from '@imgs/user/avatar.webp'
  import { ElImage, ElMessage, ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Online' })

  type OnlineUserListItem = Api.Online.OnlineUserListItem

  const DEVICE_TAG_TYPE_MAP: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    web: 'primary',
    pc: 'primary',
    windows: 'primary',
    mac: 'primary',
    ios: 'success',
    iphone: 'success',
    ipad: 'success',
    android: 'warning'
  }

  const getDeviceTagType = (
    device: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const normalizedDevice = device.trim().toLowerCase()

    for (const [keyword, tagType] of Object.entries(DEVICE_TAG_TYPE_MAP)) {
      if (normalizedDevice.includes(keyword)) {
        return tagType
      }
    }

    return 'info'
  }

  const formatLoginTime = (timestamp: number): string => {
    if (!timestamp) {
      return '-'
    }

    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    return date.toLocaleString('zh-CN', { hour12: false })
  }

  const getDisplayName = (row: OnlineUserListItem): string => {
    return row.nickName || row.userName
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    refreshData,
    refreshRemove,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetOnlineUserList,
      apiParams: {
        page: 1,
        size: 20
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userInfo',
          label: '用户信息',
          minWidth: 260,
          formatter: (row: OnlineUserListItem) => {
            const avatarSrc = row.avatar || defaultAvatar

            return h('div', { class: 'user-info flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: avatarSrc,
                previewSrcList: row.avatar ? [row.avatar] : undefined,
                previewTeleported: true
              }),
              h('div', { class: 'ml-2 min-w-0' }, [
                h('p', { class: 'user-name' }, getDisplayName(row)),
                h('p', { class: 'user-account' }, row.userName)
              ])
            ])
          }
        },
        {
          prop: 'device',
          label: '设备类型',
          width: 120,
          formatter: (row: OnlineUserListItem) => {
            return h(ElTag, { type: getDeviceTagType(row.device) }, () => row.device)
          }
        },
        {
          prop: 'loginIp',
          label: '登录IP',
          width: 150
        },
        {
          prop: 'loginLocation',
          label: '登录地点',
          minWidth: 160,
          formatter: (row: OnlineUserListItem) => row.loginLocation || '-'
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 180,
          sortable: true,
          formatter: (row: OnlineUserListItem) => formatLoginTime(row.loginTime)
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: OnlineUserListItem) =>
            h('div', [
              h(ArtButtonMore, {
                list: [
                  {
                    key: 'kick-device',
                    label: '踢下当前设备',
                    icon: 'ri:smartphone-line',
                    color: '#e6a23c'
                  },
                  {
                    key: 'kick-user',
                    label: '强制用户下线',
                    icon: 'ri:logout-box-r-line',
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

  const handleKickDevice = async (row: OnlineUserListItem): Promise<void> => {
    const confirmed = await ElMessageBox.confirm(
      `确定将用户"${getDisplayName(row)}"的 ${row.device} 设备踢下线吗？`,
      '踢下设备',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(
      () => true,
      () => false
    )

    if (!confirmed) {
      return
    }

    await fetchKickOnlineDevice(row.loginId, row.device)
    ElMessage.success('设备已踢下线')
    refreshRemove()
  }

  const handleKickUser = async (row: OnlineUserListItem): Promise<void> => {
    const confirmed = await ElMessageBox.confirm(
      `确定强制用户"${getDisplayName(row)}"下线吗？该用户的所有在线设备都会失效。`,
      '强制下线',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(
      () => true,
      () => false
    )

    if (!confirmed) {
      return
    }

    await fetchKickOnlineUser(row.loginId)
    ElMessage.success('用户已强制下线')
    refreshRemove()
  }

  const handleMoreClick = (item: ButtonMoreItem, row: OnlineUserListItem): void => {
    switch (item.key) {
      case 'kick-device':
        void handleKickDevice(row)
        break
      case 'kick-user':
        void handleKickUser(row)
        break
    }
  }
</script>

<style scoped lang="scss">
  .online-page {
    .user-info {
      min-width: 0;
    }

    .user-name,
    .user-account {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-name {
      font-weight: 600;
      line-height: 1.4;
      color: var(--art-text-gray-900);
    }

    .user-account {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.4;
      color: var(--art-text-gray-500);
    }
  }
</style>
