<template>
  <Teleport to="body">
    <Transition name="feedback-panel-fade">
      <FeedbackPanel
        v-if="panelVisible"
        :context="feedbackContext"
        @close="closePanel"
        @submitted="handleSubmitted"
      />
    </Transition>

    <FeedbackFloatButton v-if="!panelVisible" @click="openPanel" />
  </Teleport>
</template>

<script setup lang="ts">
  import { useEventListener } from '@vueuse/core'
  import { useRoute } from 'vue-router'
  import FeedbackFloatButton from './FeedbackFloatButton.vue'
  import FeedbackPanel from './FeedbackPanel.vue'
  import { createFeedbackContext } from './feedback-context'

  defineOptions({ name: 'FeedbackWidget' })

  const route = useRoute()
  const panelVisible = ref(false)

  const fallbackTitle = () => {
    if (typeof document === 'undefined') return undefined
    return document.title
  }

  const feedbackContext = computed(() =>
    createFeedbackContext({
      routeTitle: route.meta.title || fallbackTitle(),
      routePath: route.fullPath || route.path
    })
  )

  const openPanel = () => {
    panelVisible.value = true
  }

  const closePanel = () => {
    panelVisible.value = false
  }

  const handleSubmitted = () => {
    closePanel()
  }

  useEventListener(window, 'keydown', (event) => {
    if (event.key === 'Escape') closePanel()
  })
</script>

<style lang="scss" scoped>
  .feedback-panel-fade-enter-active,
  .feedback-panel-fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .feedback-panel-fade-enter-from,
  .feedback-panel-fade-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
</style>
