<template>
  <div class="feedback-panels">
    <div class="generator-feedback-grid">
      <ElCard class="generator-card feedback-card" shadow="never">
        <template #header>
          <div class="feedback-card-head">
            <span>生成质量与上线建议</span>
            <ElTag size="small" type="warning">含建议</ElTag>
          </div>
        </template>

        <div class="quality-gate-list">
          <div
            v-for="item in qualityGates"
            :key="item.title"
            :class="['quality-gate-item', `is-${item.status}`]"
          >
            <span class="quality-gate-dot"></span>
            <div class="quality-gate-content">
              <div>
                <span>{{ item.title }}</span>
                <ElTag size="small" :type="item.tagType">{{ item.tag }}</ElTag>
              </div>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </ElCard>

      <ElCard class="generator-card feedback-card" shadow="never">
        <template #header>
          <div class="feedback-card-head">
            <span>写入改动概览</span>
            <ElTag size="small" type="primary">Mock</ElTag>
          </div>
        </template>

        <div class="write-summary-grid">
          <div v-for="item in writeSummary" :key="item.label" class="write-summary-item">
            <ElTag effect="plain" size="small" :type="item.type">{{ item.label }}</ElTag>
            <strong>{{ item.value }}</strong>
            <span>个文件</span>
          </div>
        </div>

        <div class="write-tip">
          <strong>当前策略：有冲突就停止</strong>
          <p>默认不会覆盖已有文件；写入前会生成 diff 和版本快照。</p>
        </div>
      </ElCard>
    </div>

    <ElCollapse
      :model-value="openedPanels"
      class="generator-collapse"
      @update:model-value="emitPanels"
    >
      <ElCollapseItem name="tasks">
        <template #title>
          <div class="collapse-title">
            <strong>任务与版本</strong>
            <ElTag effect="plain" size="small" type="primary">
              {{ tasks.length }} 个任务 / {{ versions.length }} 个快照
            </ElTag>
          </div>
        </template>

        <div class="feedback-grid">
          <ElCard class="generator-card task-card" shadow="never">
            <template #header>
              <div class="mini-card-head">
                <span>生成任务</span>
                <ElButton size="small" :disabled="tasks.length === 0">清空</ElButton>
              </div>
            </template>
            <ElTable :data="tasks" border size="small">
              <ElTableColumn label="任务" prop="name" min-width="150" show-overflow-tooltip />
              <ElTableColumn label="状态" width="90">
                <template #default="{ row }">
                  <ElTag size="small" :type="getTaskType(row.status)">
                    {{ getTaskText(row.status) }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="次数" prop="count" align="center" width="72" />
              <ElTableColumn label="耗时" prop="duration" align="center" width="88" />
              <ElTableColumn label="说明" prop="message" min-width="220" show-overflow-tooltip />
              <ElTableColumn label="操作" fixed="right" width="86">
                <template #default="{ row }">
                  <ElButton text size="small" :disabled="!row.retryable">重试</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>

          <ElCard class="generator-card version-card" shadow="never">
            <template #header>
              <div class="mini-card-head">
                <div class="inline-title">
                  <span>生成记录版本</span>
                  <ElTag class="ml-2" size="small" type="primary">
                    {{ versions.length }} 个版本
                  </ElTag>
                </div>
                <ElButton size="small" :disabled="versions.length === 0">清空版本</ElButton>
              </div>
            </template>
            <ElTable :data="versions" border size="small">
              <ElTableColumn label="版本" prop="version" align="center" width="86">
                <template #default="{ row }">
                  <ElTag effect="plain" size="small" type="primary">{{ row.version }}</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn label="模块" prop="module" min-width="120" show-overflow-tooltip />
              <ElTableColumn label="来源" prop="source" min-width="110" />
              <ElTableColumn label="字段" prop="fields" align="center" width="72" />
              <ElTableColumn label="时间" prop="time" min-width="150" />
              <ElTableColumn label="操作" fixed="right" width="96">
                <template #default>
                  <ElButton text size="small">恢复</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCard>
        </div>
      </ElCollapseItem>

      <ElCollapseItem name="history">
        <template #title>
          <div class="collapse-title">
            <strong>生成历史</strong>
            <ElTag effect="plain" size="small" type="primary">{{ history.length }} 条记录</ElTag>
          </div>
        </template>

        <ElCard class="generator-card history-card" shadow="never">
          <template #header>
            <div class="mini-card-head">
              <span>生成历史</span>
              <div class="inline-actions">
                <ElButton size="small">刷新</ElButton>
                <ElButton size="small" type="danger" plain :disabled="history.length === 0">
                  清空历史
                </ElButton>
              </div>
            </div>
          </template>
          <ElEmpty v-if="history.length === 0" description="暂无历史" />
          <ElTable v-else :data="history" border size="small">
            <ElTableColumn label="模块" prop="module" min-width="130" />
            <ElTableColumn label="动作" prop="action" min-width="120" />
            <ElTableColumn label="状态" prop="status" width="90" />
            <ElTableColumn label="操作人" prop="operator" width="120" />
            <ElTableColumn label="时间" prop="time" min-width="160" />
          </ElTable>
        </ElCard>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<script setup lang="ts">
  import type {
    GenerationHistory,
    GenerationTask,
    GenerationVersion,
    GeneratorTagType,
    QualityGate,
    WriteSummaryItem
  } from '../types'

  defineProps<{
    history: GenerationHistory[]
    openedPanels: string[]
    qualityGates: QualityGate[]
    tasks: GenerationTask[]
    versions: GenerationVersion[]
    writeSummary: WriteSummaryItem[]
  }>()

  const emit = defineEmits<{
    (e: 'update:opened-panels', value: string[]): void
  }>()

  const emitPanels = (value: string | number | Array<string | number>) => {
    const nextValue = Array.isArray(value) ? value : [value]
    emit(
      'update:opened-panels',
      nextValue.map((item) => String(item))
    )
  }

  const getTaskType = (status: GenerationTask['status']): GeneratorTagType => {
    if (status === 'success') return 'success'
    if (status === 'failed') return 'danger'
    return 'warning'
  }

  const getTaskText = (status: GenerationTask['status']) => {
    if (status === 'success') return '成功'
    if (status === 'failed') return '失败'
    return '运行中'
  }
</script>

<style scoped lang="scss">
  .feedback-panels {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  .generator-feedback-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: stretch;
  }

  .feedback-card {
    min-width: 0;
  }

  .feedback-card-head {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
  }

  .quality-gate-list {
    display: grid;
    gap: 8px;
  }

  .quality-gate-item {
    display: grid;
    grid-template-columns: 10px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .quality-gate-dot {
    width: 8px;
    height: 8px;
    margin-top: 6px;
    background: var(--el-color-info);
    border-radius: 999px;
  }

  .quality-gate-item.is-passed .quality-gate-dot {
    background: var(--el-color-success);
  }

  .quality-gate-item.is-warning .quality-gate-dot {
    background: var(--el-color-warning);
  }

  .quality-gate-item.is-failed .quality-gate-dot {
    background: var(--el-color-danger);
  }

  .quality-gate-content {
    min-width: 0;

    > div {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
  }

  .write-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .write-summary-item {
    display: grid;
    gap: 8px;
    min-height: 86px;
    padding: 12px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    strong {
      font-size: 24px;
      color: var(--el-text-color-primary);
    }

    span:last-child {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .write-tip {
    padding: 12px;
    margin-top: 12px;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--default-border);
    border-radius: 8px;

    strong {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: var(--el-text-color-secondary);
    }
  }

  @media (width <= 1200px) {
    .generator-feedback-grid,
    .write-summary-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
