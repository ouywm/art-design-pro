<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增定时任务' : '编辑定时任务'"
    :width="dialogWidth"
    align-center
    destroy-on-close
    body-class="!pt-2.5"
  >
    <div
      class="grid h-[min(78vh,860px)] min-h-0 grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,1fr)_308px]"
    >
      <!-- 左栏:表单 -->
      <ElScrollbar class="min-h-0 min-w-0">
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="90px"
          label-position="right"
          v-loading="detailLoading"
          class="pr-1 pb-1"
        >
          <!-- Section 1: 基础信息 -->
          <section class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">基础信息</div>
                <div class="job-section__subtitle">
                  定义任务身份、分组与处理器。处理器列表来自后端注册表,只能从下方卡片中选择。
                </div>
              </div>
            </div>
            <ElRow :gutter="18">
              <ElCol :span="12">
                <ElFormItem label="任务名称" prop="name">
                  <ElInput
                    v-model="formData.name"
                    maxlength="100"
                    placeholder="例如:清理历史操作日志"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="分组" prop="groupName">
                  <ElInput
                    v-model="formData.groupName"
                    maxlength="100"
                    placeholder="默认 default"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="任务编码" prop="handler">
                  <ElInput
                    :model-value="formData.handler"
                    readonly
                    placeholder="请从下方卡片选择处理器"
                    class="job-mono-input"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
            <div
              v-if="handlerLoading"
              class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--default-box-color)] px-3 py-6 text-center text-xs text-g-500"
            >
              加载处理器列表...
            </div>
            <div
              v-else-if="!handlerOptions.length"
              class="rounded-custom-sm border border-dashed border-[var(--default-border)] bg-[var(--default-box-color)] px-3 py-6 text-center text-xs text-g-500"
            >
              后端未返回任何 handler,请联系后端确认 /api/scheduler/handlers
            </div>
            <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                v-for="opt in handlerOptions"
                :key="opt.value"
                type="button"
                :class="[
                  'min-h-[116px] cursor-pointer rounded-custom-sm border px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(15,23,42,0.05)]',
                  formData.handler === opt.value
                    ? 'border-[var(--theme-color)] bg-[color-mix(in_srgb,var(--theme-color)_10%,var(--default-box-color))] shadow-[0_16px_28px_rgba(15,23,42,0.05)]'
                    : 'border-[var(--default-border)] bg-[var(--default-box-color)] hover:border-[color-mix(in_srgb,var(--theme-color)_35%,var(--default-border))]'
                ]"
                @click="selectHandler(opt.value)"
              >
                <div class="mb-2 flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-g-900">
                    {{ getHandlerCardTitle(opt.value) }}
                  </span>
                  <span
                    v-if="getHandlerMeta(opt.value)?.category"
                    class="rounded-full bg-[color-mix(in_srgb,var(--theme-color)_12%,transparent)] px-2 py-0.5 text-xs text-theme"
                  >
                    {{ getHandlerMeta(opt.value)!.category }}
                  </span>
                </div>
                <div
                  class="line-clamp-2 min-h-10 text-xs leading-[1.7] text-g-700"
                  :title="getHandlerCardDesc(opt.value)"
                >
                  {{ getHandlerCardDesc(opt.value) }}
                </div>
              </button>
            </div>
          </section>

          <!-- Section 2: 调度策略 -->
          <section class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">调度策略</div>
                <div class="job-section__subtitle">配置频率、启停策略与并发行为。</div>
              </div>
              <ElButton
                link
                type="primary"
                class="!px-0"
                :disabled="!currentMeta"
                @click="applyRecommended"
              >
                应用推荐配置
              </ElButton>
            </div>

            <ElFormItem label="调度类型" prop="scheduleType">
              <ElSelect
                v-model="formData.scheduleType"
                placeholder="请选择调度类型"
                style="width: 100%"
              >
                <ElOption
                  v-for="item in SCHEDULE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem v-if="formData.scheduleType === 'Cron'" label="Cron 表达式" prop="cronExpr">
              <div class="flex w-full flex-col gap-2.5">
                <ElInput
                  v-model="formData.cronExpr"
                  placeholder="点击配置 Cron 表达式"
                  class="job-mono-input"
                >
                  <template #prepend>Cron</template>
                  <template #append>
                    <ElButton link type="primary" @click="cronDialogVisible = true">配置</ElButton>
                  </template>
                </ElInput>
                <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  <div
                    class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--default-box-color)] px-3 py-3"
                  >
                    <span class="mb-1.5 block text-xs text-g-500">说明</span>
                    <strong class="block text-[13px] leading-6 text-g-900">
                      {{ cronDescription }}
                    </strong>
                  </div>
                  <div
                    class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--default-box-color)] px-3 py-3"
                  >
                    <span class="mb-1.5 block text-xs text-g-500">下次执行</span>
                    <strong class="block text-[13px] leading-6 text-g-900">
                      {{ nextFireText }}
                    </strong>
                  </div>
                </div>
              </div>
            </ElFormItem>

            <ElFormItem
              v-if="formData.scheduleType === 'FixedRate' || formData.scheduleType === 'FixedDelay'"
              label="间隔 (ms)"
              prop="intervalMs"
            >
              <ElInputNumber
                v-model="formData.intervalMs"
                :min="100"
                :step="1000"
                controls-position="right"
                style="width: 100%"
                placeholder="毫秒"
              />
            </ElFormItem>

            <ElFormItem v-if="formData.scheduleType === 'Oneshot'" label="触发时间" prop="fireTime">
              <ElDatePicker
                v-model="formData.fireTime"
                type="datetime"
                value-format="YYYY-MM-DDTHH:mm:ss"
                placeholder="选择一次性触发时间"
                clearable
                style="width: 100%"
              />
            </ElFormItem>

            <ElRow :gutter="18">
              <ElCol :span="12">
                <ElFormItem label="任务状态">
                  <ElSegmented v-model="enabledSeg" :options="ENABLED_SEG_OPTIONS" class="w-full" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="并发策略" prop="blocking">
                  <ElSelect v-model="formData.blocking" style="width: 100%">
                    <ElOption
                      v-for="item in BLOCKING_STRATEGY_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </section>

          <!-- Section 2.6: 高级设置(默认折叠) -->
          <section class="job-section">
            <ElCollapse>
              <ElCollapseItem name="advanced">
                <template #title>
                  <div>
                    <div class="job-section__title">高级设置</div>
                    <div class="job-section__subtitle">
                      Misfire 补跑、路由策略、超时、重试、去重、分片 —— 默认值能满足大部分场景。
                    </div>
                  </div>
                </template>
                <ElRow :gutter="18" class="pt-2">
                  <ElCol :span="12">
                    <ElFormItem label="Misfire" prop="misfire">
                      <ElSelect v-model="formData.misfire" style="width: 100%">
                        <ElOption
                          v-for="item in MISFIRE_STRATEGY_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="超时 (ms)" prop="timeoutMs">
                      <ElInputNumber
                        v-model="formData.timeoutMs"
                        :min="0"
                        :step="1000"
                        controls-position="right"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="最大重试" prop="retryMax">
                      <ElInputNumber
                        v-model="formData.retryMax"
                        :min="0"
                        :step="1"
                        controls-position="right"
                        style="width: 100%"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol v-if="formData.retryMax > 0" :span="12">
                    <ElFormItem label="重试退避" prop="retryBackoff">
                      <ElSelect v-model="formData.retryBackoff" style="width: 100%">
                        <ElOption
                          v-for="item in RETRY_BACKOFF_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="24">
                    <ElFormItem label="去重 Key">
                      <ElInput
                        v-model="formData.uniqueKey"
                        placeholder="留空=不去重;填 params 按参数去重;或写自定义字符串作全局锁"
                        class="job-mono-input"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>
          </section>

          <!-- Section 2.5: Rhai 脚本(handler === script::rhai 时显示) -->
          <section v-if="isRhaiHandler" class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">Rhai 脚本</div>
                <div class="job-section__subtitle"
                  >handler 选择 script::rhai 时,在此填写脚本源码,可用「试运行」实时验证。</div
                >
              </div>
              <ElButton
                type="primary"
                plain
                :loading="dryrunLoading"
                :disabled="!formData.script"
                @click="runDryrun"
              >
                试运行
              </ElButton>
            </div>
            <ElFormItem label="脚本引擎" prop="scriptEngine">
              <ElSelect
                v-model="formData.scriptEngine"
                placeholder="请选择脚本引擎"
                style="width: 100%"
              >
                <ElOption
                  v-for="item in SCRIPT_ENGINE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.value === 'lua'"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="脚本源码" prop="script">
              <ElInput
                v-model="formData.script"
                type="textarea"
                :rows="10"
                class="script-textarea"
                placeholder="例:log_info(`hi user ${params.userId}`); #{ ok: true }"
              />
            </ElFormItem>

            <!-- 试运行结果 -->
            <div
              v-if="dryrunResult"
              class="dryrun-result"
              :class="dryrunResult.ok ? 'dryrun-result--ok' : 'dryrun-result--err'"
            >
              <div class="dryrun-result__head">
                <ElTag :type="dryrunResult.ok ? 'success' : 'danger'" size="small">
                  {{ dryrunResult.ok ? '执行成功' : '执行失败' }}
                </ElTag>
                <span class="dryrun-result__meta">耗时 {{ dryrunResult.durationMs }} ms</span>
                <ElButton link type="info" class="!ml-auto !px-0" @click="clearDryrunResult">
                  清除结果
                </ElButton>
              </div>

              <div v-if="dryrunResult.error" class="dryrun-result__section">
                <div class="dryrun-result__label">错误信息</div>
                <pre class="dryrun-result__pre dryrun-result__pre--err">{{
                  dryrunResult.error
                }}</pre>
              </div>

              <div v-if="dryrunResult.ok" class="dryrun-result__section">
                <div class="dryrun-result__label">返回值</div>
                <pre class="dryrun-result__pre">{{ formatDryrunValue(dryrunResult.result) }}</pre>
              </div>

              <div v-if="dryrunResult.logs?.length" class="dryrun-result__section">
                <div class="dryrun-result__label">脚本日志 ({{ dryrunResult.logs.length }} 条)</div>
                <pre class="dryrun-result__pre dryrun-result__pre--log">{{
                  dryrunResult.logs.join('\n')
                }}</pre>
              </div>
            </div>
          </section>

          <!-- Section 3: 任务参数 -->
          <section class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">任务参数</div>
                <div class="job-section__subtitle">
                  按处理器能力填写运行参数,建议优先使用默认值。
                </div>
              </div>
              <ElButton
                link
                type="primary"
                class="!px-0"
                :disabled="!hasParamsSchema"
                @click="restoreDefaultParams"
              >
                恢复默认参数
              </ElButton>
            </div>

            <div class="mb-3">
              <ElSegmented
                v-model="paramsMode"
                :options="PARAMS_MODE_OPTIONS"
                :disabled="!hasParamsSchema"
              />
            </div>

            <!-- 卡片表单模式 -->
            <template v-if="paramsMode === 'form' && hasParamsSchema">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div
                  v-for="schema in currentMeta!.paramsSchema"
                  :key="schema.key"
                  class="rounded-custom-sm border border-[var(--default-border)] bg-[var(--g-100,var(--default-box-color))] p-3.5"
                >
                  <div class="mb-3">
                    <div class="mb-1 text-sm font-semibold text-g-900">{{ schema.label }}</div>
                    <div v-if="schema.description" class="text-xs leading-6 text-g-600">
                      {{ schema.description }}
                    </div>
                  </div>
                  <ElInputNumber
                    v-if="schema.type === 'number'"
                    :model-value="paramsObject[schema.key] as number"
                    :min="schema.min"
                    :max="schema.max"
                    :step="schema.step ?? 1"
                    controls-position="right"
                    class="w-full"
                    @update:model-value="(v) => (paramsObject[schema.key] = v ?? schema.default)"
                  />
                  <ElSwitch
                    v-else-if="schema.type === 'switch'"
                    :model-value="paramsObject[schema.key] as boolean"
                    @update:model-value="(v) => (paramsObject[schema.key] = v)"
                  />
                  <ElInput
                    v-else
                    :model-value="paramsObject[schema.key] as string"
                    @update:model-value="(v) => (paramsObject[schema.key] = v)"
                  />
                </div>
              </div>
            </template>

            <!-- JSON 高级模式 / 没 schema 时回退 -->
            <template v-else>
              <ElFormItem label="paramsJson" prop="paramsJsonText" label-width="90px">
                <ElInput
                  v-model="formData.paramsJsonText"
                  type="textarea"
                  :rows="6"
                  class="json-textarea"
                  placeholder='任意 JSON,handler 内通过 ctx.params 拿到。例:{"userId": 100}'
                />
              </ElFormItem>
            </template>
          </section>

          <!-- Section 4: 补充说明 -->
          <section class="job-section">
            <div class="mb-4">
              <div class="job-section__title">补充说明</div>
              <div class="job-section__subtitle">记录维护说明、变更背景或特殊执行约束。</div>
            </div>
            <ElFormItem label="备注" prop="description" class="!mb-0">
              <ElInput
                v-model="formData.description"
                type="textarea"
                maxlength="500"
                show-word-limit
                :rows="4"
                placeholder="请输入任务备注"
              />
            </ElFormItem>
          </section>
        </ElForm>
      </ElScrollbar>

      <!-- 右栏:侧边栏 -->
      <ElScrollbar class="min-h-0 xl:overflow-hidden">
        <div class="flex min-h-full flex-col gap-3.5 pb-1">
          <!-- 当前处理器 -->
          <div
            class="rounded-[calc(var(--custom-radius)+4px)] border border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-color)_78%,#10213a)_0%,var(--theme-color)_100%)] p-4"
          >
            <div class="mb-2 text-xs font-semibold text-white/72">当前处理器</div>
            <div class="mb-2 text-lg font-bold text-white">
              {{ currentMeta?.label || formData.handler || '未选择' }}
            </div>
            <div class="text-[13px] leading-7 text-white/86">
              {{ currentMeta?.description || '请在左侧选择或填写处理器编码。' }}
            </div>
          </div>

          <!-- 配置摘要 -->
          <div
            class="rounded-[calc(var(--custom-radius)+4px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 text-xs font-semibold text-g-600">配置摘要</div>
            <ul class="m-0 flex list-none flex-col gap-2.5 p-0">
              <li
                v-for="item in summaryItems"
                :key="item.label"
                class="flex items-center justify-between gap-3 text-[13px] text-g-700"
              >
                <span>{{ item.label }}</span>
                <strong class="max-w-[160px] truncate text-right text-g-900" :title="item.value">
                  {{ item.value }}
                </strong>
              </li>
            </ul>
          </div>

          <!-- 推荐设置 -->
          <div
            class="rounded-[calc(var(--custom-radius)+4px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 text-xs font-semibold text-g-600">推荐设置</div>
            <div class="flex flex-col gap-2.5 text-[13px] leading-7 text-g-700">
              <div v-for="(line, idx) in recommendedTips" :key="idx">{{ line }}</div>
            </div>
          </div>

          <!-- 默认参数 -->
          <div
            v-if="hasParamsSchema"
            class="rounded-[calc(var(--custom-radius)+4px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 text-xs font-semibold text-g-600">默认参数</div>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="schema in currentMeta!.paramsSchema"
                :key="schema.key"
                class="flex items-center justify-between gap-3 text-[13px] text-g-700"
              >
                <span>{{ schema.label }}</span>
                <strong class="max-w-[160px] truncate text-right text-g-900">
                  {{ formatDefault(schema.default) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </ElScrollbar>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>

  <CronConfigDialog
    v-model:visible="cronDialogVisible"
    :cron="formData.cronExpr"
    @confirm="(value) => (formData.cronExpr = value)"
  />
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
  import { fetchCreateJob, fetchGetJobDetail, fetchUpdateJob } from '@/api/scheduler-job'
  import { fetchScriptDryrun } from '@/api/scheduler-script'
  import type { DialogType } from '@/types'
  import {
    BLOCKING_STRATEGY_OPTIONS,
    DEFAULT_SCRIPT_ENGINE,
    MISFIRE_STRATEGY_OPTIONS,
    RETRY_BACKOFF_OPTIONS,
    RHAI_HANDLER,
    SCHEDULE_TYPE_OPTIONS,
    SCRIPT_ENGINE_OPTIONS,
    summarizeSchedule
  } from '../../constants'
  import { computeNextFires, humanizeCron, validateCron } from '../../utils/cron-preview'
  import { HANDLER_META, getHandlerMeta } from '../handler-meta'
  // 注意:HANDLER_META 仅用于补全后端 handler 的描述/类别/参数 schema(可选元数据)
  // 处理器卡片本身从 props.handlerOptions 来,以后端为准
  void HANDLER_META
  import type { FormModel, HandlerOption, JobListItem } from '../types'
  import CronConfigDialog from './cron-config-dialog.vue'

  interface Props {
    visible: boolean
    type: DialogType
    jobData?: Partial<JobListItem>
    handlerOptions: HandlerOption[]
    handlerLoading?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const dialogWidth = computed(() =>
    width.value < 1024 ? '94vw' : 'min(1120px, calc(100vw - 32px))'
  )

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)
  const cronDialogVisible = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // ============ 表单模型 ============

  const createDefaultFormData = (): FormModel => ({
    name: '',
    groupName: 'default',
    description: '',
    handler: '',
    scheduleType: 'Cron',
    cronExpr: '',
    intervalMs: undefined,
    fireTime: '',
    script: '',
    scriptEngine: undefined,
    paramsJsonText: '{}',
    enabled: true,
    blocking: 'Serial',
    misfire: 'FireNow',
    timeoutMs: 0,
    retryMax: 0,
    retryBackoff: 'Exponential',
    uniqueKey: '',
    tenantId: undefined
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const isRhaiHandler = computed(() => formData.handler === RHAI_HANDLER)

  // ============ 启用/停用 segmented(双向同步 enabled boolean) ============

  const ENABLED_SEG_OPTIONS = [
    { label: '启用', value: 'on' },
    { label: '停用', value: 'off' }
  ]

  const enabledSeg = computed({
    get: () => (formData.enabled ? 'on' : 'off'),
    set: (v: string) => {
      formData.enabled = v === 'on'
    }
  })

  // ============ 任务参数模式切换 ============

  const PARAMS_MODE_OPTIONS = [
    { label: '卡片表单', value: 'form' },
    { label: 'JSON 高级', value: 'json' }
  ]

  const paramsMode = ref<'form' | 'json'>('form')
  const paramsObject = reactive<Record<string, unknown>>({})

  // ============ Rhai 试运行 ============

  const dryrunLoading = ref(false)
  const dryrunResult = ref<Api.Scheduler.ScriptDryrunResult | null>(null)

  const buildDryrunParams = (): unknown => {
    if (paramsMode.value === 'form' && hasParamsSchema.value) {
      return { ...paramsObject }
    }
    const text = formData.paramsJsonText.trim()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      throw new Error('paramsJson 不是合法 JSON')
    }
  }

  const runDryrun = async () => {
    if (!isRhaiHandler.value) {
      ElMessage.warning('仅 script::rhai 处理器支持试运行')
      return
    }
    if (!formData.script || !formData.script.trim()) {
      ElMessage.warning('请先填写脚本源码')
      return
    }
    let params: unknown
    try {
      params = buildDryrunParams()
    } catch (e) {
      ElMessage.error((e as Error).message)
      return
    }
    dryrunLoading.value = true
    try {
      const result = await fetchScriptDryrun({
        engine: 'rhai',
        script: formData.script,
        params,
        timeoutMs: 5000
      })
      dryrunResult.value = result
      if (result.ok) {
        ElMessage.success(`试运行成功 (${result.durationMs} ms)`)
      } else {
        ElMessage.error('试运行失败,详见下方结果')
      }
    } finally {
      dryrunLoading.value = false
    }
  }

  const clearDryrunResult = () => {
    dryrunResult.value = null
  }

  const formatDryrunValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  const currentMeta = computed(() => getHandlerMeta(formData.handler))
  const hasParamsSchema = computed(
    () => !!currentMeta.value && currentMeta.value.paramsSchema.length > 0
  )

  // ============ 处理器卡片选中 ============

  const selectHandler = (name: string) => {
    formData.handler = name
  }

  // ============ 处理器卡片显示文案(后端 name → 前端 meta 兜底) ============

  const getHandlerCardTitle = (name: string): string => {
    return getHandlerMeta(name)?.label || name
  }

  const getHandlerCardDesc = (name: string): string => {
    return getHandlerMeta(name)?.description || '该处理器暂无介绍,可直接使用并自定义参数。'
  }

  // ============ 应用推荐配置 ============

  const applyRecommended = () => {
    const meta = currentMeta.value
    if (!meta) return
    formData.scheduleType = 'Cron'
    formData.cronExpr = meta.recommendedCron
    formData.blocking = meta.recommendedBlocking
    ElMessage.success('已应用推荐配置')
  }

  // ============ 恢复默认参数 ============

  const restoreDefaultParams = () => {
    if (!currentMeta.value) return
    Object.keys(paramsObject).forEach((k) => delete paramsObject[k])
    currentMeta.value.paramsSchema.forEach((s) => {
      paramsObject[s.key] = s.default
    })
    syncParamsObjectToJson()
    ElMessage.success('已恢复默认参数')
  }

  // ============ 卡片 ↔ JSON 双向同步 ============

  const syncParamsObjectToJson = () => {
    try {
      formData.paramsJsonText = JSON.stringify(paramsObject, null, 2)
    } catch {
      // 忽略
    }
  }

  watch(
    paramsObject,
    () => {
      if (paramsMode.value === 'form') syncParamsObjectToJson()
    },
    { deep: true }
  )

  watch(paramsMode, (mode, prev) => {
    if (mode === 'form' && prev === 'json') {
      // JSON → 表单:尝试解析,失败则切回 json
      try {
        const parsed = JSON.parse(formData.paramsJsonText || '{}')
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          Object.keys(paramsObject).forEach((k) => delete paramsObject[k])
          Object.assign(paramsObject, parsed)
        }
      } catch {
        ElMessage.warning('当前 JSON 格式无效,已保留 JSON 模式')
        nextTick(() => (paramsMode.value = 'json'))
      }
    }
  })

  // 处理器变化:若卡片模式且 schema 存在,初始化 paramsObject
  watch(
    () => formData.handler,
    (handler) => {
      const meta = getHandlerMeta(handler)
      // RHAI 联动
      if (handler === RHAI_HANDLER) {
        if (!formData.scriptEngine) formData.scriptEngine = DEFAULT_SCRIPT_ENGINE
      } else {
        formData.script = ''
        formData.scriptEngine = undefined
        dryrunResult.value = null
      }
      // 切到没 schema 的 handler:回退到 JSON
      if (!meta || meta.paramsSchema.length === 0) {
        paramsMode.value = 'json'
        return
      }
      // 有 schema:用现有 JSON 解析填充,缺失键用 default 兜底
      let parsed: Record<string, unknown> = {}
      try {
        parsed = JSON.parse(formData.paramsJsonText || '{}') || {}
      } catch {
        parsed = {}
      }
      Object.keys(paramsObject).forEach((k) => delete paramsObject[k])
      meta.paramsSchema.forEach((s) => {
        paramsObject[s.key] = s.key in parsed ? parsed[s.key] : s.default
      })
      syncParamsObjectToJson()
    }
  )

  // ============ 校验 ============

  const validateScheduleField: FormItemRule['validator'] = (_rule, value, callback) => {
    const type = formData.scheduleType
    if (type === 'Cron') {
      if (!String(value || '').trim()) {
        callback(new Error('Cron 任务必须填写表达式'))
        return
      }
    } else if (type === 'FixedRate' || type === 'FixedDelay') {
      if (typeof formData.intervalMs !== 'number' || formData.intervalMs <= 0) {
        callback(new Error('固定频率/延迟任务必须填写大于 0 的间隔'))
        return
      }
    } else if (type === 'Oneshot') {
      if (!String(value || '').trim()) {
        callback(new Error('一次性任务必须填写触发时间'))
        return
      }
    }
    callback()
  }

  const validateScript: FormItemRule['validator'] = (_rule, value, callback) => {
    if (!isRhaiHandler.value) {
      callback()
      return
    }
    if (!String(value || '').trim()) {
      callback(new Error('handler 选择 script::rhai 时必须提供脚本'))
      return
    }
    callback()
  }

  const validateParamsJson: FormItemRule['validator'] = (_rule, value, callback) => {
    const text = String(value || '').trim()
    if (!text) {
      callback()
      return
    }
    try {
      JSON.parse(text)
      callback()
    } catch {
      callback(new Error('JSON 格式不合法'))
    }
  }

  const rules: FormRules = {
    name: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { min: 1, max: 128, message: '名称长度 1-128', trigger: 'blur' }
    ],
    handler: [{ required: true, message: '请填写或选择任务编码', trigger: 'change' }],
    scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
    cronExpr: [{ validator: validateScheduleField, trigger: 'change' }],
    intervalMs: [{ validator: validateScheduleField, trigger: 'change' }],
    fireTime: [{ validator: validateScheduleField, trigger: 'change' }],
    script: [{ validator: validateScript, trigger: 'change' }],
    paramsJsonText: [{ validator: validateParamsJson, trigger: 'blur' }]
  }

  // ============ Cron 描述 / 下次执行 ============

  const cronDescription = computed(() => {
    if (!formData.cronExpr) return '请先填写或配置 Cron 表达式'
    const v = validateCron(formData.cronExpr)
    return v.valid ? humanizeCron(formData.cronExpr) : v.reason || '表达式不合法'
  })

  const nextFireText = computed(() => {
    if (!formData.cronExpr) return '-'
    try {
      const list = computeNextFires(formData.cronExpr, 1)
      return list[0]?.local || '-'
    } catch {
      return '-'
    }
  })

  // ============ 配置摘要 / 推荐说明 ============

  type SummaryItem = { label: string; value: string }
  const summaryItems = computed<SummaryItem[]>(() => {
    const items: SummaryItem[] = [
      { label: '任务编码', value: formData.handler || '-' },
      { label: '执行状态', value: formData.enabled ? '启用' : '停用' },
      {
        label: '并发策略',
        value: BLOCKING_STRATEGY_OPTIONS.find((o) => o.value === formData.blocking)?.label || '-'
      },
      {
        label: '分组',
        value: formData.groupName || 'default'
      },
      {
        label: 'Cron',
        value:
          formData.scheduleType === 'Cron'
            ? formData.cronExpr || '-'
            : summarizeSchedule(
                formData.scheduleType,
                formData.cronExpr,
                formData.intervalMs ?? null,
                formData.fireTime || null
              ) || '-'
      }
    ]
    if (currentMeta.value && hasParamsSchema.value) {
      items.push({ label: '参数项数', value: String(currentMeta.value.paramsSchema.length) })
    }
    return items
  })

  const recommendedTips = computed(() => {
    const meta = currentMeta.value
    if (!meta) {
      return [
        '选择处理器后,这里会显示对应分类的推荐执行策略。',
        '日志清理类任务建议安排在业务低峰期执行。',
        '任务编码建议长期稳定,便于后续接入告警与审计检索。'
      ]
    }
    return [
      `${meta.category}类任务推荐 Cron: ${meta.recommendedCron} (${humanizeCron(meta.recommendedCron) || '自定义'})`,
      `并发策略推荐: ${BLOCKING_STRATEGY_OPTIONS.find((o) => o.value === meta.recommendedBlocking)?.label || meta.recommendedBlocking}(${meta.category}类任务的建议默认值)`,
      '任务编码建议长期稳定,便于后续接入告警、监控与审计检索。'
    ]
  })

  const formatDefault = (v: unknown): string => {
    if (typeof v === 'boolean') return v ? '是' : '否'
    if (v === null || v === undefined) return '-'
    return String(v)
  }

  // ============ 加载详情 ============

  const stringifyJson = (value: unknown) => {
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return ''
    }
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
    Object.keys(paramsObject).forEach((k) => delete paramsObject[k])
    paramsMode.value = 'form'
    dryrunResult.value = null
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.jobData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetJobDetail(props.jobData!.id!)
      Object.assign(formData, {
        name: detail.name,
        groupName: detail.groupName || 'default',
        description: detail.description || '',
        handler: detail.handler,
        scheduleType: detail.scheduleType,
        cronExpr: detail.cronExpr || '',
        intervalMs: detail.intervalMs ?? undefined,
        fireTime: detail.fireTime || '',
        script: detail.script || '',
        scriptEngine: detail.scriptEngine ?? undefined,
        paramsJsonText: stringifyJson(detail.paramsJson),
        enabled: detail.enabled,
        blocking: detail.blocking,
        misfire: detail.misfire,
        timeoutMs: detail.timeoutMs ?? 0,
        retryMax: detail.retryMax ?? 0,
        retryBackoff: detail.retryBackoff,
        uniqueKey: detail.uniqueKey || '',
        tenantId: detail.tenantId ?? undefined
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.jobData?.id],
    async ([visible]) => {
      if (!visible) return
      await initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  // ============ 提交 ============

  const buildSchedulePayload = () => {
    const type = formData.scheduleType
    return {
      cronExpr: type === 'Cron' ? formData.cronExpr.trim() || null : null,
      intervalMs:
        type === 'FixedRate' || type === 'FixedDelay'
          ? Number(formData.intervalMs ?? 0) || null
          : null,
      fireTime: type === 'Oneshot' ? formData.fireTime || null : null
    }
  }

  const buildScriptPayload = () => {
    if (formData.handler === RHAI_HANDLER) {
      return {
        script: formData.script || null,
        scriptEngine: formData.scriptEngine ?? DEFAULT_SCRIPT_ENGINE
      }
    }
    return { script: null, scriptEngine: null }
  }

  const buildParamsJson = (): unknown => {
    if (paramsMode.value === 'form' && hasParamsSchema.value) {
      return { ...paramsObject }
    }
    const text = formData.paramsJsonText.trim()
    return text ? JSON.parse(text) : {}
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      const paramsJson = buildParamsJson()
      const schedule = buildSchedulePayload()
      const scriptFields = buildScriptPayload()

      if (dialogType.value === 'add') {
        const createPayload: Api.Scheduler.CreateJobParams = {
          name: formData.name.trim(),
          groupName: formData.groupName.trim() || undefined,
          description: formData.description.trim() || undefined,
          handler: formData.handler,
          scheduleType: formData.scheduleType,
          cronExpr: schedule.cronExpr ?? undefined,
          intervalMs: schedule.intervalMs ?? undefined,
          fireTime: schedule.fireTime ?? undefined,
          paramsJson,
          script: scriptFields.script ?? undefined,
          scriptEngine: scriptFields.scriptEngine ?? undefined,
          enabled: formData.enabled,
          blocking: formData.blocking,
          misfire: formData.misfire,
          timeoutMs: formData.timeoutMs,
          retryMax: formData.retryMax,
          retryBackoff: formData.retryBackoff,
          uniqueKey: formData.uniqueKey.trim() || undefined,
          tenantId: formData.tenantId
        }
        await fetchCreateJob(createPayload)
        ElMessage.success('新增成功')
        dialogVisible.value = false
        emit('submit', dialogType.value)
        return
      }

      if (props.jobData?.id) {
        const updatePayload: Api.Scheduler.UpdateJobParams = {
          name: formData.name.trim(),
          groupName: formData.groupName.trim(),
          description: formData.description.trim(),
          handler: formData.handler,
          scheduleType: formData.scheduleType,
          cronExpr: schedule.cronExpr,
          intervalMs: schedule.intervalMs,
          fireTime: schedule.fireTime,
          paramsJson,
          script: scriptFields.script,
          scriptEngine: scriptFields.scriptEngine,
          enabled: formData.enabled,
          blocking: formData.blocking,
          misfire: formData.misfire,
          timeoutMs: formData.timeoutMs,
          retryMax: formData.retryMax,
          retryBackoff: formData.retryBackoff,
          uniqueKey: formData.uniqueKey.trim() || null
        }
        await fetchUpdateJob(props.jobData.id, updatePayload)
        ElMessage.success('更新成功')
        dialogVisible.value = false
        emit('submit', dialogType.value)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .job-section {
    padding: 18px 18px 14px;
    margin-bottom: 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: calc(var(--custom-radius) + 4px);

    &:last-of-type {
      margin-bottom: 0;
    }

    &__head {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;

      @media (width >= 768px) {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }
    }

    &__title {
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--art-text-gray-900);
    }

    &__subtitle {
      font-size: 12px;
      color: var(--art-text-gray-600);
    }
  }

  .job-mono-input :deep(.el-input__inner) {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  .script-textarea :deep(.el-textarea__inner),
  .json-textarea :deep(.el-textarea__inner) {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 12.5px;
    line-height: 1.55;
  }

  .dryrun-result {
    padding: 14px 16px;
    margin-top: 12px;
    background: color-mix(in srgb, var(--default-box-color) 96%, transparent);
    border: 1px solid var(--default-border);
    border-radius: var(--custom-radius);

    &--ok {
      background: color-mix(in srgb, var(--el-color-success-light-9) 60%, var(--default-box-color));
      border-color: color-mix(in srgb, var(--el-color-success) 35%, var(--default-border));
    }

    &--err {
      background: color-mix(in srgb, var(--el-color-danger-light-9) 60%, var(--default-box-color));
      border-color: color-mix(in srgb, var(--el-color-danger) 35%, var(--default-border));
    }

    &__head {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }

    &__meta {
      font-size: 12px;
      color: var(--art-text-gray-600);
    }

    &__section {
      margin-top: 10px;

      &:first-of-type {
        margin-top: 0;
      }
    }

    &__label {
      margin-bottom: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--art-text-gray-700);
    }

    &__pre {
      max-height: 220px;
      padding: 10px 12px;
      margin: 0;
      overflow: auto;
      font-family:
        ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: var(--art-text-gray-900);
      word-break: break-all;
      white-space: pre-wrap;
      background: var(--art-bg-page-color);
      border-radius: calc(var(--custom-radius) - 2px);

      &--err {
        color: var(--el-color-danger);
      }

      &--log {
        color: var(--art-text-gray-700);
      }
    }
  }
</style>
