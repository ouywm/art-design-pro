<template>
  <div class="config-page">
    <ConfigSearch
      v-show="showSearchBar"
      v-model="searchForm"
      :group-options="configGroupOptions"
      :dict-type-options="dictTypeOptions"
      @search="handleSearch"
      @reset="handleResetSearch"
    />

    <ElCard
      class="config-page-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
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

      <div v-loading="loading" class="config-content">
        <template v-if="groupedConfigSections.length > 0">
          <section
            v-for="section in groupedConfigSections"
            :key="section.groupId"
            class="config-group-section"
          >
            <div class="config-group-header">
              <div>
                <h3 class="config-group-title">{{ section.groupName }}</h3>
                <p class="config-group-subtitle">{{ section.groupCode || '未设置分组编码' }}</p>
              </div>
              <ElSpace wrap class="config-group-header-actions">
                <ElTag effect="plain" round type="info">{{ section.items.length }} 项</ElTag>
                <ElButton
                  link
                  type="primary"
                  :disabled="!getGroupDataById(section.groupId)"
                  @click="showGroupFormPanel('edit', getGroupDataById(section.groupId))"
                >
                  编辑分组
                </ElButton>
                <ElButton link type="danger" @click="handleDeleteGroup(section)">
                  删除分组
                </ElButton>
              </ElSpace>
            </div>

            <ElRow :gutter="16">
              <ElCol
                v-for="item in section.items"
                :key="item.id"
                :xs="24"
                :sm="24"
                :md="12"
                :xl="8"
              >
                <article class="config-item-card">
                  <div class="config-item-header">
                    <div class="config-item-heading">
                      <h4 class="config-item-title">{{ item.configName }}</h4>
                      <p class="config-item-key">{{ item.configKey }}</p>
                    </div>
                    <ElSpace wrap>
                      <ElTag :type="getValueTypeTagType(item.valueType)">
                        {{ getValueTypeLabel(item.valueType) }}
                      </ElTag>
                      <ElTag :type="item.enabled ? 'success' : 'warning'">
                        {{ item.enabled ? '启用' : '停用' }}
                      </ElTag>
                      <ElTag v-if="item.isSystem" type="info">系统内置</ElTag>
                    </ElSpace>
                  </div>

                  <div class="config-item-body">
                    <div
                      v-if="item.valueType === CONFIG_VALUE_TYPE.IMAGE"
                      class="config-image-values"
                    >
                      <div class="config-image-item">
                        <span class="field-label">当前值</span>
                        <ConfigValueDisplay
                          compact
                          :value="item.configValue"
                          :value-type="item.valueType"
                          :option-dict-type="item.optionDictType"
                        />
                      </div>

                      <div class="config-image-item">
                        <span class="field-label">默认值</span>
                        <ConfigValueDisplay
                          compact
                          :value="item.defaultValue"
                          :value-type="item.valueType"
                          :option-dict-type="item.optionDictType"
                        />
                      </div>
                    </div>

                    <template v-else>
                      <div class="config-item-field">
                        <span class="field-label">当前值</span>
                        <ConfigValueDisplay
                          :value="item.configValue"
                          :value-type="item.valueType"
                          :option-dict-type="item.optionDictType"
                        />
                      </div>

                      <div class="config-item-field">
                        <span class="field-label">默认值</span>
                        <ConfigValueDisplay
                          :value="item.defaultValue"
                          :value-type="item.valueType"
                          :option-dict-type="item.optionDictType"
                        />
                      </div>
                    </template>

                    <div
                      v-if="item.optionDictType && item.valueType !== CONFIG_VALUE_TYPE.IMAGE"
                      class="config-item-meta"
                    >
                      <span class="meta-label">候选字典</span>
                      <span class="meta-value">{{ item.optionDictType }}</span>
                    </div>

                    <div v-if="item.remark" class="config-item-meta">
                      <span class="meta-label">备注</span>
                      <span class="meta-value">{{ item.remark }}</span>
                    </div>
                  </div>

                  <div class="config-item-footer">
                    <ElSpace>
                      <ElButton link type="primary" @click="showFormPanel('edit', item)">
                        编辑
                      </ElButton>
                      <ElButton link type="danger" @click="handleDelete(item)">删除</ElButton>
                    </ElSpace>
                  </div>
                </article>
              </ElCol>
            </ElRow>
          </section>
        </template>

        <ElEmpty v-else description="暂无系统参数配置数据" :image-size="120" />
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
</script>

<style scoped lang="scss">
  .config-page {
    padding-bottom: 20px;

    .config-page-card {
      :deep(.el-card__body) {
        overflow: visible;
      }
    }

    .config-content {
      margin-top: 16px;
    }

    .config-group-section {
      & + .config-group-section {
        margin-top: 24px;
      }

      :deep(.el-row) {
        row-gap: 16px;
      }
    }

    .config-group-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .config-group-header-actions {
      align-items: center;
      justify-content: flex-end;
    }

    .config-group-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    .config-group-subtitle {
      margin: 6px 0 0;
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
      word-break: break-all;
    }

    .config-item-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
      background-color: var(--default-box-color);
      border: 1px solid var(--default-border);
      border-radius: var(--custom-radius);
    }

    .config-item-header,
    .config-item-meta,
    .config-item-field {
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }

    .config-item-header {
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .config-item-heading {
      flex: 1;
      min-width: 0;
    }

    .config-item-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--el-text-color-primary);
    }

    .config-item-key {
      margin: 8px 0 0;
      font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
      word-break: break-all;
    }

    .config-item-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
    }

    .config-image-values {
      display: flex;
      gap: 12px;
    }

    .config-image-item {
      display: flex;
      flex: 1;
      gap: 10px;
      align-items: center;
      min-width: 0;

      .field-label {
        flex-shrink: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }

      :deep(.config-value-display) {
        flex: 0 0 auto;
      }
    }

    .config-item-field {
      align-items: flex-start;

      .field-label {
        flex-shrink: 0;
        width: 56px;
        padding-top: 4px;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .config-item-meta {
      align-items: flex-start;

      .meta-label {
        flex-shrink: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }

      .meta-value {
        font-size: 13px;
        line-height: 1.7;
        color: var(--el-text-color-regular);
        text-align: right;
        word-break: break-word;
      }
    }

    .config-item-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }

  @media (width <= 992px) {
    .config-page {
      .config-group-header,
      .config-item-header,
      .config-image-values,
      .config-item-field,
      .config-item-meta {
        flex-direction: column;
      }

      .config-item-field .field-label {
        width: auto;
        padding-top: 0;
      }

      .config-item-meta .meta-value {
        text-align: left;
      }

      .config-item-footer {
        justify-content: flex-start;
      }
    }
  }
</style>
