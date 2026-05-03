<template>
  <ElDialog
    v-model="dialogVisible"
    title="配置 Cron 表达式"
    :width="dialogWidth"
    align-center
    destroy-on-close
  >
    <div
      class="grid h-auto min-h-0 grid-cols-1 gap-4 xl:h-[min(72vh,780px)] xl:grid-cols-[minmax(0,1fr)_320px]"
    >
      <!-- 左栏 -->
      <ElScrollbar class="min-h-0 xl:h-full">
        <div class="flex min-h-0 flex-col gap-3.5 pb-1">
          <!-- Section 1: 调度编排器 -->
          <section
            class="flex flex-col gap-3 rounded-[calc(var(--custom-radius)+6px)] border border-[color-mix(in_srgb,var(--default-border)_72%,#c7d2fe)] bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_32%),linear-gradient(135deg,color-mix(in_srgb,var(--default-box-color)_92%,#eef4ff)_0%,color-mix(in_srgb,var(--default-box-color)_95%,#edf2f7)_52%,color-mix(in_srgb,var(--default-box-color)_90%,#d9ecff)_100%)] p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div class="mb-1 text-[15px] font-semibold text-g-900">调度编排器</div>
              <div class="text-xs leading-5 text-g-600">
                默认使用可视化模式,高级模式用于兼容复杂 Cron。
              </div>
            </div>
            <ElSegmented v-model="visualMode" :options="MODE_OPTIONS" class="w-full md:w-auto" />
          </section>

          <!-- Section 2: 快捷预设 -->
          <section
            class="rounded-[calc(var(--custom-radius)+6px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <span class="text-sm font-semibold text-g-900">快捷预设</span>
              <small class="text-xs text-g-500">常用商业化任务频率,适合快速落地</small>
            </div>
            <div class="grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3">
              <button
                v-for="preset in QUICK_PRESETS"
                :key="preset.expr"
                type="button"
                :class="[
                  'flex min-h-[82px] cursor-pointer flex-col items-start justify-center gap-1 rounded-custom-sm border px-3 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(15,23,42,0.06)]',
                  cronInput === preset.expr
                    ? 'border-[color-mix(in_srgb,var(--theme-color)_58%,white)] bg-[color-mix(in_srgb,var(--theme-color)_10%,var(--default-box-color))] shadow-[0_16px_28px_rgba(15,23,42,0.06)]'
                    : 'border-[var(--default-border)] bg-[color-mix(in_srgb,var(--default-box-color)_92%,white)] hover:border-[color-mix(in_srgb,var(--theme-color)_58%,white)]'
                ]"
                @click="applyPreset(preset.expr)"
              >
                <strong class="text-xs leading-[1.35] text-g-900">{{ preset.label }}</strong>
                <span class="text-[11px] leading-[1.45] text-g-600">{{ preset.hint }}</span>
              </button>
            </div>
          </section>

          <!-- Section 3: 可视化配置 / 高级模式 -->
          <section
            class="rounded-[calc(var(--custom-radius)+6px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
          >
            <div class="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <span class="text-sm font-semibold text-g-900">
                {{ visualMode === 'visual' ? '可视化配置' : '高级模式' }}
              </span>
              <small class="text-xs text-g-500">
                {{
                  visualMode === 'visual'
                    ? '减少误填,适合大部分运营和运维场景'
                    : '直接输入 6 段 cron,支持完整语法'
                }}
              </small>
            </div>

            <!-- 可视化模式 -->
            <template v-if="visualMode === 'visual'">
              <ElRadioGroup v-model="freqType" class="mb-3">
                <ElRadioButton v-for="t in FREQ_TYPES" :key="t.value" :value="t.value">
                  {{ t.label }}
                </ElRadioButton>
              </ElRadioGroup>

              <div class="flex flex-col gap-3">
                <!-- 频率行 -->
                <div
                  class="flex flex-wrap items-center gap-2.5 rounded-custom-sm border border-dashed border-[color-mix(in_srgb,var(--theme-color)_22%,var(--default-border))] bg-[color-mix(in_srgb,var(--default-box-color)_96%,white)] px-4 py-3.5"
                >
                  <!-- 每 N 分钟 -->
                  <template v-if="freqType === 'intervalMinutes'">
                    <span class="text-[13px] text-g-700">每</span>
                    <ElInputNumber
                      v-model="visualFields.intervalN"
                      :min="1"
                      :max="59"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">分钟执行</span>
                  </template>

                  <!-- 每 N 小时 -->
                  <template v-else-if="freqType === 'intervalHours'">
                    <span class="text-[13px] text-g-700">每</span>
                    <ElInputNumber
                      v-model="visualFields.intervalN"
                      :min="1"
                      :max="23"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">小时</span>
                    <ElInputNumber
                      v-model="visualFields.minute"
                      :min="0"
                      :max="59"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">分执行</span>
                  </template>

                  <!-- 每日 -->
                  <template v-else-if="freqType === 'daily'">
                    <span class="text-[13px] text-g-700">每日</span>
                    <ElInputNumber
                      v-model="visualFields.hour"
                      :min="0"
                      :max="23"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">时</span>
                    <ElInputNumber
                      v-model="visualFields.minute"
                      :min="0"
                      :max="59"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">分执行</span>
                  </template>

                  <!-- 每周 -->
                  <template v-else-if="freqType === 'weekly'">
                    <ElSelect v-model="visualFields.weekday" style="width: 120px">
                      <ElOption
                        v-for="w in WEEKDAY_OPTIONS"
                        :key="w.value"
                        :label="w.label"
                        :value="w.value"
                      />
                    </ElSelect>
                    <ElInputNumber
                      v-model="visualFields.hour"
                      :min="0"
                      :max="23"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">时</span>
                    <ElInputNumber
                      v-model="visualFields.minute"
                      :min="0"
                      :max="59"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">分执行</span>
                  </template>

                  <!-- 每月 -->
                  <template v-else-if="freqType === 'monthly'">
                    <span class="text-[13px] text-g-700">每月</span>
                    <ElInputNumber
                      v-model="visualFields.dayOfMonth"
                      :min="1"
                      :max="31"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">日</span>
                    <ElInputNumber
                      v-model="visualFields.hour"
                      :min="0"
                      :max="23"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">时</span>
                    <ElInputNumber
                      v-model="visualFields.minute"
                      :min="0"
                      :max="59"
                      controls-position="right"
                    />
                    <span class="text-[13px] text-g-700">分执行</span>
                  </template>
                </div>

                <!-- 秒位行 -->
                <div
                  class="flex flex-wrap items-center gap-2.5 rounded-custom-sm border border-dashed border-[color-mix(in_srgb,var(--theme-color)_22%,var(--default-border))] bg-[color-mix(in_srgb,var(--default-box-color)_96%,white)] px-4 py-3.5"
                >
                  <span class="text-[13px] text-g-700">秒位</span>
                  <ElInputNumber
                    v-model="visualFields.second"
                    :min="0"
                    :max="59"
                    controls-position="right"
                  />
                  <small class="text-[13px] text-g-500">默认 0 秒,推荐保持标准 6 位格式</small>
                </div>
              </div>
            </template>

            <!-- 高级模式 -->
            <template v-else>
              <ElInput
                v-model="cronInput"
                placeholder="6 段:秒 分 时 日 月 周  例:0 0 3 * * *"
                class="cron-advanced-input"
                clearable
              />
              <div
                class="mt-2 grid grid-cols-2 gap-1 text-[11px] leading-[1.6] text-g-500 md:grid-cols-3"
              >
                <div>第 1 段:秒 (0-59)</div>
                <div>第 2 段:分 (0-59)</div>
                <div>第 3 段:时 (0-23)</div>
                <div>第 4 段:日 (1-31 或 *)</div>
                <div>第 5 段:月 (1-12 或 *)</div>
                <div>第 6 段:周 (0-7 或 *)</div>
              </div>
            </template>
          </section>
        </div>
      </ElScrollbar>

      <!-- 右栏 -->
      <div class="flex min-h-0 flex-col gap-4 overflow-hidden">
        <!-- 表达式摘要 -->
        <section
          class="rounded-[calc(var(--custom-radius)+6px)] border border-white/10 bg-[linear-gradient(145deg,#27324d_0%,#303a57_48%,#36405f_100%)] p-4"
        >
          <span class="mb-2 block text-xs text-white/70">表达式摘要</span>
          <strong class="mb-1.5 block break-all text-sm leading-7 text-white/95">
            {{ cronInput || '请输入或选择' }}
          </strong>
          <small class="text-xs text-white/65">Asia/Shanghai</small>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="(seg, idx) in segParts"
              :key="idx"
              class="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-white/82"
            >
              {{ SEG_LABELS[idx] }}: {{ seg }}
            </span>
          </div>
        </section>

        <!-- 调度校验 -->
        <section
          class="rounded-[calc(var(--custom-radius)+6px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="text-sm font-semibold text-g-900">调度校验</span>
            <ElTag :type="validation.valid ? 'success' : 'danger'" size="small">
              {{ validation.valid ? '有效' : '无效' }}
            </ElTag>
          </div>
          <div class="text-[13px] leading-7 text-g-900">
            {{ validation.valid ? validation.description || '-' : validation.reason }}
          </div>
        </section>

        <!-- 未来执行 -->
        <section
          class="flex min-h-0 flex-1 flex-col rounded-[calc(var(--custom-radius)+6px)] border border-[var(--default-border)] bg-[var(--default-box-color)] p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="text-sm font-semibold text-g-900">未来执行</span>
            <small class="text-xs text-g-500">Asia/Shanghai</small>
          </div>
          <ElScrollbar class="min-h-0 flex-1">
            <div v-if="fireItems.length" class="flex flex-col gap-2.5 pb-1">
              <div
                v-for="(item, idx) in fireItems"
                :key="idx"
                class="rounded-custom-sm border border-[color-mix(in_srgb,var(--default-border)_90%,transparent)] bg-[color-mix(in_srgb,var(--default-box-color)_94%,white)] px-3 py-2.5"
              >
                <strong class="mb-1 block text-[13px] text-g-900">{{ item.local }}</strong>
                <span class="block text-xs text-g-500">{{ item.utc }}</span>
              </div>
            </div>
            <div v-else class="text-xs text-g-500">表达式无效,无法计算未来执行时间</div>
          </ElScrollbar>
        </section>
      </div>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :disabled="!validation.valid" @click="handleConfirm">
        确认使用
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import {
    composeCron,
    computeNextFires,
    validateCron,
    type CronNextFireItem,
    type CronVisualFields,
    type CronVisualMode
  } from '../../utils/cron-preview'

  interface Props {
    visible: boolean
    cron: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'confirm', cron: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const { width } = useWindowSize()
  const dialogWidth = computed(() =>
    width.value < 1024 ? '94vw' : 'min(1000px, calc(100vw - 32px))'
  )

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  // ============ 模式 / 频率类型 ============

  const MODE_OPTIONS = [
    { label: '可视化', value: 'visual' },
    { label: '高级模式', value: 'advanced' }
  ]

  type ModeKey = 'visual' | 'advanced'
  const visualMode = ref<ModeKey>('visual')

  const FREQ_TYPES: Array<{ label: string; value: CronVisualMode }> = [
    { label: '按分钟', value: 'intervalMinutes' },
    { label: '按小时', value: 'intervalHours' },
    { label: '每日', value: 'daily' },
    { label: '每周', value: 'weekly' },
    { label: '每月', value: 'monthly' }
  ]

  const freqType = ref<CronVisualMode>('weekly')

  const WEEKDAY_OPTIONS = [
    { label: '周一', value: 1 },
    { label: '周二', value: 2 },
    { label: '周三', value: 3 },
    { label: '周四', value: 4 },
    { label: '周五', value: 5 },
    { label: '周六', value: 6 },
    { label: '周日', value: 0 }
  ]

  const visualFields = reactive<CronVisualFields>({
    second: 0,
    minute: 0,
    hour: 2,
    dayOfMonth: 1,
    weekday: 1,
    intervalN: 5
  })

  // ============ 快捷预设 ============

  const QUICK_PRESETS = [
    { label: '每 5 分钟', expr: '0 */5 * * * *', hint: '轻量巡检与同步' },
    { label: '每 15 分钟', expr: '0 */15 * * * *', hint: '常规增量任务' },
    { label: '每小时整点', expr: '0 0 * * * *', hint: '小时级统计聚合' },
    { label: '每日凌晨 3 点', expr: '0 0 3 * * *', hint: '离峰批处理' },
    { label: '工作日 9 点', expr: '0 0 9 * * 1-5', hint: '业务日常任务' },
    { label: '每周一 2 点', expr: '0 0 2 * * 1', hint: '周度维护窗口' }
  ]

  // ============ cron 输入 ============

  const cronInput = ref('')

  // 可视化字段变化 → 重新合成 cron(仅当处于 visual 模式)
  let suspendCompose = false
  watch(
    [freqType, visualFields],
    () => {
      if (visualMode.value !== 'visual' || suspendCompose) return
      cronInput.value = composeCron(freqType.value, { ...visualFields })
    },
    { deep: true }
  )

  const applyPreset = (expr: string) => {
    cronInput.value = expr
    // 切到高级模式以避免可视化字段把表达式覆盖回去(预设里 1-5 这种范围 visual 表达不出来)
    suspendCompose = true
    visualMode.value = 'advanced'
    nextTick(() => {
      suspendCompose = false
    })
  }

  // ============ 校验 + 未来执行 ============

  const validation = computed(() => validateCron(cronInput.value))

  const fireItems = ref<CronNextFireItem[]>([])

  watch(
    cronInput,
    (v) => {
      if (!v.trim()) {
        fireItems.value = []
        return
      }
      try {
        fireItems.value = computeNextFires(v, 5)
      } catch {
        fireItems.value = []
      }
    },
    { immediate: true }
  )

  // ============ 摘要 chip ============

  const SEG_LABELS = ['秒', '分', '时', '日', '月', '周']
  const segParts = computed(() => {
    const parts = (cronInput.value || '* * * * * *').trim().split(/\s+/)
    while (parts.length < 6) parts.push('*')
    return parts.slice(0, 6)
  })

  // ============ 初始化 ============

  watch(
    () => props.visible,
    (v) => {
      if (!v) return
      const initial = (props.cron || '0 0 2 * * 1').trim()
      suspendCompose = true
      cronInput.value = initial
      // 默认可视化模式 + weekly,如果传入的 cron 不是标准每周/每日格式,自动切高级
      visualMode.value = isVisualizable(initial) ? 'visual' : 'advanced'
      nextTick(() => {
        suspendCompose = false
      })
    },
    { immediate: true }
  )

  // 简单判断:6 段都是单值/通配符 → 可视化能表达
  const isVisualizable = (expr: string): boolean => {
    const parts = expr.split(/\s+/)
    if (parts.length !== 6) return false
    return parts.every((p) => p === '*' || /^\d+$/.test(p) || /^\*\/\d+$/.test(p))
  }

  const handleConfirm = () => {
    if (!validation.value.valid) return
    emit('confirm', cronInput.value.trim())
    dialogVisible.value = false
  }
</script>

<style scoped lang="scss">
  .cron-advanced-input :deep(.el-input__inner) {
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
</style>
