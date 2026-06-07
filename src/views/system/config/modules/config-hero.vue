<template>
  <section class="config-hero art-surface-sm">
    <div class="config-hero__content">
      <div class="config-hero__main">
        <h1 class="config-hero__title">参数设置</h1>
        <p class="config-hero__desc">
          统一管理系统运行参数、登录体验、安全策略与审计策略。支持分组维护、内置保护、缓存刷新与按键名读取，便于后续业务模块复用。
        </p>
      </div>

      <div class="config-hero__badges">
        <span class="config-hero__badge">缓存项：{{ stats.total }}</span>
        <span class="config-hero__badge">分组数：{{ stats.groupCount }}</span>
        <span class="config-hero__badge">最近刷新：{{ stats.latestUpdate || '-' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ConfigStatsModel } from '../types'

  defineProps<{
    stats: ConfigStatsModel
  }>()
</script>

<style scoped lang="scss">
  .config-hero {
    --art-surface-bg: var(--default-box-color);
    --art-surface-border: var(--default-border);
    --art-radius-surface-sm: var(--custom-radius);
    --art-surface-shadow-sm: 0 1px 2px rgb(16 24 40 / 4%);
    --tw-inset-shadow: 0 0 #0000;
    --tw-inset-ring-shadow: 0 0 #0000;
    --tw-ring-offset-shadow: 0 0 #0000;
    --tw-ring-shadow: 0 0 #0000;
    --tw-shadow: var(--art-surface-shadow-sm);

    min-height: 130px;
    padding: 20px 24px;
    overflow: hidden;
  }

  .config-hero__content {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;
  }

  .config-hero__main {
    min-width: 0;
    max-width: 760px;
  }

  .config-hero__title {
    margin: 0;
    font-size: 22px;
    font-weight: 650;
    line-height: 1.5;
    color: var(--art-gray-900);
  }

  .config-hero__desc {
    max-width: 720px;
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 2;
    color: var(--art-gray-600);
  }

  .config-hero__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-end;
    min-width: 0;
  }

  .config-hero__badge {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 12px;
    font-size: 12px;
    color: var(--art-gray-700);
    white-space: nowrap;
    background: var(--default-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 999px;
  }

  @media screen and (width <= 1024px) {
    .config-hero__content {
      flex-direction: column;
    }

    .config-hero__badges {
      justify-content: flex-start;
    }
  }
</style>
