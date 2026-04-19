<!-- 图标选择器的共享面板（popover 和 dialog 模式复用） -->
<template>
  <div class="art-icon-picker-panel">
    <div class="art-icon-picker-panel__header">
      <ElInput
        :model-value="keyword"
        :placeholder="searchPlaceholder"
        clearable
        size="default"
        @update:model-value="$emit('update:keyword', $event)"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" class="text-g-500" />
        </template>
      </ElInput>
    </div>

    <div v-if="loading" class="art-icon-picker-panel__state">
      <ArtSvgIcon icon="ri:loader-4-line" class="text-g-500 text-xl animate-spin" />
      <span class="text-g-500 ml-2">{{ loadingText }}</span>
    </div>

    <template v-else>
      <ElTabs
        v-if="showCategory && categoryOptions.length > 1"
        :model-value="currentCategory"
        class="art-icon-picker-panel__tabs"
        @update:model-value="$emit('update:currentCategory', String($event))"
      >
        <ElTabPane
          v-for="cat in categoryOptions"
          :key="cat.value"
          :label="cat.label"
          :name="cat.value"
        />
      </ElTabs>

      <div class="art-icon-picker-panel__body">
        <div
          v-if="pagedIcons.length"
          class="art-icon-picker-panel__grid"
          :style="{
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinSize}px, 1fr))`,
            maxHeight: gridMaxHeight
          }"
        >
          <div
            v-for="name in pagedIcons"
            :key="name"
            class="art-icon-picker-panel__item"
            :class="{ 'is-active': name === modelValue }"
            :title="name"
            @click="$emit('pick', name)"
          >
            <ArtSvgIcon :icon="name" class="text-2xl" />
          </div>
        </div>
        <ElEmpty v-else :description="emptyText" :image-size="80" />
      </div>

      <div v-if="total > pageSize" class="art-icon-picker-panel__footer">
        <ElPagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper, ->, total"
          background
          small
          @update:current-page="$emit('update:currentPage', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'IconPickerPanel' })

  interface CategoryOption {
    label: string
    value: string
  }

  interface Props {
    /** 加载中 */
    loading?: boolean
    /** 加载文案 */
    loadingText?: string
    /** 关键词 */
    keyword?: string
    /** 搜索占位 */
    searchPlaceholder?: string
    /** 是否显示分类 */
    showCategory?: boolean
    /** 分类选项 */
    categoryOptions?: CategoryOption[]
    /** 当前分类 */
    currentCategory?: string
    /** 分页后的图标列表 */
    pagedIcons?: string[]
    /** 当前选中值 */
    modelValue?: string
    /** 空文案 */
    emptyText?: string
    /** 过滤后总数 */
    total?: number
    /** 每页数量 */
    pageSize?: number
    /** 当前页 */
    currentPage?: number
    /** 网格项最小宽度 */
    gridMinSize?: number
    /** 网格最大高度 */
    gridMaxHeight?: string
  }

  withDefaults(defineProps<Props>(), {
    loading: false,
    loadingText: '图标加载中...',
    keyword: '',
    searchPlaceholder: '搜索图标名称',
    showCategory: true,
    categoryOptions: () => [],
    currentCategory: '',
    pagedIcons: () => [],
    modelValue: '',
    emptyText: '暂无匹配图标',
    total: 0,
    pageSize: 96,
    currentPage: 1,
    gridMinSize: 40,
    gridMaxHeight: '320px'
  })

  defineEmits<{
    (e: 'update:keyword', value: string): void
    (e: 'update:currentCategory', value: string): void
    (e: 'update:currentPage', value: number): void
    (e: 'pick', value: string): void
  }>()
</script>

<style scoped lang="scss">
  .art-icon-picker-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    &__state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      font-size: 12px;
    }

    &__tabs {
      :deep(.el-tabs__header) {
        margin: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
      }

      :deep(.el-tabs__item) {
        height: 32px;
        padding: 0 10px;
        font-size: 12px;
        line-height: 32px;
      }
    }

    &__body {
      min-height: 200px;
    }

    &__grid {
      display: grid;
      gap: 6px;
      padding-right: 4px;
      overflow-y: auto;
    }

    &__item {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1;
      color: var(--el-text-color-regular);
      cursor: pointer;
      background-color: transparent;
      border: 1px solid var(--art-border-color);
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        transform: translateY(-1px);
      }

      &.is-active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }
    }

    &__footer {
      display: flex;
      justify-content: center;
      padding-top: 4px;
    }
  }
</style>
