<template>
  <ElCard class="generator-card workflow-card" shadow="never">
    <div class="card-heading">
      <div>
        <h3>当前流程</h3>
        <p>按主线完成一次生成；当前页面只展示选中步骤的核心操作。</p>
      </div>
      <div class="heading-actions">
        <span class="local-store-label">本地存储</span>
        <ElSwitch
          :model-value="localStoreEnabled"
          size="small"
          @update:model-value="emitLocalStore"
        />
        <ElButton text type="danger" :icon="Delete" @click="$emit('clear-cache')">
          清除缓存
        </ElButton>
        <ElTag size="small" type="primary">{{ flowHint }}</ElTag>
      </div>
    </div>

    <div class="workflow-grid">
      <button
        v-for="step in steps"
        :key="step.key"
        type="button"
        :class="['workflow-step', stepClass(step.key)]"
        @click="$emit('update:active-step', step.key)"
      >
        <span class="workflow-index">{{ step.index }}</span>
        <span class="workflow-content">
          <strong>{{ step.title }}</strong>
          <em>{{ step.desc }}</em>
          <small>{{ step.tip }}</small>
        </span>
      </button>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { Delete } from '@element-plus/icons-vue'
  import type { StepKey, WorkflowStep } from '../types'

  const props = defineProps<{
    activeStep: StepKey
    flowHint: string
    localStoreEnabled: boolean
    steps: WorkflowStep[]
  }>()

  const emit = defineEmits<{
    (e: 'update:active-step', value: StepKey): void
    (e: 'update:local-store-enabled', value: boolean): void
    (e: 'clear-cache'): void
  }>()

  const emitLocalStore = (value: string | number | boolean) => {
    emit('update:local-store-enabled', Boolean(value))
  }

  const activeIndex = computed(() => props.steps.findIndex((step) => step.key === props.activeStep))

  const stepClass = (key: StepKey) => {
    const currentIndex = props.steps.findIndex((step) => step.key === key)

    return {
      'is-done': currentIndex < activeIndex.value,
      'is-current': currentIndex === activeIndex.value,
      'is-active': currentIndex === activeIndex.value,
      'is-todo': currentIndex > activeIndex.value
    }
  }
</script>

<style scoped lang="scss">
  .card-heading {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }

  .heading-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .local-store-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--art-text-gray-500);
  }

  .workflow-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .workflow-step {
    position: relative;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 14px;
    min-height: 116px;
    padding: 20px 18px 16px;
    overflow: hidden;
    font: inherit;
    text-align: left;
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
    transition:
      border-color 0.2s,
      background 0.2s,
      box-shadow 0.2s;

    &.is-active {
      background: color-mix(in srgb, var(--art-primary) 8%, var(--default-box-color));
      border-color: var(--el-color-primary);
      box-shadow: 0 14px 28px rgb(64 128 255 / 8%);
    }

    &.is-done {
      border-color: color-mix(in srgb, var(--el-color-primary) 34%, var(--default-border));
    }

    &.is-todo {
      .workflow-index {
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color);
      }
    }
  }

  .workflow-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-weight: 700;
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 16%, var(--el-fill-color));
    border-radius: 999px;
  }

  .workflow-content {
    display: grid;
    gap: 8px;

    strong {
      font-size: 15px;
      color: var(--el-text-color-primary);
    }

    em,
    small {
      font-style: normal;
      line-height: 1.45;
    }

    em {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    small {
      font-size: 12px;
      font-weight: 700;
      color: var(--el-color-primary);
    }
  }

  @media (width <= 1200px) {
    .card-heading {
      flex-direction: column;
      align-items: stretch;
    }

    .workflow-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 720px) {
    .workflow-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
