<template>
  <ElDialog
    v-model="visible"
    title="公告详情"
    :width="dialogWidth"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="公告标题" :span="2">
          {{ detail?.noticeTitle || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="公告级别">
          <ElTag
            v-if="detail"
            :type="getDictTagType(NOTICE_LEVEL_DICT, detail.noticeLevel)"
            size="small"
          >
            {{ getDictLabel(NOTICE_LEVEL_DICT, detail.noticeLevel) }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="公告范围">
          <ElTag
            v-if="detail"
            :type="getDictTagType(NOTICE_SCOPE_DICT, detail.noticeScope)"
            size="small"
          >
            {{ getDictLabel(NOTICE_SCOPE_DICT, detail.noticeScope) }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="发布状态">
          <ElTag
            v-if="detail"
            :type="getDictTagType(NOTICE_PUBLISH_STATUS_DICT, detail.publishStatus)"
            size="small"
          >
            {{ getDictLabel(NOTICE_PUBLISH_STATUS_DICT, detail.publishStatus) }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="置顶状态">
          <ElTag v-if="detail" :type="detail.pinned ? 'danger' : 'info'" size="small">
            {{ detail.pinned ? '已置顶' : '未置顶' }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="启用状态">
          <ElTag v-if="detail" :type="detail.enabled ? 'success' : 'warning'" size="small">
            {{ detail.enabled ? '启用' : '停用' }}
          </ElTag>
          <span v-else>-</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="排序">{{ detail?.sort ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="发布人">{{ detail?.publishBy || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="发布时间">{{ detail?.publishTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="过期时间">{{ detail?.expireTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建人">{{ detail?.createBy || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新人">{{ detail?.updateBy || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ detail?.updateTime || '-' }}</ElDescriptionsItem>

        <ElDescriptionsItem
          v-if="detail?.noticeScope === NOTICE_SCOPE_ROLE"
          label="目标角色"
          :span="2"
        >
          <div v-if="detail.targetRoles.length > 0" class="tag-list">
            <ElTag v-for="item in detail.targetRoles" :key="item.roleId" effect="plain">
              {{ item.roleName }} ({{ item.roleCode }})
            </ElTag>
          </div>
          <span v-else>-</span>
        </ElDescriptionsItem>

        <ElDescriptionsItem
          v-if="detail?.noticeScope === NOTICE_SCOPE_USER"
          label="目标用户"
          :span="2"
        >
          <div v-if="detail.targetUsers.length > 0" class="tag-list">
            <ElTag v-for="item in detail.targetUsers" :key="item.userId" effect="plain">
              {{ item.nickName || item.userName }} ({{ item.userName }})
            </ElTag>
          </div>
          <span v-else>-</span>
        </ElDescriptionsItem>

        <ElDescriptionsItem label="备注" :span="2">
          {{ detail?.remark || '-' }}
        </ElDescriptionsItem>

        <ElDescriptionsItem label="公告正文" :span="2">
          <div
            v-if="detail?.noticeContent"
            class="notice-content"
            v-html="detail.noticeContent"
          ></div>
          <span v-else>-</span>
        </ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { fetchGetNoticeDetail } from '@/api/notice'
  import { useDict } from '@/utils/dict'

  interface Props {
    modelValue: boolean
    noticeId?: number
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  const { getDictLabel, getDictTagType } = useDict()
  const NOTICE_LEVEL_DICT = 'notice_level'
  const NOTICE_SCOPE_DICT = 'notice_scope'
  const NOTICE_PUBLISH_STATUS_DICT = 'notice_publish_status'

  const { width } = useWindowSize()
  const NOTICE_SCOPE_ROLE: Api.Notice.NoticeScope = 2
  const NOTICE_SCOPE_USER: Api.Notice.NoticeScope = 3

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const dialogWidth = computed(() => (width.value < 992 ? '92%' : '900px'))
  const loading = ref(false)
  const detail = ref<Api.Notice.NoticeDetailVo>()

  const loadDetail = async (noticeId: number) => {
    loading.value = true
    try {
      detail.value = await fetchGetNoticeDetail(noticeId)
    } finally {
      loading.value = false
    }
  }

  watch(visible, async (dialogVisible) => {
    if (dialogVisible && props.noticeId) {
      await loadDetail(props.noticeId)
    }
  })

  watch(
    () => props.noticeId,
    async (noticeId) => {
      if (visible.value && noticeId) {
        await loadDetail(noticeId)
      }
    }
  )

  const handleClose = () => {
    detail.value = undefined
  }
</script>

<style scoped lang="scss">
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .notice-content {
    min-height: 120px;
    padding: 14px 16px;
    line-height: 1.7;
    overflow-wrap: break-word;
    background: var(--el-fill-color-light);
    border-radius: var(--custom-radius);

    :deep(p:first-child) {
      margin-top: 0;
    }

    :deep(p:last-child) {
      margin-bottom: 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: calc(var(--custom-radius) - 4px);
    }
  }
</style>
