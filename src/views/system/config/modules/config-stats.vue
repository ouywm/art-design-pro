<template>
  <section class="config-stats">
    <article v-for="item in statItems" :key="item.label" class="config-stat-card art-surface-sm">
      <div class="config-stat-card__body">
        <div class="config-stat-card__label">{{ item.label }}</div>
        <div class="config-stat-card__value">{{ item.value }}</div>
        <div class="config-stat-card__desc">{{ item.desc }}</div>
      </div>
      <div class="config-stat-card__icon" :class="item.iconClass">
        <ArtSvgIcon :icon="item.icon" />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
  import type { ConfigStatsModel } from '../types'

  const props = defineProps<{
    stats: ConfigStatsModel
  }>()

  const statItems = computed(() => [
    {
      label: '参数总量',
      value: props.stats.total,
      desc: '包括内置参数与业务扩展参数',
      icon: 'ri:database-2-line',
      iconClass: 'is-primary'
    },
    {
      label: '启用参数',
      value: props.stats.enabled,
      desc: '当前会参与读取和缓存的有效参数',
      icon: 'ri:checkbox-circle-line',
      iconClass: 'is-success'
    },
    {
      label: '内置参数',
      value: props.stats.builtIn,
      desc: '平台基础参数，建议谨慎修改',
      icon: 'ri:shield-keyhole-line',
      iconClass: 'is-warning'
    },
    {
      label: '参数分组',
      value: props.stats.groupCount,
      desc: '可按业务域划分不同配置命名空间',
      icon: 'ri:folder-settings-line',
      iconClass: 'is-muted'
    }
  ])
</script>

<style scoped lang="scss">
  .config-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .config-stat-card {
    --art-surface-bg: var(--default-box-color);
    --art-surface-border: var(--default-border);
    --art-radius-surface-sm: var(--custom-radius);
    --art-surface-shadow-sm: 0 1px 2px rgb(16 24 40 / 4%);
    --tw-inset-shadow: 0 0 #0000;
    --tw-inset-ring-shadow: 0 0 #0000;
    --tw-ring-offset-shadow: 0 0 #0000;
    --tw-ring-shadow: 0 0 #0000;
    --tw-shadow: var(--art-surface-shadow-sm);

    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 0;
    padding: 18px 20px;
  }

  .config-stat-card__body {
    min-width: 0;
  }

  .config-stat-card__label {
    font-size: 14px;
    line-height: 1.5;
    color: var(--art-gray-600);
  }

  .config-stat-card__value {
    margin-top: 12px;
    font-size: 30px;
    font-weight: 650;
    line-height: 1.2;
    color: var(--art-gray-900);
  }

  .config-stat-card__desc {
    margin-top: 8px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.6;
    color: var(--art-gray-500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .config-stat-card__icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 20px;
    color: var(--art-gray-700);
    background: var(--default-bg-color);
    border-radius: var(--custom-radius);
  }

  .config-stat-card__icon.is-primary {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .config-stat-card__icon.is-success {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  .config-stat-card__icon.is-warning {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }

  @media screen and (width <= 1280px) {
    .config-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (width <= 640px) {
    .config-stats {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
