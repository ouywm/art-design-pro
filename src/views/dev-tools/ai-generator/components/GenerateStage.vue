<template>
  <section class="generate-layout">
    <ElCard class="generator-card product-readiness-card" shadow="never">
      <template #header>
        <div class="readiness-head">
          <div class="readiness-title-main">
            <span>生成就绪度</span>
            <ElTag class="ml-2" size="small" :type="canGenerate ? 'success' : 'warning'">
              {{ canGenerate ? '可生成' : '待检查' }}
            </ElTag>
          </div>
          <ElText size="small" type="info">
            汇总结构、预览、写入风险和验证状态，决定下一步生成动作。
          </ElText>
        </div>
      </template>

      <div class="readiness-content">
        <div class="readiness-summary-panel">
          <ElProgress
            type="dashboard"
            :percentage="readinessPercent"
            :width="92"
            :color="canGenerate ? 'var(--el-color-success)' : 'var(--el-color-warning)'"
          >
            <template #default>
              <span>{{ passedCount }}/{{ diagnostics.length }}</span>
            </template>
          </ElProgress>

          <div class="readiness-copy">
            <strong>{{ canGenerate ? '可以执行一键生成' : '先完成写入检查' }}</strong>
            <p>
              {{
                canGenerate
                  ? '所有检查已经通过，可以进入真实写入流程。'
                  : '建议先做写入检查，确认新建、合并、覆盖和冲突数量。'
              }}
            </p>
          </div>

          <div class="readiness-metric-grid">
            <div v-for="item in stats" :key="item.label" class="readiness-metric">
              <span>{{ item.value }}</span>
              <label>{{ item.label }}</label>
            </div>
          </div>
        </div>

        <div class="decision-actions">
          <ElButton @click="$emit('preview')">写入检查</ElButton>
          <ElButton>环境检查</ElButton>
          <ElButton disabled>真实数据验证</ElButton>
          <ElButton type="success" :disabled="!canGenerate" @click="$emit('generate')">
            一键生成
          </ElButton>
        </div>

        <div class="gate-grid">
          <div
            v-for="item in diagnostics"
            :key="item.title"
            :class="['gate-item', getGateClass(item.level)]"
          >
            <div class="gate-head">
              <span>{{ item.title }}</span>
              <ElTag size="small" :type="item.tagType">{{ item.tag }}</ElTag>
            </div>
            <p>{{ item.desc }}</p>
          </div>
        </div>

        <div class="priority-suggestions">
          <div class="suggestion-title">建议优先补齐</div>
          <div class="suggestion-grid">
            <div class="suggestion-item">
              <span>先点“写入检查”</span>
              <p>系统会告诉你这 14 个文件哪些是新建、哪些可能影响已有代码。</p>
            </div>
            <div class="suggestion-item">
              <span>保留生成版本</span>
              <p>每次预览都生成快照，方便回滚到字段确认前的结构。</p>
            </div>
            <div class="suggestion-item">
              <span>开发环境写入</span>
              <p>真实写入、菜单刷新和数据验证建议只在开发环境执行。</p>
            </div>
          </div>
        </div>
      </div>
    </ElCard>
  </section>
</template>

<script setup lang="ts">
  import type { DiagnosticItem, DiagnosticLevel, MetricItem } from '../types'

  defineProps<{
    canGenerate: boolean
    diagnostics: DiagnosticItem[]
    passedCount: number
    readinessPercent: number
    stats: MetricItem[]
  }>()

  defineEmits<{
    (e: 'generate'): void
    (e: 'preview'): void
  }>()

  const getGateClass = (level: DiagnosticLevel) => {
    if (level === 'ready') return 'is-ready'
    if (level === 'warning') return 'is-warning'
    return 'is-error'
  }
</script>

<style scoped lang="scss">
  .product-readiness-card {
    overflow: hidden;
  }

  .readiness-head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    min-height: 24px;
  }

  .readiness-title-main {
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .readiness-content {
    display: grid;
    gap: 14px;
  }

  .readiness-summary-panel {
    display: grid;
    grid-template-columns: auto minmax(180px, 1fr) minmax(360px, 0.9fr);
    gap: 16px;
    align-items: center;
    padding: 14px 16px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .readiness-copy {
    min-width: 0;

    strong {
      display: block;
      margin-bottom: 6px;
      font-size: 15px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: var(--el-text-color-secondary);
    }
  }

  .readiness-metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(78px, 1fr));
    gap: 8px;
    min-width: 0;
  }

  .readiness-metric {
    display: grid;
    gap: 6px;
    min-height: 62px;
    padding: 10px 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    span {
      font-size: 18px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .decision-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 14px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .gate-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
  }

  .gate-item {
    min-height: 116px;
    padding: 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    &.is-ready {
      border-color: color-mix(in srgb, var(--el-color-success) 34%, var(--default-border));
    }

    &.is-warning {
      border-color: color-mix(in srgb, var(--el-color-warning) 42%, var(--default-border));
    }

    &.is-error {
      border-color: color-mix(in srgb, var(--el-color-danger) 38%, var(--default-border));
    }

    p {
      margin: 9px 0 0;
      font-size: 13px;
      line-height: 1.45;
      color: var(--el-text-color-secondary);
    }
  }

  .gate-head {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;

    span {
      font-size: 13px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }
  }

  .priority-suggestions {
    padding: 14px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .suggestion-title {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .suggestion-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .suggestion-item {
    padding: 10px;
    background: var(--el-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    span {
      font-size: 13px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.45;
      color: var(--el-text-color-secondary);
    }
  }

  @media (width <= 1400px) {
    .gate-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width <= 1200px) {
    .readiness-summary-panel,
    .suggestion-grid {
      grid-template-columns: 1fr;
    }

    .readiness-metric-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 720px) {
    .gate-grid,
    .readiness-metric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
