<template>
  <section class="art-page-hero art-surface-sm generator-hero">
    <div class="hero-copy">
      <h1>AI代码生成器</h1>
      <div class="hero-desc">
        <p class="hero-kicker">从需求到模块底座，只差一次确认</p>
        <p>
          用于生成符合 Art Design Pro X
          规范的通用业务模块，包括列表、搜索、表单、接口、权限和基础数据结构。生成结果主要覆盖标准后台开发场景，复杂业务流程、特殊交互和多模块协作建议在生成后继续扩展。
        </p>
      </div>
    </div>
    <div class="hero-stats">
      <div v-for="item in stats" :key="item.label" class="metric-card art-surface-muted">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { MetricItem } from '../types'

  defineProps<{
    stats: MetricItem[]
  }>()
</script>

<style scoped lang="scss">
  .generator-hero {
    position: relative;
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    min-height: 130px;
    padding: 20px 24px;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--default-box-color) 94%, var(--art-primary) 6%),
      color-mix(in srgb, var(--default-box-color) 98%, var(--art-primary) 2%)
    );
  }

  .hero-copy {
    max-width: 860px;

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--art-gray-900);
      letter-spacing: 0;
    }
  }

  .hero-kicker {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-800);
  }

  .hero-desc {
    max-width: 880px;
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.75;
    color: var(--art-gray-600);

    p {
      margin: 0;
    }
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    min-width: 360px;
  }

  @media (width <= 1200px) {
    .generator-hero {
      flex-direction: column;
      align-items: stretch;
    }

    .hero-stats {
      min-width: 0;
    }
  }

  @media (width <= 720px) {
    .generator-hero {
      padding: 18px;
    }

    .hero-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
