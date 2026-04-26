<template>
  <div class="art-full-height config-page">
    <ConfigSearch
      v-show="showSearchBar"
      v-model="searchForm"
      :group-options="configGroupOptions"
      :dict-type-options="dictTypeOptions"
      @search="handleSearch"
      @reset="handleResetSearch"
    />

    <ElCard class="art-table-card config-page-card" shadow="never">
      <ArtTableHeader
        v-model:showSearchBar="showSearchBar"
        layout="search,refresh,fullscreen"
        :loading="loading"
        @refresh="refreshPage"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showGroupFormPanel('add')" v-ripple>新增配置分组</ElButton>
            <ElButton type="primary" @click="showFormPanel('add')" v-ripple>
              新增系统参数配置
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <div v-loading="loading" class="config-layout">
        <aside class="config-sidebar">
          <div class="config-sidebar__search">
            <ElInput v-model="groupKeyword" placeholder="搜索分组" clearable size="default">
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
              </template>
            </ElInput>
          </div>

          <ul v-if="filteredSidebarSections.length" class="config-sidebar__list">
            <li
              v-for="section in filteredSidebarSections"
              :key="section.groupId"
              :class="['config-sidebar__item', { 'is-active': activeGroupId === section.groupId }]"
              @click="scrollToGroup(section.groupId)"
            >
              <ArtSvgIcon icon="ri:arrow-right-s-line" class="config-sidebar__arrow text-base" />
              <span class="config-sidebar__name truncate">{{ section.groupName }}</span>
              <span class="config-sidebar__count">{{ section.items.length }}</span>
            </li>
          </ul>
          <div v-else class="config-sidebar__empty">未匹配到分组</div>
        </aside>

        <div ref="mainRef" class="config-main">
          <template v-if="groupedConfigSections.length > 0">
            <section
              v-for="section in groupedConfigSections"
              :key="section.groupId"
              :ref="(el) => setSectionRef(el, section.groupId)"
              :id="`config-group-${section.groupId}`"
              class="config-group-section"
            >
              <div class="config-group-header">
                <div class="config-group-header__title">
                  <h3>{{ section.groupName }}</h3>
                  <span class="config-group-header__code">
                    {{ section.groupCode || '未设置分组编码' }}
                  </span>
                </div>
                <div class="config-group-header__actions">
                  <ElTag effect="plain" round type="info">{{ section.items.length }} 项</ElTag>
                  <ElButton
                    link
                    type="primary"
                    :disabled="!getGroupDataById(section.groupId)"
                    @click="showGroupFormPanel('edit', getGroupDataById(section.groupId))"
                  >
                    编辑
                  </ElButton>
                  <ElButton link type="danger" @click="handleDeleteGroup(section)"> 删除 </ElButton>
                </div>
              </div>

              <div class="config-item-grid">
                <article
                  v-for="item in section.items"
                  :key="item.id"
                  class="config-item-card"
                  :class="{ 'is-disabled': !item.enabled }"
                >
                  <div class="config-item-card__main">
                    <div class="config-item-card__heading">
                      <h4 class="config-item-card__title truncate" :title="item.configName">
                        {{ item.configName }}
                      </h4>
                      <div class="config-item-card__tags">
                        <ElTag size="small" :type="getValueTypeTagType(item.valueType)">
                          {{ getValueTypeLabel(item.valueType) }}
                        </ElTag>
                        <ElTag size="small" :type="item.enabled ? 'success' : 'info'">
                          {{ item.enabled ? '启用' : '停用' }}
                        </ElTag>
                        <ElTag v-if="item.isSystem" size="small" type="warning">内置</ElTag>
                      </div>
                    </div>

                    <p class="config-item-card__key truncate" :title="item.configKey">
                      {{ item.configKey }}
                    </p>

                    <div class="config-item-card__value">
                      <ConfigValueDisplay
                        compact
                        :value="item.configValue"
                        :value-type="item.valueType"
                        :option-dict-type="item.optionDictType"
                      />

                      <ElTooltip v-if="needMetaTooltip(item)" placement="top-end" :show-after="200">
                        <template #content>
                          <div class="config-item-meta-tip">
                            <div v-if="item.defaultValue">
                              <span class="label">默认值</span>
                              <span class="value">{{ item.defaultValue }}</span>
                            </div>
                            <div v-if="item.optionDictType">
                              <span class="label">候选字典</span>
                              <span class="value">{{ item.optionDictType }}</span>
                            </div>
                            <div v-if="item.remark">
                              <span class="label">备注</span>
                              <span class="value">{{ item.remark }}</span>
                            </div>
                          </div>
                        </template>
                        <ArtSvgIcon icon="ri:information-line" class="config-item-card__info" />
                      </ElTooltip>
                    </div>
                  </div>

                  <div class="config-item-card__actions">
                    <ElButton link type="primary" @click="showFormPanel('edit', item)">
                      编辑
                    </ElButton>
                    <ElButton link type="danger" @click="handleDelete(item)">删除</ElButton>
                  </div>
                </article>
              </div>
            </section>
          </template>

          <ElEmpty v-else description="暂无系统参数配置数据" :image-size="120" />
        </div>
      </div>
    </ElCard>

    <ConfigGroupFormPanel
      v-model="groupFormPanelVisible"
      :panel-mode="groupFormPanelMode"
      :group-data="currentGroupData"
      @success="handleGroupFormSuccess"
    />

    <ConfigFormPanel
      v-model="formPanelVisible"
      :panel-mode="formPanelMode"
      :config-data="currentConfigData"
      :group-options="configGroupOptions"
      :dict-type-options="dictTypeOptions"
      @success="handleConfigFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import {
    fetchDeleteConfig,
    fetchDeleteConfigGroup,
    fetchGetConfigGroupList,
    fetchGetGroupedConfigList
  } from '@/api/config'
  import { fetchGetDictTypeList } from '@/api/dict-manage'
  import { dictClassToTagType, useDict } from '@/utils/dict'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { CONFIG_VALUE_TYPE } from './constants'
  import type { ConfigGroupSection, ConfigListItem, SearchFormModel } from './types'
  import ConfigFormPanel from './modules/config-form-panel.vue'
  import ConfigGroupFormPanel from './modules/config-group-form-panel.vue'
  import ConfigSearch from './modules/config-search.vue'
  import ConfigValueDisplay from './modules/config-value-display.vue'

  defineOptions({ name: 'Config' })

  type ConfigGroupBlockVo = Api.Config.ConfigGroupBlockVo
  type ConfigGroupVo = Api.ConfigGroup.ConfigGroupVo
  type DictTypeVo = Api.SystemManage.DictTypeVo

  const { getDictClass, getDictLabel } = useDict()

  const createDefaultSearchForm = (): SearchFormModel => ({
    configName: undefined,
    configKey: undefined,
    configGroupId: undefined,
    valueType: undefined,
    optionDictType: undefined,
    enabled: undefined,
    isSystem: undefined
  })

  const showSearchBar = ref(false)
  const loading = ref(false)
  const formPanelVisible = ref(false)
  const groupFormPanelVisible = ref(false)
  const formPanelMode = ref<'add' | 'edit'>('add')
  const groupFormPanelMode = ref<'add' | 'edit'>('add')
  const currentConfigData = ref<ConfigListItem | undefined>(undefined)
  const currentGroupData = ref<ConfigGroupVo | undefined>(undefined)

  const searchForm = reactive<SearchFormModel>(createDefaultSearchForm())
  const groupedConfigBlocks = ref<Api.Config.ConfigGroupedList>([])
  const configGroupOptions = ref<ConfigGroupVo[]>([])
  const dictTypeOptions = ref<DictTypeVo[]>([])
  const configGroupMap = computed(() => {
    return new Map(configGroupOptions.value.map((item) => [item.id, item] as const))
  })

  // ==================== 布局：侧边导航 ====================
  const groupKeyword = ref('')
  const activeGroupId = ref<number | null>(null)
  const mainRef = ref<HTMLElement | null>(null)
  const sectionRefs = new Map<number, HTMLElement>()
  let observer: IntersectionObserver | null = null

  const setSectionRef = (el: Element | any, groupId: number) => {
    if (el instanceof HTMLElement) {
      sectionRefs.set(groupId, el)
    } else {
      sectionRefs.delete(groupId)
    }
  }

  const filteredSidebarSections = computed(() => {
    const kw = groupKeyword.value.trim().toLowerCase()
    if (!kw) return groupedConfigSections.value
    return groupedConfigSections.value.filter(
      (s) =>
        s.groupName.toLowerCase().includes(kw) || (s.groupCode ?? '').toLowerCase().includes(kw)
    )
  })

  const scrollToGroup = (groupId: number) => {
    const el = sectionRefs.get(groupId)
    if (!el) return
    activeGroupId.value = groupId
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rebuildObserver = async () => {
    await nextTick()
    observer?.disconnect()
    if (!mainRef.value) return
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const id = Number((visible.target as HTMLElement).id.replace('config-group-', ''))
          if (!Number.isNaN(id)) activeGroupId.value = id
        }
      },
      {
        root: mainRef.value,
        rootMargin: '0px 0px -60% 0px',
        threshold: [0, 0.2, 0.5, 1]
      }
    )
    sectionRefs.forEach((el) => observer?.observe(el))
  }

  // ==================== 数据排序 / 结构化 ====================
  const sortConfigGroups = (left: ConfigGroupVo, right: ConfigGroupVo): number => {
    if (left.groupSort !== right.groupSort) {
      return left.groupSort - right.groupSort
    }

    const nameResult = left.groupName.localeCompare(right.groupName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.id - right.id
  }

  const sortDictTypes = (left: DictTypeVo, right: DictTypeVo): number => {
    const nameResult = left.dictName.localeCompare(right.dictName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.id - right.id
  }

  const sortConfigItems = (
    left: Api.Config.ConfigGroupItemVo,
    right: Api.Config.ConfigGroupItemVo
  ): number => {
    if (left.configSort !== right.configSort) {
      return left.configSort - right.configSort
    }

    return left.id - right.id
  }

  const sortConfigBlocks = (left: ConfigGroupBlockVo, right: ConfigGroupBlockVo): number => {
    if (left.groupSort !== right.groupSort) {
      return left.groupSort - right.groupSort
    }

    const nameResult = left.groupName.localeCompare(right.groupName, 'zh-Hans-CN')
    if (nameResult !== 0) {
      return nameResult
    }

    return left.groupId - right.groupId
  }

  const mapConfigItem = (
    block: ConfigGroupBlockVo,
    item: Api.Config.ConfigGroupItemVo
  ): ConfigListItem => ({
    ...item,
    configGroupId: block.groupId,
    configGroupName: block.groupName,
    configGroupCode: block.groupCode
  })

  const groupedConfigSections = computed<ConfigGroupSection[]>(() => {
    return [...groupedConfigBlocks.value].sort(sortConfigBlocks).map((block) => ({
      groupId: block.groupId,
      groupName: block.groupName,
      groupCode: block.groupCode,
      groupSort: block.groupSort,
      items: [...block.items].sort(sortConfigItems).map((item) => mapConfigItem(block, item))
    }))
  })

  watch(
    groupedConfigSections,
    (list) => {
      if (list.length && activeGroupId.value == null) {
        activeGroupId.value = list[0].groupId
      }
      if (list.length && !list.find((s) => s.groupId === activeGroupId.value)) {
        activeGroupId.value = list[0].groupId
      }
      rebuildObserver()
    },
    { flush: 'post' }
  )

  const needMetaTooltip = (item: ConfigListItem) => {
    return Boolean(
      item.remark ||
        (item.optionDictType && item.valueType !== CONFIG_VALUE_TYPE.IMAGE) ||
        (item.defaultValue && item.defaultValue !== item.configValue)
    )
  }

  // ==================== 数据加载 ====================
  const loadFilterOptions = async () => {
    const [groupResponse, dictTypeResponse] = await Promise.all([
      fetchGetConfigGroupList({ page: 1, size: 1000 }),
      fetchGetDictTypeList({ page: 1, size: 1000 })
    ])

    configGroupOptions.value = [...groupResponse.content].sort(sortConfigGroups)
    dictTypeOptions.value = [...dictTypeResponse.content].sort(sortDictTypes)
  }

  const loadConfigData = async () => {
    loading.value = true
    try {
      groupedConfigBlocks.value = await fetchGetGroupedConfigList({ ...searchForm })
    } finally {
      loading.value = false
    }
  }

  const refreshPage = async () => {
    await Promise.all([loadFilterOptions(), loadConfigData()])
  }

  const getValueTypeLabel = (valueType: ConfigListItem['valueType']) => {
    return getDictLabel('config_value_type', valueType)
  }

  const getValueTypeTagType = (valueType: ConfigListItem['valueType']) => {
    return dictClassToTagType(getDictClass('config_value_type', valueType))
  }

  const getGroupDataById = (groupId: number): ConfigGroupVo | undefined => {
    return configGroupMap.value.get(groupId)
  }

  const showGroupFormPanel = (type: 'add' | 'edit', row?: ConfigGroupVo) => {
    groupFormPanelMode.value = type
    currentGroupData.value = row
    groupFormPanelVisible.value = true
  }

  const showFormPanel = (type: 'add' | 'edit', row?: ConfigListItem) => {
    formPanelMode.value = type
    currentConfigData.value = row
    formPanelVisible.value = true
  }

  const handleSearch = async () => {
    await loadConfigData()
  }

  const handleResetSearch = async () => {
    await loadConfigData()
  }

  const handleConfigFormSuccess = async () => {
    await refreshPage()
  }

  const handleGroupFormSuccess = async () => {
    await refreshPage()
  }

  const handleDeleteGroup = (section: ConfigGroupSection) => {
    const groupData = getGroupDataById(section.groupId)
    if (!groupData) {
      ElMessage.warning('未找到对应的配置分组')
      return
    }

    ElMessageBox.confirm(`确定删除配置分组"${groupData.groupName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfigGroup(groupData.id)

      if (searchForm.configGroupId === groupData.id) {
        searchForm.configGroupId = undefined
      }

      ElMessage.success('删除配置分组成功')
      await refreshPage()
    })
  }

  const handleDelete = (row: ConfigListItem) => {
    ElMessageBox.confirm(`确定删除系统参数配置"${row.configName}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteConfig(row.id)
      ElMessage.success('删除成功')
      await loadConfigData()
    })
  }

  onMounted(() => {
    void refreshPage()
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
</script>

<style scoped lang="scss">
  .config-page {
    min-height: 0;

    .config-page-card {
      min-height: 0;

      :deep(.el-card__body) {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    }

    // 顶部 header 与下方内容分隔
    :deep(.art-table-header) {
      flex-shrink: 0;
    }

    .config-layout {
      display: grid;
      flex: 1;
      grid-template-columns: 220px 1fr;
      gap: 16px;
      min-height: 0;
      margin-top: 12px;
    }

    // ==================== 侧边导航 ====================
    .config-sidebar {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      background-color: var(--art-main-bg-color);
      border: 1px solid var(--default-border);
      border-radius: calc(var(--custom-radius) / 2 + 2px);

      &__search {
        flex-shrink: 0;
        padding: 10px;
        border-bottom: 1px solid var(--default-border);
      }

      &__list {
        flex: 1;
        min-height: 0;
        padding: 6px;
        margin: 0;
        overflow-y: auto;
        list-style: none;
      }

      &__item {
        display: flex;
        gap: 6px;
        align-items: center;
        padding: 8px 10px;
        font-size: 13px;
        color: var(--el-text-color-regular);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;

        & + & {
          margin-top: 2px;
        }

        &:hover {
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        &.is-active {
          font-weight: 600;
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);

          .config-sidebar__arrow {
            color: var(--el-color-primary);
            opacity: 1;
            transform: translateX(0);
          }
        }
      }

      &__arrow {
        flex-shrink: 0;
        color: var(--el-text-color-placeholder);
        opacity: 0;
        transition: all 0.2s;
        transform: translateX(-4px);
      }

      &__name {
        flex: 1;
        min-width: 0;
      }

      &__count {
        flex-shrink: 0;
        min-width: 22px;
        padding: 0 6px;
        font-size: 11px;
        line-height: 18px;
        color: var(--el-text-color-secondary);
        text-align: center;
        background-color: var(--el-fill-color);
        border-radius: 9px;
      }

      &__empty {
        padding: 24px 12px;
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        text-align: center;
      }
    }

    // ==================== 右侧内容（独立滚动容器） ====================
    .config-main {
      min-width: 0;
      min-height: 0;
      padding: 0 4px 16px 0;
      overflow-y: auto;
    }

    .config-group-section {
      scroll-margin-top: 8px;

      & + .config-group-section {
        margin-top: 28px;
      }
    }

    .config-group-header {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-between;
      padding: 4px 0 10px;
      margin-bottom: 12px;
      background-color: var(--art-main-bg-color);
      border-bottom: 1px solid var(--default-border);

      &__title {
        display: flex;
        gap: 10px;
        align-items: baseline;
        min-width: 0;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--el-text-color-primary);
        }
      }

      &__code {
        font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }

      &__actions {
        display: flex;
        flex-shrink: 0;
        gap: 6px;
        align-items: center;
      }
    }

    // ==================== 紧凑卡片 ====================
    .config-item-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .config-item-card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px 14px;
      background-color: var(--default-box-color);
      border: 1px solid var(--default-border);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 2px 12px -2px rgb(0 0 0 / 6%);

        .config-item-card__actions {
          pointer-events: auto;
          opacity: 1;
        }
      }

      &.is-disabled {
        opacity: 0.75;
      }

      &__main {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      &__heading {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        min-width: 0;
      }

      &__title {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      &__tags {
        display: flex;
        flex-shrink: 0;
        gap: 4px;
      }

      &__key {
        margin: 0;
        overflow: hidden;
        font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
        font-size: 11px;
        color: var(--el-text-color-placeholder);
      }

      &__value {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: space-between;
        padding-top: 6px;
        margin-top: 4px;
        border-top: 1px dashed var(--default-border);
      }

      &__info {
        flex-shrink: 0;
        color: var(--el-text-color-placeholder);
        cursor: help;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      &__actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        gap: 4px;
        padding: 2px 6px;
        pointer-events: none;
        background-color: var(--default-box-color);
        border-radius: 6px;
        box-shadow: 0 0 0 1px var(--default-border);
        opacity: 0;
        transition: opacity 0.2s;
      }
    }

    .truncate {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .config-item-meta-tip {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 280px;
    font-size: 12px;

    .label {
      display: inline-block;
      min-width: 56px;
      margin-right: 8px;
      color: var(--el-color-primary-light-7);
    }

    .value {
      color: inherit;
      word-break: break-word;
    }
  }

  // ==================== 响应式 ====================
  @media (width <= 992px) {
    .config-page {
      .config-layout {
        grid-template-columns: 1fr;
      }

      .config-sidebar {
        max-height: 200px;

        &__list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 10px;
        }

        &__item {
          padding: 4px 10px;

          & + & {
            margin-top: 0;
          }

          .config-sidebar__arrow {
            display: none;
          }
        }
      }

      .config-group-header {
        position: static;
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }

      .config-item-card__actions {
        position: static;
        padding: 0;
        margin-top: 4px;
        pointer-events: auto;
        background-color: transparent;
        box-shadow: none;
        opacity: 1;
      }
    }
  }
</style>
