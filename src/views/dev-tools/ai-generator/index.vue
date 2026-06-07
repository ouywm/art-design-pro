<template>
  <div class="ai-generator-page art-page-view">
    <GeneratorHero :stats="heroStats" />

    <WorkflowPanel
      :active-step="activeStep"
      :flow-hint="flowHint"
      :local-store-enabled="localStoreEnabled"
      :steps="workflowSteps"
      @clear-cache="clearCache"
      @update:active-step="activeStep = $event"
      @update:local-store-enabled="localStoreEnabled = $event"
    />

    <ElCard class="generator-card workflow-stage-card" shadow="never">
      <template #header>
        <div class="stage-header">
          <div>
            <h3>{{ activeStepMeta.title }}</h3>
            <p>{{ activeStepMeta.desc }}</p>
          </div>
          <ElTag size="small" type="primary">{{ flowHint }}</ElTag>
        </div>
      </template>

      <RequirementStage
        v-if="activeStep === 'requirement'"
        :examples="requirementExamples"
        :module-config="moduleConfig"
        :module-group="moduleGroup"
        :requirement-text="requirementText"
        :schema-text="schemaText"
        @apply-example="applyExample"
        @generate-fields="activeStep = 'fields'"
        @parse="parseRequirement"
        @update:module-group="moduleGroup = $event"
        @update:requirement-text="requirementText = $event"
      />

      <FieldsStage
        v-else-if="activeStep === 'fields'"
        :capability-groups="capabilityGroups"
        :fields="mockFields"
        :module-config="moduleConfig"
        @preview="activeStep = 'preview'"
      />

      <PreviewStage
        v-else-if="activeStep === 'preview'"
        :fields="mockFields"
        :files="previewFiles"
        :module-config="moduleConfig"
        :preview-file="previewFile"
        :rows="previewRows"
        @copy="copyPreview"
        @generate="activeStep = 'generate'"
        @update:preview-file="previewFile = $event"
      />

      <GenerateStage
        v-else
        :can-generate="canGenerate"
        :diagnostics="diagnosticItems"
        :passed-count="passedCount"
        :readiness-percent="readinessPercent"
        :stats="readinessStats"
        @generate="startMockGenerate"
        @preview="activeStep = 'preview'"
      />
    </ElCard>

    <FeedbackPanels
      :history="mockHistory"
      :opened-panels="openedPanels"
      :quality-gates="qualityGates"
      :tasks="mockTasks"
      :versions="mockVersions"
      :write-summary="writeSummary"
      @update:opened-panels="openedPanels = $event"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import FeedbackPanels from './components/FeedbackPanels.vue'
  import FieldsStage from './components/FieldsStage.vue'
  import GenerateStage from './components/GenerateStage.vue'
  import GeneratorHero from './components/GeneratorHero.vue'
  import PreviewStage from './components/PreviewStage.vue'
  import RequirementStage from './components/RequirementStage.vue'
  import WorkflowPanel from './components/WorkflowPanel.vue'
  import {
    capabilityGroups,
    defaultRequirement,
    initialDiagnostics,
    mockHistory,
    mockFields,
    mockTasks,
    mockVersions,
    moduleConfig,
    pendingDiagnostics,
    previewFiles,
    previewRows,
    qualityGates,
    requirementExamples,
    readyDiagnostics,
    writeSummary,
    workflowSteps
  } from './mock'
  import type { DiagnosticItem, StepKey } from './types'
  import './styles.scss'

  defineOptions({ name: 'DevToolsAiGenerator' })

  const localStoreEnabled = ref(true)
  const activeStep = ref<StepKey>('requirement')
  const openedPanels = ref(['tasks', 'history'])
  const moduleGroup = ref(moduleConfig.group)
  const requirementText = ref(defaultRequirement)
  const previewFile = ref(previewFiles[6].path)
  const diagnosticItems = ref<DiagnosticItem[]>(structuredClone(initialDiagnostics))

  const activeStepMeta = computed(
    () => workflowSteps.find((item) => item.key === activeStep.value)!
  )
  const flowHint = computed(() => (requirementText.value.trim() ? '可一键生成' : '从需求开始'))
  const passedCount = computed(
    () => diagnosticItems.value.filter((item) => item.level === 'ready').length
  )
  const readinessPercent = computed(() =>
    Math.round((passedCount.value / diagnosticItems.value.length) * 100)
  )
  const canGenerate = computed(() => passedCount.value === diagnosticItems.value.length)

  const heroStats = computed(() => [
    { label: '字段', value: requirementText.value.trim() ? mockFields.length : 0 },
    { label: '文件', value: requirementText.value.trim() ? previewFiles.length : 0 },
    { label: '结构', value: canGenerate.value ? '可生成' : '待检查' }
  ])

  const readinessStats = computed(() => [
    { label: '通过项', value: passedCount.value },
    {
      label: '关注项',
      value: diagnosticItems.value.filter((item) => item.level === 'warning').length
    },
    {
      label: '阻断项',
      value: diagnosticItems.value.filter((item) => item.level === 'error').length
    },
    { label: '待写文件', value: requirementText.value.trim() ? previewFiles.length : 0 }
  ])

  const schemaText = computed(() => {
    if (!requirementText.value.trim()) return ''
    return JSON.stringify(
      {
        module: 'schedulerJob',
        group: moduleGroup.value,
        title: moduleConfig.title,
        name: moduleConfig.name,
        pagePath: moduleConfig.pagePath,
        apiPath: moduleConfig.apiPath,
        capabilities: moduleConfig.capabilities,
        strategy: moduleConfig.strategy,
        fields: mockFields.map(({ label, prop, type, inForm, inTable, required, searchable }) => ({
          label,
          prop,
          type,
          required,
          inForm,
          inTable,
          searchable
        }))
      },
      null,
      2
    )
  })

  const previewCode = computed(
    () => previewFiles.find((item) => item.path === previewFile.value)?.code ?? ''
  )

  const applyExample = (name: string) => {
    requirementText.value = `生成${name}模块，包含名称、编码、负责人、状态、创建时间，支持关键字搜索、新增、编辑、删除、详情和启停操作。`
  }

  const parseRequirement = () => {
    if (!requirementText.value.trim()) {
      ElMessage.warning('请先输入模块需求')
      return
    }
    diagnosticItems.value = structuredClone(readyDiagnostics)
    activeStep.value = 'fields'
    ElMessage.success('已生成模块底座')
  }

  const copyPreview = async () => {
    await navigator.clipboard.writeText(previewCode.value)
    ElMessage.success('代码预览已复制')
  }

  const clearCache = () => {
    requirementText.value = ''
    diagnosticItems.value = structuredClone(pendingDiagnostics)
    ElMessage.success('Mock 缓存已清除')
  }

  const startMockGenerate = () => {
    ElMessage.success('Mock 生成任务已创建')
  }
</script>
