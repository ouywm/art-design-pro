<template>
  <div class="mt-4 rounded-custom-sm bg-[var(--default-bg-color)] px-4 py-3">
    <div class="text-xs font-medium uppercase tracking-[0.16em] text-g-500"> 自动附带上下文 </div>
    <div class="mt-2 space-y-1 text-xs leading-6 text-g-600">
      <div class="truncate" :title="context.pageTitle">页面：{{ context.pageTitle }}</div>
      <div class="truncate" :title="context.path">路径：{{ context.path }}</div>
      <div>环境：{{ context.browser }} / {{ context.os }} / {{ context.device }}</div>
      <div>视口：{{ context.viewport }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FeedbackContext } from './types'

  defineProps<{
    context: FeedbackContext
  }>()
</script>
