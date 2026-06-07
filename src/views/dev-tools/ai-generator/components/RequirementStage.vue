<template>
  <section class="stage-workspace generator-workspace">
    <ElCard class="generator-card requirement-input-card" shadow="never">
      <template #header>
        <div class="mini-card-head">
          <div>
            <strong>输入需求</strong>
            <small>先描述模块，系统会自动整理模块结构，确认字段后再生成代码预览。</small>
          </div>
        </div>
      </template>

      <div class="requirement-composer">
        <div class="composer-glow"></div>
        <div class="composer-head">
          <div class="composer-kicker">
            <ArtSvgIcon icon="ri:sparkling-line" />
            <span>AI 模块需求</span>
          </div>
          <ElTag size="small" type="primary">可生成</ElTag>
        </div>
        <ElInput
          class="requirement-textarea"
          :model-value="requirementText"
          type="textarea"
          :rows="8"
          maxlength="8000"
          resize="none"
          placeholder="描述你要生成的模块、字段、搜索条件和操作能力，例如：生成客户管理模块，字段包含客户名称、手机号、行业、状态、创建时间，支持搜索、新增、编辑、删除。"
          @update:model-value="(value) => $emit('update:requirement-text', String(value))"
        />
        <div class="composer-examples">
          <button
            v-for="item in examples"
            :key="item"
            class="example-chip"
            type="button"
            @click="$emit('apply-example', item)"
          >
            {{ item }}
          </button>
        </div>
        <div class="composer-toolbar">
          <label class="domain-control">
            <ArtSvgIcon icon="ri:folder-3-line" />
            <span>模块分组</span>
            <ElInput
              class="domain-input"
              :model-value="moduleGroup"
              placeholder="system / crm / mall"
              @update:model-value="(value) => $emit('update:module-group', String(value))"
            />
          </label>
          <div class="toolbar-spacer"></div>
          <span class="word-count">{{ requirementLength }} / 8000</span>
          <ElButton class="parse-button" round type="primary" @click="$emit('parse')">
            <span>解析需求</span>
            <ArtSvgIcon icon="ri:arrow-up-line" class="inline" />
          </ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard class="generator-card schema-card" shadow="never">
      <template #header>
        <div class="mini-card-head">
          <strong>Schema</strong>
          <div class="inline-actions">
            <ElButton size="small" :disabled="!schemaText">更新结构</ElButton>
            <ElButton size="small" :disabled="!schemaText">检查结构</ElButton>
          </div>
        </div>
      </template>
      <div class="schema-code-editor">
        <pre
          class="schema-code-highlight"
        ><code>{{ schemaText || '等待需求解析后生成模块结构。' }}</code></pre>
      </div>
      <div class="schema-actions">
        <ElButton type="success" :disabled="!schemaText" @click="$emit('generate-fields')">
          生成字段配置
        </ElButton>
      </div>
    </ElCard>
  </section>
</template>

<script setup lang="ts">
  import type { GeneratorModuleConfig } from '../types'

  const props = defineProps<{
    examples: string[]
    moduleConfig: GeneratorModuleConfig
    moduleGroup: string
    requirementText: string
    schemaText: string
  }>()

  defineEmits<{
    (e: 'update:module-group', value: string): void
    (e: 'update:requirement-text', value: string): void
    (e: 'apply-example', value: string): void
    (e: 'generate-fields'): void
    (e: 'parse'): void
  }>()

  const requirementLength = computed(() => props.requirementText.length)
</script>

<style scoped lang="scss">
  .requirement-composer {
    position: relative;
    display: grid;
    gap: 16px;
    padding: 18px;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--default-box-color) 96%, var(--art-primary) 4%),
      var(--default-box-color)
    );
    border: 1px solid color-mix(in srgb, var(--default-border) 82%, var(--art-primary) 18%);
    border-radius: calc(var(--custom-radius) + 4px);
  }

  .schema-card {
    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
  }

  .schema-code-editor {
    position: relative;
    flex: 1;
    min-height: 420px;
    overflow: hidden;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--default-border);
    border-radius: 6px;
  }

  .schema-code-highlight {
    position: absolute;
    inset: 0;
    padding: 14px;
    margin: 0;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.65;
    color: var(--art-text-gray-800);
    tab-size: 2;
    white-space: pre-wrap;
  }

  .schema-actions {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    padding-top: 14px;
  }

  .composer-glow {
    position: absolute;
    top: -92px;
    right: -88px;
    width: 210px;
    height: 210px;
    pointer-events: none;
    background: radial-gradient(circle, rgb(64 128 255 / 16%), transparent 68%);
  }

  .composer-head,
  .composer-toolbar {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .composer-head {
    justify-content: space-between;
    font-weight: 700;
  }

  .composer-kicker,
  .domain-control {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .composer-kicker {
    font-size: 14px;
    color: var(--art-text-gray-900);

    .art-svg-icon {
      color: var(--el-color-primary);
    }
  }

  .requirement-textarea {
    position: relative;
    z-index: 1;

    :deep(.el-textarea__inner) {
      min-height: 188px !important;
      padding: 14px;
      line-height: 1.7;
      background: color-mix(in srgb, var(--default-box-color) 86%, transparent);
      border-color: var(--default-border);
      box-shadow: none;

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      }
    }
  }

  .composer-examples {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .example-chip {
      padding: 7px 12px;
      font-size: 12px;
      color: var(--art-text-gray-600);
      cursor: pointer;
      background: color-mix(in srgb, var(--el-fill-color-light) 82%, var(--default-box-color));
      border: 1px solid var(--default-border);
      border-radius: 999px;
      transition:
        color 0.2s,
        border-color 0.2s,
        background-color 0.2s;

      &:hover {
        color: var(--el-color-primary);
        background: color-mix(in srgb, var(--el-color-primary) 8%, var(--default-box-color));
        border-color: color-mix(in srgb, var(--el-color-primary) 42%, var(--default-border));
      }
    }
  }

  .composer-toolbar {
    justify-content: space-between;

    .domain-control {
      min-width: min(420px, 100%);
      font-size: 13px;
      font-weight: 700;
      color: var(--art-text-gray-600);
    }
  }

  .domain-input {
    width: 220px;
  }

  .toolbar-spacer {
    flex: 1;
  }

  .word-count {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--art-text-gray-500);
  }

  .parse-button {
    flex-shrink: 0;

    :deep(span) {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
  }

  @media (width <= 1200px) {
    .composer-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .domain-input {
      width: 100%;
    }

    .toolbar-spacer {
      display: none;
    }
  }
</style>
