<!-- 布局容器 -->
<template>
  <div class="app-layout">
    <aside id="app-sidebar">
      <ArtSidebarMenu />
    </aside>

    <main id="app-main">
      <div id="app-header">
        <ArtHeaderBar />
      </div>
      <div id="app-content">
        <ArtPageContent />
      </div>
    </main>

    <div id="app-global">
      <ArtGlobalComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSocketSession } from '@/hooks'

  defineOptions({ name: 'AppLayout' })

  // 建立全局 Socket.IO 连接，内置 session.kickout 等业务事件处理
  useSocketSession()
</script>

<style lang="scss" scoped>
  @use './style';
</style>
