<template>
  <button
    class="feedback-float-button pointer-events-auto fixed flex size-13 cursor-pointer items-center justify-center rounded-full border border-[var(--default-border)] bg-box text-g-800 shadow-[0_16px_32px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
    type="button"
    aria-label="打开反馈面板"
    title="问题反馈"
    @click="emit('click')"
  >
    <span
      class="flex size-10 items-center justify-center rounded-full text-white"
      style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary))"
    >
      <ArtSvgIcon icon="ri:customer-service-2-line" class="text-[22px]" />
    </span>
  </button>
</template>

<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'click'): void
  }>()
</script>

<style lang="scss" scoped>
  .feedback-float-button {
    right: 1.25rem;
    bottom: 1.5rem;
    z-index: 2600;
  }

  @media (width <= 640px) {
    .feedback-float-button {
      right: 1rem;
      bottom: 1rem;
    }
  }
</style>
