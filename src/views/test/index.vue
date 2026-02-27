<template>
  <div class="test-page">
    <h1>测试页面</h1>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Test' })
</script>

<style scoped>
  .test-page {
    padding: 20px;
  }

  h1 {
    font-size: 24px;
    color: #333;
  }
</style>
