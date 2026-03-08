<!-- 上传控制按钮组件 -->
<template>
  <div class="flex items-center gap-2 flex-wrap mb-3">
    <ElButton type="primary" :disabled="!canStart" @click="emit('start')" v-ripple>
      开始上传
    </ElButton>
    <ElButton :disabled="!canPause" @click="emit('pause')" v-ripple> 暂停 </ElButton>
    <ElButton type="success" :disabled="!canResume" @click="emit('resume')" v-ripple>
      恢复
    </ElButton>
    <ElButton type="danger" :disabled="!canCancel" @click="emit('cancel')" v-ripple>
      取消
    </ElButton>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'UploadControls' })

  interface UploadControlsProps {
    canStart?: boolean
    canPause?: boolean
    canResume?: boolean
    canCancel?: boolean
  }

  withDefaults(defineProps<UploadControlsProps>(), {
    canStart: false,
    canPause: false,
    canResume: false,
    canCancel: false
  })

  interface UploadControlsEmits {
    start: []
    pause: []
    resume: []
    cancel: []
  }

  const emit = defineEmits<UploadControlsEmits>()
</script>
