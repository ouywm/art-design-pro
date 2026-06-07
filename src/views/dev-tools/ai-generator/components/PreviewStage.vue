<template>
  <section class="preview-layout">
    <ElCard class="generator-card page-preview-card" shadow="never">
      <template #header>
        <div class="preview-card-head">
          <div class="preview-title">
            <span>页面预览</span>
            <small>按当前字段结构模拟最终模块效果，不写入代码。</small>
          </div>
          <div class="preview-tags">
            <ElTag effect="plain" size="small" type="primary">{{ moduleConfig.title }}</ElTag>
            <ElTag effect="plain" size="small" type="info">弹窗(Dialog)</ElTag>
          </div>
        </div>
      </template>

      <div class="browser-preview">
        <div class="browser-bar">
          <span class="browser-dot is-red"></span>
          <span class="browser-dot is-yellow"></span>
          <span class="browser-dot is-green"></span>
          <div class="browser-url">https://www.app.artd.pro/#{{ moduleConfig.pagePath }}</div>
        </div>

        <div class="real-preview-page">
          <section class="art-search-bar art-card-xs mock-search-bar">
            <ElForm label-width="76px">
              <div class="mock-search-grid">
                <ElFormItem
                  v-for="field in searchFields"
                  :key="field.prop"
                  :label="field.label"
                  class="mock-search-item"
                >
                  <ElSelect
                    v-if="field.component === 'Select'"
                    :placeholder="`请选择${field.label}`"
                    class="w-full"
                  >
                    <ElOption label="启用" value="启用" />
                    <ElOption label="跟进中" value="跟进中" />
                    <ElOption label="停用" value="停用" />
                  </ElSelect>
                  <ElInput v-else :placeholder="`搜索${field.label}`" />
                </ElFormItem>
                <div class="mock-action-column">
                  <ElButton class="reset-button">重置</ElButton>
                  <ElButton class="search-button" type="primary">查询</ElButton>
                </div>
              </div>
            </ElForm>
          </section>

          <ElCard class="preview-table-card" shadow="never">
            <div class="preview-table-header">
              <div class="preview-table-actions">
                <ElButton type="primary">新增{{ moduleConfig.title }}</ElButton>
              </div>
              <div class="preview-operation-actions">
                <button type="button" aria-label="刷新">
                  <ArtSvgIcon icon="ri:refresh-line" />
                </button>
                <button type="button" aria-label="密度">
                  <ArtSvgIcon icon="ri:expand-up-down-line" />
                </button>
                <button type="button" aria-label="全屏">
                  <ArtSvgIcon icon="ri:fullscreen-line" />
                </button>
                <button type="button" aria-label="列设置">
                  <ArtSvgIcon icon="ri:list-settings-line" />
                </button>
                <button type="button" aria-label="设置">
                  <ArtSvgIcon icon="ri:settings-3-line" />
                </button>
              </div>
            </div>

            <ElTable :data="rows" class="preview-art-table" height="100%" stripe>
              <ElTableColumn label="序号" type="index" width="70" />
              <ElTableColumn label="客户名称" prop="name" min-width="150" />
              <ElTableColumn label="手机号" prop="phone" min-width="130" />
              <ElTableColumn label="所属行业" prop="industry" min-width="130" />
              <ElTableColumn label="客户状态" min-width="120">
                <template #default="{ row }">
                  <ElTag
                    size="small"
                    :type="
                      row.status === '停用'
                        ? 'info'
                        : row.status === '跟进中'
                          ? 'warning'
                          : 'success'
                    "
                  >
                    {{ row.status }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="客户等级" prop="level" min-width="110" />
              <ElTableColumn label="负责人" prop="owner" min-width="110" />
              <ElTableColumn label="创建时间" prop="createdAt" sortable min-width="160" />
              <ElTableColumn label="操作" fixed="right" width="150">
                <template #default>
                  <ElButton text size="small" type="primary">编辑</ElButton>
                  <ElButton text size="small" type="primary">详情</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>
        </div>
      </div>
    </ElCard>

    <ElCard class="generator-card code-preview-card" shadow="never">
      <template #header>
        <div class="code-card-head">
          <div class="code-title">
            <span>代码预览与生成</span>
            <small>日常使用优先点“一键生成”；检查按钮用于写入前排查问题。</small>
          </div>
          <div class="card-actions">
            <ElTag class="shrink-0" size="small" type="primary">{{ files.length }} 个文件</ElTag>
            <ElSwitch
              class="shrink-0"
              active-text="保存建议"
              inactive-text="跳过建议"
              :model-value="true"
              size="small"
            />
            <ElSwitch
              class="shrink-0"
              active-text="允许覆盖"
              inactive-text="不覆盖"
              :model-value="false"
              size="small"
            />
            <ElSelect class="conflict-select shrink-0" model-value="有冲突就停止" size="small">
              <ElOption label="有冲突就停止" value="有冲突就停止" />
              <ElOption label="允许合并" value="允许合并" />
            </ElSelect>
            <ElButton class="shrink-0" size="small" @click="$emit('copy')">复制</ElButton>
            <span class="action-divider"></span>
            <ElButton class="shrink-0" size="small">写入检查</ElButton>
            <ElButton class="shrink-0" size="small">环境检查</ElButton>
            <ElButton class="shrink-0" disabled size="small">真实数据验证</ElButton>
          </div>
        </div>
      </template>

      <div class="delivery-panel">
        <div>
          <strong>下一步：一键生成</strong>
          <p>正式环境仅允许生成预览和写入检查；请在开发环境写入代码并通过发布流程上线。</p>
        </div>
        <div class="delivery-actions">
          <ElButton disabled size="large" type="success" @click="$emit('generate')"
            >一键生成</ElButton
          >
        </div>
      </div>

      <ElSelect
        class="file-select"
        filterable
        :model-value="previewFile"
        @update:model-value="emitFile"
      >
        <ElOption v-for="file in files" :key="file.path" :label="file.path" :value="file.path" />
      </ElSelect>

      <div class="file-tags">
        <ElTag effect="plain" size="small" type="primary">{{ selectedFile?.language }}</ElTag>
        <ElTag effect="plain" size="small" type="info">{{ selectedFile?.action }}</ElTag>
      </div>

      <div class="code-preview-scroll" :data-language="selectedFile?.language?.toUpperCase()">
        <pre><code>{{ selectedFile?.code }}</code></pre>
      </div>
    </ElCard>
  </section>
</template>

<script setup lang="ts">
  import type { GeneratorField, GeneratorModuleConfig, PreviewFile, PreviewRecord } from '../types'

  const props = defineProps<{
    fields: GeneratorField[]
    files: PreviewFile[]
    moduleConfig: GeneratorModuleConfig
    previewFile: string
    rows: PreviewRecord[]
  }>()

  const emit = defineEmits<{
    (e: 'update:preview-file', value: string): void
    (e: 'copy'): void
    (e: 'generate'): void
  }>()

  const selectedFile = computed(() => props.files.find((item) => item.path === props.previewFile))
  const searchFields = computed(() => props.fields.filter((field) => field.searchable))

  const emitFile = (value: string | number | boolean | Record<string, unknown>) => {
    emit('update:preview-file', String(value))
  }
</script>

<style scoped lang="scss">
  .preview-layout {
    display: grid;
    gap: 16px;
    min-width: 0;
    max-width: 100%;
    overflow: visible;
  }

  .page-preview-card,
  .code-preview-card {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .preview-card-head,
  .code-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;
  }

  .preview-title,
  .code-title {
    display: grid;
    gap: 4px;
    min-width: 180px;

    span {
      font-weight: 700;
      line-height: 28px;
      color: var(--el-text-color-primary);
    }

    small {
      font-size: 12px;
      font-weight: 400;
      line-height: 1.45;
      color: var(--el-text-color-secondary);
    }
  }

  .preview-tags,
  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
  }

  .card-actions {
    flex: 1;
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .browser-preview {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .browser-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--default-border);
  }

  .browser-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;

    &.is-red {
      background: #ff6b6b;
    }

    &.is-yellow {
      background: #f8c35a;
    }

    &.is-green {
      background: #52c41a;
    }
  }

  .browser-url {
    min-width: 0;
    padding: 6px 10px;
    overflow: hidden;
    font-size: 13px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 999px;
  }

  .real-preview-page {
    display: grid;
    gap: 12px;
    min-width: 0;
    max-width: 100%;
    padding: 12px;
  }

  .mock-search-bar {
    padding: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--default-border);
    border-radius: var(--custom-radius);
  }

  .mock-search-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 12px;
    align-items: flex-start;
  }

  .mock-action-column {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding-top: 1px;
  }

  .preview-table-card {
    margin-top: 0 !important;
  }

  .preview-table-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .preview-operation-actions {
    display: flex;
    gap: 6px;
    align-items: center;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      background: transparent;
      border: 0;
      border-radius: 6px;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-fill-color-light);
      }
    }
  }

  .preview-art-table {
    min-width: 960px;
  }

  .conflict-select {
    width: 120px;
  }

  .action-divider {
    flex-shrink: 0;
    width: 1px;
    height: 24px;
    background: var(--default-border);
  }

  .delivery-panel {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    margin-bottom: 14px;
    border: 1px solid var(--el-color-success-light-7);
    border-radius: 8px;

    strong {
      display: block;
      font-size: 15px;
      color: var(--el-text-color-primary);
    }

    p {
      max-width: 720px;
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }

  .delivery-actions {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
  }

  .file-select {
    width: 100%;
  }

  .file-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }

  .code-preview-scroll {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    max-height: min(56vh, 620px);
    padding: 40px 12px 12px;
    overflow: auto;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--default-border);
    border-radius: var(--custom-radius);

    &::before {
      position: absolute;
      content: attr(data-language);
    }

    pre {
      min-width: max-content;
      padding: 0;
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.65;
      color: var(--el-text-color-primary);
      tab-size: 2;
      white-space: pre;
    }
  }

  @media (width <= 1200px) {
    .preview-card-head,
    .code-card-head,
    .delivery-panel {
      display: grid;
      justify-content: stretch;
    }

    .card-actions,
    .preview-tags,
    .delivery-actions {
      justify-content: flex-start;
    }

    .mock-search-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
