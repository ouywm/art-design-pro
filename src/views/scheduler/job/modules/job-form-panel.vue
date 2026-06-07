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
      class="grid h-[min(78vh,820px)] min-h-0 grid-cols-1 gap-[18px] xl:grid-cols-[minmax(0,1fr)_300px]"
    >
      <ElScrollbar class="min-h-0 min-w-0">
        <ElForm
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="108px"
          label-position="right"
          v-loading="detailLoading"
          class="pr-1 pb-1"
        >
          <section class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">基础信息</div>
                <div class="job-section__subtitle">
                  真实后端使用 namespace、appName 和 key 标识任务，处理器填写 RatchJob Bean 名称。
                </div>
              </div>
            </div>

            <ElRow :gutter="18">
              <ElCol :span="12">
                <ElFormItem label="命名空间" prop="namespace">
                  <ElInput v-model="formData.namespace" maxlength="128" placeholder="例如 xxl" />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="应用" prop="appName">
                  <ElInput
                    v-model="formData.appName"
                    maxlength="128"
                    placeholder="例如 summerrs-admin-executor"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="任务 Key" prop="key">
                  <ElInput
                    v-model="formData.key"
                    maxlength="128"
                    placeholder="例如 socket-session-gc"
                    class="job-mono-input"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="运行模式" prop="runMode">
                  <ElSelect v-model="formData.runMode" placeholder="请选择运行模式" class="w-full">
                    <ElOption
                      v-for="item in RUN_MODE_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="处理器" prop="handleName">
                  <ElInput
                    v-model="formData.handleName"
                    maxlength="256"
                    placeholder="BEAN 模式必填，例如 socket_session_gc"
                    class="job-mono-input"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="任务描述" prop="description">
                  <ElInput
                    v-model="formData.description"
                    maxlength="500"
                    show-word-limit
                    placeholder="请输入任务描述"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </section>

          <section class="job-section">
            <div class="job-section__head">
              <div>
                <div class="job-section__title">调度策略</div>
                <div class="job-section__subtitle"
                  >按 RatchJob Open API 的调度类型填写对应参数。</div
                >
              </div>
            </div>

            <ElFormItem label="调度类型" prop="scheduleType">
              <ElSelect v-model="formData.scheduleType" placeholder="请选择调度类型" class="w-full">
                <ElOption
                  v-for="item in SCHEDULE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem
              v-if="formData.scheduleType === 'CRON'"
              label="Cron 表达式"
              prop="cronValue"
            >
              <div class="flex w-full flex-col gap-2.5">
                <ElInput
                  v-model="formData.cronValue"
                  placeholder="例如 0 */10 * * * *"
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
              v-if="formData.scheduleType === 'INTERVAL'"
              label="间隔秒数"
              prop="intervalSecond"
            >
              <ElInputNumber
                v-model="formData.intervalSecond"
                :min="1"
                :step="10"
                controls-position="right"
                class="w-full"
              />
            </ElFormItem>

            <ElFormItem
              v-if="formData.scheduleType === 'DELAY'"
              label="延迟秒数"
              prop="delaySecond"
            >
              <ElInputNumber
                v-model="formData.delaySecond"
                :min="1"
                :step="10"
                controls-position="right"
                class="w-full"
              />
            </ElFormItem>

            <ElFormItem label="任务状态">
              <ElSegmented v-model="enableSeg" :options="ENABLE_SEG_OPTIONS" />
            </ElFormItem>
          </section>

          <section class="job-section">
            <ElCollapse>
              <ElCollapseItem name="advanced">
                <template #title>
                  <div>
                    <div class="job-section__title">高级设置</div>
                    <div class="job-section__subtitle">
                      路由、补跑、阻塞、超时和重试策略；默认值覆盖大部分任务。
                    </div>
                  </div>
                </template>
                <ElRow :gutter="18" class="pt-2">
                  <ElCol :span="12">
                    <ElFormItem label="路由策略" prop="routerStrategy">
                      <ElSelect v-model="formData.routerStrategy" class="w-full">
                        <ElOption
                          v-for="item in ROUTER_STRATEGY_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="补跑策略" prop="pastDueStrategy">
                      <ElSelect v-model="formData.pastDueStrategy" class="w-full">
                        <ElOption
                          v-for="item in PAST_DUE_STRATEGY_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="阻塞策略" prop="blockingStrategy">
                      <ElSelect v-model="formData.blockingStrategy" class="w-full">
                        <ElOption
                          v-for="item in BLOCKING_STRATEGY_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="超时秒数" prop="timeoutSecond">
                      <ElInputNumber
                        v-model="formData.timeoutSecond"
                        :min="0"
                        :step="10"
                        controls-position="right"
                        class="w-full"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="重试次数" prop="tryTimes">
                      <ElInputNumber
                        v-model="formData.tryTimes"
                        :min="0"
                        :step="1"
                        controls-position="right"
                        class="w-full"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="重试间隔" prop="retryInterval">
                      <ElInputNumber
                        v-model="formData.retryInterval"
                        :min="0"
                        :step="5"
                        controls-position="right"
                        class="w-full"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
              </ElCollapseItem>
            </ElCollapse>
          </section>

          <section class="job-section">
            <div class="mb-4">
              <div class="job-section__title">任务参数</div>
              <div class="job-section__subtitle">
                真实后端字段为 triggerParam，按字符串发送，最长 4000 字符。
              </div>
            </div>
            <ElFormItem label="触发参数" prop="triggerParamText" class="!mb-0">
              <ElInput
                v-model="formData.triggerParamText"
                type="textarea"
                maxlength="4000"
                show-word-limit
                :rows="6"
                class="json-textarea"
                placeholder='例如 {"userId": 100}，也可以留空'
              />
            </ElFormItem>
          </section>
        </ElForm>
      </ElScrollbar>

      <ElScrollbar class="min-h-0 xl:overflow-hidden">
        <div class="flex min-h-full flex-col gap-3.5 pb-1">
          <div
            class="rounded-[calc(var(--custom-radius)+4px)] border border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-color)_78%,#10213a)_0%,var(--theme-color)_100%)] p-4"
          >
            <div class="mb-2 text-xs font-semibold text-white/72">当前处理器</div>
            <div class="mb-2 text-lg font-bold text-white">
              {{ formData.handleName || '未填写' }}
            </div>
            <div class="text-[13px] leading-7 text-white/86">
              BEAN 模式会调用执行器中注册的 handleName。
            </div>
          </div>

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

          <div
            class="rounded-[calc(var(--custom-radius)+4px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 text-xs font-semibold text-g-600">字段提示</div>
            <div class="flex flex-col gap-2.5 text-[13px] leading-7 text-g-700">
              <div>appName 与 namespace 必填，长度 1-128。</div>
              <div>CRON 必填 cronValue，INTERVAL/DELAY 必填对应秒数。</div>
              <div>第一版真实后端暂不提供手动触发接口。</div>
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
    :cron="formData.cronValue"
    @confirm="(value) => (formData.cronValue = value)"
  />
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
  import { fetchCreateJob, fetchGetJobDetail, fetchUpdateJob } from '@/api/scheduler-job'
  import type { DialogType } from '@/types'
  import {
    BLOCKING_STRATEGY_OPTIONS,
    PAST_DUE_STRATEGY_OPTIONS,
    ROUTER_STRATEGY_OPTIONS,
    RUN_MODE_OPTIONS,
    SCHEDULE_TYPE_OPTIONS,
    getRunModeLabel,
    getScheduleTypeLabel,
    summarizeSchedule
  } from '../../constants'
  import { computeNextFires, humanizeCron, validateCron } from '../../utils/cron-preview'
  import type { FormModel, JobListItem } from '../types'
  import {
    buildCreateJobPayload,
    buildUpdateJobPayload,
    createDefaultFormData
  } from '../job-payload'
  import CronConfigDialog from './cron-config-dialog.vue'

  interface Props {
    visible: boolean
    type: DialogType
    jobData?: Partial<JobListItem>
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
  const formData = reactive<FormModel>(createDefaultFormData())

  const ENABLE_SEG_OPTIONS = [
    { label: '启用', value: 'on' },
    { label: '停用', value: 'off' }
  ]

  const enableSeg = computed({
    get: () => (formData.enable ? 'on' : 'off'),
    set: (value: string) => {
      formData.enable = value === 'on'
    }
  })

  const validateBeanHandle: FormItemRule['validator'] = (_rule, value, callback) => {
    if (formData.runMode === 'BEAN' && !String(value || '').trim()) {
      callback(new Error('BEAN 运行模式必须填写处理器名称'))
      return
    }
    callback()
  }

  const validateScheduleField: FormItemRule['validator'] = (_rule, value, callback) => {
    const type = formData.scheduleType
    if (type === 'CRON' && !String(value || '').trim()) {
      callback(new Error('CRON 调度必须填写 Cron 表达式'))
      return
    }
    if (type === 'INTERVAL' && (!formData.intervalSecond || formData.intervalSecond <= 0)) {
      callback(new Error('固定间隔任务必须填写大于 0 的间隔秒数'))
      return
    }
    if (type === 'DELAY' && (!formData.delaySecond || formData.delaySecond <= 0)) {
      callback(new Error('延迟任务必须填写大于 0 的延迟秒数'))
      return
    }
    callback()
  }

  const rules: FormRules = {
    appName: [
      { required: true, message: '请输入应用名称', trigger: 'blur' },
      { min: 1, max: 128, message: '长度 1-128', trigger: 'blur' }
    ],
    namespace: [
      { required: true, message: '请输入命名空间', trigger: 'blur' },
      { min: 1, max: 128, message: '长度 1-128', trigger: 'blur' }
    ],
    key: [{ max: 128, message: '最长 128 个字符', trigger: 'blur' }],
    description: [{ max: 500, message: '最长 500 个字符', trigger: 'blur' }],
    handleName: [
      { validator: validateBeanHandle, trigger: 'blur' },
      { max: 256, message: '最长 256 个字符', trigger: 'blur' }
    ],
    scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
    cronValue: [{ validator: validateScheduleField, trigger: 'change' }],
    intervalSecond: [{ validator: validateScheduleField, trigger: 'change' }],
    delaySecond: [{ validator: validateScheduleField, trigger: 'change' }],
    triggerParamText: [{ max: 4000, message: '最长 4000 个字符', trigger: 'blur' }]
  }

  const cronDescription = computed(() => {
    if (!formData.cronValue) return '请先填写或配置 Cron 表达式'
    const result = validateCron(formData.cronValue)
    return result.valid ? humanizeCron(formData.cronValue) : result.reason || '表达式不合法'
  })

  const nextFireText = computed(() => {
    if (!formData.cronValue) return '-'
    try {
      const list = computeNextFires(formData.cronValue, 1)
      return list[0]?.local || '-'
    } catch {
      return '-'
    }
  })

  type SummaryItem = { label: string; value: string }
  const summaryItems = computed<SummaryItem[]>(() => [
    { label: '命名空间', value: formData.namespace || '-' },
    { label: '应用', value: formData.appName || '-' },
    { label: '运行模式', value: getRunModeLabel(formData.runMode) },
    { label: '处理器', value: formData.handleName || '-' },
    { label: '状态', value: formData.enable ? '启用' : '停用' },
    {
      label: getScheduleTypeLabel(formData.scheduleType),
      value: summarizeSchedule(
        formData.scheduleType,
        formData.cronValue || null,
        formData.intervalSecond ?? null,
        formData.delaySecond ?? null
      )
    }
  ])

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.jobData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetJobDetail(props.jobData!.id!)
      Object.assign(formData, {
        appName: detail.appName,
        namespace: detail.namespace,
        key: detail.key || '',
        description: detail.description || '',
        scheduleType: detail.scheduleType,
        cronValue: detail.cronValue || '',
        delaySecond: detail.delaySecond || undefined,
        intervalSecond: detail.intervalSecond || undefined,
        runMode: detail.runMode,
        handleName: detail.handleName || '',
        triggerParamText: detail.triggerParam || '',
        routerStrategy: detail.routerStrategy,
        pastDueStrategy: detail.pastDueStrategy,
        blockingStrategy: detail.blockingStrategy,
        timeoutSecond: detail.timeoutSecond,
        tryTimes: detail.tryTimes,
        retryInterval: detail.retryInterval,
        enable: detail.enable
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

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await fetchCreateJob(buildCreateJobPayload(formData))
        ElMessage.success('新增成功')
        dialogVisible.value = false
        emit('submit', dialogType.value)
        return
      }

      if (props.jobData?.id) {
        await fetchUpdateJob(props.jobData.id, buildUpdateJobPayload(formData))
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

  .job-mono-input :deep(.el-input__inner),
  .json-textarea :deep(.el-textarea__inner) {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  .json-textarea :deep(.el-textarea__inner) {
    font-size: 12.5px;
    line-height: 1.55;
  }
</style>
