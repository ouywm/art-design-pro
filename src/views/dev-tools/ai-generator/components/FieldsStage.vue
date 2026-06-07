<template>
  <section class="fields-layout">
    <ElCard class="generator-card field-config-card" shadow="never">
      <template #header>
        <div class="card-title">
          <div>
            <span>字段配置</span>
            <ElTag class="ml-2" size="small" type="primary">{{ fields.length }} 个字段</ElTag>
            <ElText class="ml-2.5" size="small" type="info">
              这里决定表单、搜索和列表展示，确认后再生成代码。
            </ElText>
          </div>
        </div>
      </template>

      <div class="module-config">
        <ElForm label-position="top">
          <div class="module-config-head">
            <ElFormItem label="模块能力" class="module-capability">
              <div class="capability-groups">
                <div
                  v-for="group in capabilityGroups"
                  :key="group.key"
                  :class="[
                    'capability-group',
                    group.key === 'operation' && 'capability-operation-group'
                  ]"
                >
                  <span class="capability-group-label">{{ group.label }}</span>
                  <ElCheckboxGroup :model-value="moduleConfig.capabilities[group.key]">
                    <ElCheckboxButton
                      v-for="option in group.options"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </ElCheckboxButton>
                  </ElCheckboxGroup>
                </div>
              </div>
            </ElFormItem>

            <ElFormItem label="生成策略" class="module-strategy">
              <div class="strategy-grid">
                <div class="strategy-item">
                  <span class="strategy-label">表单方式</span>
                  <ElRadioGroup :model-value="moduleConfig.strategy.formMode">
                    <ElRadioButton value="dialog">弹窗(Dialog)</ElRadioButton>
                    <ElRadioButton value="drawer">抽屉(Drawer)</ElRadioButton>
                  </ElRadioGroup>
                </div>
                <div class="strategy-item">
                  <span class="strategy-label">删除策略</span>
                  <ElRadioGroup :model-value="moduleConfig.strategy.deleteMode">
                    <ElRadioButton value="physical">物理删除</ElRadioButton>
                    <ElRadioButton value="soft">软删除</ElRadioButton>
                  </ElRadioGroup>
                </div>
                <div class="strategy-item strategy-status-field">
                  <span class="strategy-label">状态字段</span>
                  <ElSelect :model-value="moduleConfig.statusField">
                    <ElOption :label="moduleConfig.statusField" :value="moduleConfig.statusField" />
                  </ElSelect>
                </div>
              </div>
            </ElFormItem>
          </div>

          <div class="module-form-grid">
            <ElFormItem label="模块名称">
              <ElInput :model-value="moduleConfig.title" placeholder="客户管理" />
            </ElFormItem>
            <ElFormItem label="模块英文名">
              <ElInput :model-value="moduleConfig.name" placeholder="customer" />
            </ElFormItem>
            <ElFormItem label="模块分组">
              <ElInput :model-value="moduleConfig.group" placeholder="crm" />
            </ElFormItem>
            <ElFormItem label="数据模型名">
              <ElInput :model-value="moduleConfig.modelName" placeholder="Customer" />
            </ElFormItem>
            <ElFormItem label="页面路径">
              <ElInput :model-value="moduleConfig.pagePath" placeholder="/crm/customer" />
            </ElFormItem>
            <ElFormItem label="接口地址">
              <ElInput :model-value="moduleConfig.apiPath" placeholder="/customers" />
            </ElFormItem>
          </div>
        </ElForm>
      </div>

      <div class="module-actions">
        <ElButton type="primary" :icon="Plus" class="shrink-0">新增字段</ElButton>
        <ElButton class="shrink-0">添加状态字段</ElButton>
        <ElButton class="shrink-0">补齐创建/更新时间</ElButton>
        <ElButton class="shrink-0">推荐配置</ElButton>
        <ElSelect class="field-template-select shrink-0" placeholder="复用字段模板">
          <ElOption label="通用状态字段" value="通用状态字段" />
          <ElOption label="审计字段" value="审计字段" />
          <ElOption label="金额字段" value="金额字段" />
        </ElSelect>
        <ElButton class="shrink-0" disabled>添加模板字段</ElButton>
        <ElButton class="preview-button shrink-0" type="success" @click="$emit('preview')">
          生成预览
        </ElButton>
      </div>

      <div class="field-table-wrap">
        <ElTable
          :data="fields"
          border
          class="field-table"
          size="small"
          :row-class-name="getRowClassName"
        >
          <ElTableColumn type="expand" width="40">
            <template #default="{ row }">
              <div class="field-advanced-config">
                <div>
                  <span>表单栅格</span>
                  <strong>{{ row.advanced?.formSpan ?? 12 }}</strong>
                </div>
                <div>
                  <span>占位提示</span>
                  <strong>{{ row.advanced?.placeholder ?? `请输入${row.label}` }}</strong>
                </div>
                <div>
                  <span>说明</span>
                  <strong>{{
                    row.advanced?.help ?? '按标准字段生成表单、表格和接口映射。'
                  }}</strong>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="排序" align="center" width="58">
            <template #default>
              <button class="field-drag" type="button" aria-label="拖拽排序">
                <ArtSvgIcon icon="ri:draggable" />
              </button>
            </template>
          </ElTableColumn>
          <ElTableColumn label="字段" width="199">
            <template #default="{ row }">
              <ElInput size="small" :model-value="row.label" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="标识" width="198">
            <template #default="{ row }">
              <ElInput size="small" :model-value="row.prop" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="132">
            <template #default="{ row }">
              <ElSelect size="small" :model-value="row.type">
                <ElOption label="文本" value="文本" />
                <ElOption label="长文本" value="长文本" />
                <ElOption label="数字" value="数字" />
                <ElOption label="下拉" value="下拉" />
                <ElOption label="日期时间" value="日期时间" />
              </ElSelect>
            </template>
          </ElTableColumn>
          <ElTableColumn label="校验" width="128">
            <template #default="{ row }">
              <ElSelect
                size="small"
                :model-value="getValidationValue(row)"
                :placeholder="row.validation || '自动'"
              >
                <ElOption label="自动" value="自动" />
                <ElOption label="必填" value="必填" />
                <ElOption label="手机号" value="手机号" />
                <ElOption label="金额" value="金额" />
                <ElOption label="百分比" value="百分比" />
              </ElSelect>
            </template>
          </ElTableColumn>
          <ElTableColumn label="长度" width="96">
            <template #default="{ row }">
              <ElInputNumber
                :model-value="row.length"
                :controls="false"
                :min="1"
                class="field-number"
                placeholder="-"
                size="small"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="默认值" width="171">
            <template #default="{ row }">
              <ElInput size="small" :model-value="row.defaultValue" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="必填" align="center" width="70">
            <template #default="{ row }">
              <ElSwitch :model-value="row.required" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="表单" align="center" width="70">
            <template #default="{ row }">
              <ElSwitch :model-value="row.inForm" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="搜索" align="center" width="70">
            <template #default="{ row }">
              <ElSwitch :model-value="row.searchable" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="表格" align="center" width="70">
            <template #default="{ row }">
              <ElSwitch :model-value="row.inTable" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="可排序" align="center" width="70">
            <template #default="{ row }">
              <ElSwitch :model-value="row.sortable" />
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" width="76">
            <template #default>
              <ElButton circle text type="danger" :icon="Delete" />
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
  </section>
