<template>
  <div
    class="feedback-panel pointer-events-auto fixed flex h-[min(820px,calc(100vh-64px))] max-h-[calc(100vh-64px)] w-[min(92vw,440px)] flex-col overflow-hidden rounded-[calc(var(--custom-radius))] border border-[var(--default-border)] bg-box shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="art-feedback-widget-title"
  >
    <div
      class="mx-4 mt-4 rounded-[calc(var(--custom-radius))] border border-[var(--default-border)] px-4 py-3"
      style="
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--color-primary) 7%, transparent),
          color-mix(in srgb, var(--color-secondary) 9%, transparent)
        );
      "
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <div id="art-feedback-widget-title" class="mt-2 text-base font-semibold text-g-900">
            问题反馈
          </div>
          <p class="mt-1 text-sm leading-6 text-g-600">
            欢迎提交功能建议或 Bug 反馈，帮助我们持续改进产品
          </p>
        </div>

        <button
          class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-g-600 transition-colors hover:bg-box hover:text-g-900"
          type="button"
          aria-label="关闭反馈面板"
          title="关闭"
          @click="emit('close')"
        >
          <ArtSvgIcon icon="ri:close-line" class="text-lg" />
        </button>
      </div>
    </div>

    <div class="h-0 min-h-0 flex-1 overflow-hidden">
      <ElScrollbar class="h-full">
        <div class="px-4 py-4">
          <FeedbackForm ref="formRef" :context="context" @submit="handleFormSubmit" />
        </div>
      </ElScrollbar>
    </div>

    <div
      class="flex items-center justify-end gap-3 border-t border-[var(--default-border)] bg-box px-4 py-4"
    >
      <ElButton @click="emit('close')">稍后再说</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交反馈</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import FeedbackForm from './FeedbackForm.vue'
  import type { FeedbackContext, FeedbackPayload } from './types'

  defineProps<{
    context: FeedbackContext
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submitted', payload: FeedbackPayload): void
  }>()

  const formRef = ref<InstanceType<typeof FeedbackForm>>()
  const submitting = ref(false)
  const submittedPayload = ref<FeedbackPayload>()

  const handleFormSubmit = (payload: FeedbackPayload) => {
    submittedPayload.value = payload
  }

  const handleSubmit = async () => {
    if (!formRef.value || submitting.value) return

    submitting.value = true
    submittedPayload.value = undefined

    try {
      const valid = await formRef.value.submit()
      if (!valid || !submittedPayload.value) return

      ElMessage.success('反馈已记录')
      emit('submitted', submittedPayload.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .feedback-panel {
    right: 1.25rem;
    bottom: 5.5rem;
    z-index: 2600;
  }

  @media (width <= 640px) {
    .feedback-panel {
      right: 1rem;
      bottom: 5rem;
      width: calc(100vw - 2rem);
      max-height: calc(100vh - 6rem);
    }
  }
</style>
