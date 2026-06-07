<template>
  <section
    class="change-log-page mx-auto w-full max-w-[1360px] pb-6 pt-2 max-md:pt-3 art-page-view"
  >
    <section
      class="art-page-hero art-surface-sm relative min-h-[130px] overflow-hidden px-5 py-4 md:px-6 md:py-5"
    >
      <div class="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div class="min-w-0 max-w-[720px]">
          <h1 class="text-[22px] font-semibold tracking-tight text-g-900">更新日志</h1>
          <p class="mt-2 max-w-2xl text-sm leading-7 text-g-600">
            持续记录商业版能力演进、体验优化和需要关注的升级事项，帮助团队快速判断版本价值与上线影响。
          </p>
        </div>

        <div class="grid min-w-[360px] grid-cols-3 gap-3 max-md:w-full max-md:min-w-0">
          <div
            class="rounded-custom-xs border border-[var(--default-border)] bg-[var(--default-bg-color)] px-4 py-3"
          >
            <div class="text-xs text-g-500">当前版本</div>
            <div class="mt-2 truncate text-lg font-semibold text-g-900">{{
              stats.currentVersion
            }}</div>
          </div>
          <div
            class="rounded-custom-xs border border-[var(--default-border)] bg-[var(--default-bg-color)] px-4 py-3"
          >
            <div class="text-xs text-g-500">版本记录</div>
            <div class="mt-2 truncate text-lg font-semibold text-g-900">
              {{ stats.releaseCount }} 个
            </div>
          </div>
          <div
            class="rounded-custom-xs border border-[var(--default-border)] bg-[var(--default-bg-color)] px-4 py-3"
          >
            <div class="text-xs text-g-500">更新条目</div>
            <div class="mt-2 truncate text-lg font-semibold text-g-900">
              {{ stats.detailCount }} 条
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class="mt-4 grid grid-cols-[260px_minmax(0,1fr)] gap-4 max-lg:grid-cols-1">
      <aside class="change-log-index art-surface-sm h-max px-5 py-5 max-lg:hidden">
        <div class="text-sm font-semibold text-g-900">版本索引</div>
        <div class="mt-4 space-y-2">
          <button
            v-for="item in releaseLogList"
            :key="item.version"
            type="button"
            class="release-link flex w-full cursor-pointer items-center justify-between gap-3 rounded-custom-xs px-3 py-2 text-left text-sm text-g-700 transition-colors duration-200 hover:bg-hover-color hover:text-g-900"
            @click="scrollToRelease(item)"
          >
            <span class="truncate font-medium">{{ item.version }}</span>
            <span class="shrink-0 text-xs text-g-500">{{ item.date }}</span>
          </button>
        </div>
      </aside>

      <div class="release-timeline">
        <article
          v-for="item in releaseLogList"
          :id="toReleaseId(item)"
          :key="item.version"
          class="release-card art-surface-sm relative overflow-hidden px-6 py-5 max-md:px-4"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex h-7 items-center rounded-full bg-theme/10 px-3 text-xs font-semibold text-theme"
                >
                  {{ item.version }}
                </span>
                <span
                  v-if="item.latest"
                  class="inline-flex h-7 items-center rounded-full bg-success/10 px-3 text-xs font-semibold text-success"
                >
                  最新版本
                </span>
                <ElTag v-if="item.requireReLogin" type="warning" effect="light">需要重新登录</ElTag>
              </div>
              <h2 class="mt-4 text-xl font-semibold leading-8 text-g-900 max-md:text-lg">
                {{ item.title }}
              </h2>
            </div>
            <time
              class="shrink-0 rounded-custom-xs bg-g-100 px-3 py-2 text-sm font-medium text-g-600"
            >
              {{ item.date }}
            </time>
          </div>

          <div class="mt-5">
            <ul class="grid grid-cols-1 gap-3 xl:grid-cols-2">
              <li
                v-for="detail in item.details"
                :key="detail"
                class="release-detail rounded-custom-xs border border-[var(--default-border)] bg-[var(--default-bg-color)] px-4 py-3 text-sm leading-6 text-g-700"
              >
                <ElTag
                  class="release-detail-tag"
                  :type="normalizeReleaseDetail(detail).type"
                  effect="light"
                >
                  {{ normalizeReleaseDetail(detail).tag }}
                </ElTag>
                <span>{{ normalizeReleaseDetail(detail).text }}</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
  import {
    buildReleaseStats,
    normalizeReleaseDetail,
    releaseLogList,
    toReleaseId,
    type ReleaseLogItem
  } from './release-log'

  defineOptions({ name: 'ChangeLogNew' })

  const stats = computed(() => buildReleaseStats(releaseLogList))

  const scrollToRelease = (item: ReleaseLogItem) => {
    const el = document.getElementById(toReleaseId(item))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<style scoped lang="scss">
  .change-log-page {
    --art-surface-bg: var(--default-box-color);
    --art-surface-border: var(--default-border);
    --art-radius-surface-sm: var(--custom-radius);
    --art-surface-shadow-sm: 0 1px 2px rgb(16 24 40 / 4%);
  }

  .art-page-hero::before {
    position: absolute;
    inset: -40% -12% auto auto;
    width: 360px;
    height: 220px;
    content: '';
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary) 16%, transparent),
      color-mix(in srgb, var(--color-secondary) 12%, transparent)
    );
    filter: blur(8px);
    border-radius: 999px;
    opacity: 0.72;
  }

  .change-log-index {
    position: sticky;
    top: 92px;
  }

  .release-timeline {
    display: grid;
    gap: 16px;
  }

  .release-card::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    content: '';
    background: linear-gradient(
      180deg,
      var(--color-primary),
      color-mix(in srgb, var(--color-secondary) 68%, transparent)
    );
  }

  .release-detail {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .release-detail-tag {
    flex-shrink: 0;
    margin-top: 1px;
  }

  @media (width <= 640px) {
    .art-page-hero::before {
      width: 260px;
      height: 160px;
    }

    .release-detail {
      flex-direction: column;
      gap: 8px;
    }
  }
</style>