</template>

<script setup lang="ts">
  import { Delete, Plus } from '@element-plus/icons-vue'
  import type { CapabilityGroup, GeneratorField, GeneratorModuleConfig } from '../types'

  defineProps<{
    capabilityGroups: CapabilityGroup[]
    fields: GeneratorField[]
    moduleConfig: GeneratorModuleConfig
  }>()

  defineEmits<{
    (e: 'preview'): void
  }>()

  const getRowClassName = ({ row }: { row: GeneratorField }) =>
    row.advanced ? 'field-row-has-advanced' : 'field-row-no-advanced'

  const getValidationValue = (row: GeneratorField) =>
    row.validation === '自动' ? undefined : row.validation
</script>

<style scoped lang="scss">
  .field-config-card {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-weight: 700;
  }

  .module-config {
    padding: 14px 14px 2px;
    margin-bottom: 14px;
    background: var(--el-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .module-config-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(420px, 0.78fr);
    gap: 14px;
    align-items: start;
  }

  .capability-groups {
    display: grid;
    gap: 10px;
  }

  .capability-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .capability-group-label,
  .strategy-label {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
  }

  .strategy-grid {
    display: grid;
    gap: 10px;
  }

  .strategy-item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;

    :deep(.el-select) {
      width: 180px;
    }
  }

  .module-form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 10px;
  }

  .module-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 15px;
    overflow-x: auto;
  }

  .field-template-select {
    width: 180px;
  }

  .preview-button {
    margin-left: auto;
  }

  .field-table-wrap {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: auto hidden;
  }

  .field-table {
    min-width: 1448px;
  }

  .field-drag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--el-text-color-secondary);
    cursor: grab;
    background: transparent;
    border: 0;
  }

  .field-number {
    width: 76px;
  }

  .field-advanced-config {
    display: grid;
    grid-template-columns: 120px minmax(160px, 0.4fr) minmax(240px, 1fr);
    gap: 10px;
    padding: 12px 16px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    div {
      display: grid;
      gap: 4px;
    }

    span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    strong {
      font-size: 13px;
      color: var(--el-text-color-primary);
    }
  }

  :deep(.field-row-has-advanced) {
    --el-table-tr-bg-color: color-mix(in srgb, var(--el-color-primary) 4%, var(--el-bg-color));
  }

  @media (width <= 1200px) {
    .module-config-head,
    .module-form-grid {
      grid-template-columns: 1fr;
    }

    .preview-button {
      margin-left: 0;
    }
  }
</style>
