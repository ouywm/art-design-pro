<!-- 图标选择器：基于 Iconify，默认检索 Remix Icon (ri) 图标集 -->
<template>
  <div class="art-icon-picker">
    <!-- 弹窗模式：独立触发器 + ElDialog -->
    <template v-if="mode === 'dialog'">
      <div
        class="art-icon-picker__trigger"
        :class="{ 'is-disabled': disabled, 'is-active': visible }"
        :style="triggerStyle"
        @click="openDialog"
      >
        <div class="art-icon-picker__preview">
          <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-xl" />
          <ArtSvgIcon v-else icon="ri:apps-2-line" class="text-xl text-g-500" />
        </div>

        <div class="art-icon-picker__label">
          <span v-if="modelValue" class="truncate">{{ modelValue }}</span>
          <span v-else class="text-g-500">{{ placeholder }}</span>
        </div>

        <div class="art-icon-picker__suffix">
          <span
            v-if="clearable && modelValue && !disabled"
            class="art-icon-picker__clear"
            @click.stop="handleClear"
            @mousedown.stop
          >
            <ArtSvgIcon icon="ri:close-circle-fill" />
          </span>
          <ArtSvgIcon v-else icon="ri:arrow-down-s-line" class="text-g-500" />
        </div>
      </div>

      <ElDialog
        v-model="visible"
        :title="dialogTitle"
        :width="dialogWidth"
        :append-to-body="teleported"
        destroy-on-close
        class="art-icon-picker__dialog"
        @open="handleBeforeEnter"
      >
        <div class="art-icon-picker__panel art-icon-picker__panel--dialog">
          <IconPickerPanel
            :loading="loading"
            :loading-text="loadingText"
            :keyword="keyword"
            :search-placeholder="searchPlaceholder"
            :show-category="showCategory"
            :category-options="categoryOptions"
            :current-category="currentCategory"
            :paged-icons="pagedIcons"
            :model-value="modelValue"
            :empty-text="emptyText"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            :grid-min-size="dialogGridMinSize"
            :grid-max-height="dialogGridMaxHeight"
            @update:keyword="keyword = $event"
            @update:current-category="currentCategory = $event"
            @update:current-page="currentPage = $event"
            @pick="handlePick"
          />
        </div>
      </ElDialog>
    </template>

    <!-- Popover 模式 -->
    <ElPopover
      v-else
      v-model:visible="visible"
      :width="panelWidth"
      :placement="placement"
      :trigger="trigger"
      :disabled="disabled"
      :teleported="teleported"
      :popper-class="['art-icon-picker__popover', popperClass].filter(Boolean).join(' ')"
      :persistent="false"
      @before-enter="handleBeforeEnter"
    >
      <template #reference>
        <div
          class="art-icon-picker__trigger"
          :class="{ 'is-disabled': disabled, 'is-active': visible }"
          :style="triggerStyle"
          @click.stop
        >
          <div class="art-icon-picker__preview">
            <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-xl" />
            <ArtSvgIcon v-else icon="ri:apps-2-line" class="text-xl text-g-500" />
          </div>

          <div class="art-icon-picker__label">
            <span v-if="modelValue" class="truncate">{{ modelValue }}</span>
            <span v-else class="text-g-500">{{ placeholder }}</span>
          </div>

          <div class="art-icon-picker__suffix">
            <span
              v-if="clearable && modelValue && !disabled"
              class="art-icon-picker__clear"
              @click.stop="handleClear"
              @mousedown.stop
            >
              <ArtSvgIcon icon="ri:close-circle-fill" />
            </span>
            <ArtSvgIcon
              v-else
              icon="ri:arrow-down-s-line"
              class="text-g-500 tad-200"
              :class="{ 'rotate-180': visible }"
            />
          </div>
        </div>
      </template>

      <div class="art-icon-picker__panel">
        <IconPickerPanel
          :loading="loading"
          :loading-text="loadingText"
          :keyword="keyword"
          :search-placeholder="searchPlaceholder"
          :show-category="showCategory"
          :category-options="categoryOptions"
          :current-category="currentCategory"
          :paged-icons="pagedIcons"
          :model-value="modelValue"
          :empty-text="emptyText"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @update:keyword="keyword = $event"
          @update:current-category="currentCategory = $event"
          @update:current-page="currentPage = $event"
          @pick="handlePick"
        />
      </div>
    </ElPopover>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import IconPickerPanel from './panel.vue'

  defineOptions({ name: 'ArtIconPicker' })

  interface Props {
    /** 选中图标（含前缀，例如 ri:home-line） */
    modelValue?: string
    /** 展开方式：popover 悬浮面板 / dialog 居中弹窗 */
    mode?: 'popover' | 'dialog'
    /** 图标集前缀，默认 ri (Remix Icon) */
    prefix?: string
    /** 预加载图标列表；传入后不再请求接口 */
    icons?: string[]
    /** 未选中时的占位文案 */
    placeholder?: string
    /** 搜索输入占位 */
    searchPlaceholder?: string
    /** 每页图标数量 */
    pageSize?: number
    /** popover 面板宽度 */
    panelWidth?: number
    /** 触发方式（仅 popover 模式） */
    trigger?: 'click' | 'hover' | 'focus' | 'contextmenu'
    /** popover 弹出位置 */
    placement?:
      | 'top'
      | 'top-start'
      | 'top-end'
      | 'bottom'
      | 'bottom-start'
      | 'bottom-end'
      | 'left'
      | 'right'
    /** 是否显示分类标签页（当图标集包含 categories 时生效） */
    showCategory?: boolean
    /** 是否显示清除按钮 */
    clearable?: boolean
    /** 禁用 */
    disabled?: boolean
    /** 触发器宽度 */
    width?: string | number
    /** 加载中文案 */
    loadingText?: string
    /** 空数据文案 */
    emptyText?: string
    /** 是否将弹层插入到 body */
    teleported?: boolean
    /** popover 自定义 class */
    popperClass?: string
    /** 自定义图标集请求地址（默认 Iconify 官方 API） */
    apiHost?: string
    /** dialog 模式标题 */
    dialogTitle?: string
    /** dialog 模式宽度 */
    dialogWidth?: string | number
    /** dialog 模式下每格最小宽度 */
    dialogGridMinSize?: number
    /** dialog 模式下图标网格最大高度 */
    dialogGridMaxHeight?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    mode: 'popover',
    prefix: 'ri',
    icons: undefined,
    placeholder: '请选择图标',
    searchPlaceholder: '搜索图标名称',
    pageSize: 96,
    panelWidth: 420,
    trigger: 'click',
    placement: 'bottom-start',
    showCategory: true,
    clearable: true,
    disabled: false,
    width: '100%',
    loadingText: '图标加载中...',
    emptyText: '暂无匹配图标',
    teleported: true,
    popperClass: '',
    apiHost: 'https://api.iconify.design',
    dialogTitle: '选择图标',
    dialogWidth: '720px',
    dialogGridMinSize: 48,
    dialogGridMaxHeight: '480px'
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
    (e: 'clear'): void
  }>()

  const ALL_CATEGORY = '__all__'
  // 模块级缓存：同一前缀在整个会话内只请求一次
  const collectionCache = new Map<
    string,
    { icons: string[]; categories: Record<string, string[]> }
  >()

  const visible = ref(false)
  const loading = ref(false)
  const loaded = ref(false)
  const keyword = ref('')
  const currentCategory = ref<string>(ALL_CATEGORY)
  const currentPage = ref(1)
  const allIcons = ref<string[]>([])
  const categories = ref<Record<string, string[]>>({})

  const triggerStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }))

  const categoryOptions = computed(() => {
    const keys = Object.keys(categories.value)
    if (!keys.length) return []
    return [{ label: '全部', value: ALL_CATEGORY }, ...keys.map((k) => ({ label: k, value: k }))]
  })

  const filteredIcons = computed(() => {
    let pool = allIcons.value
    if (currentCategory.value !== ALL_CATEGORY && categories.value[currentCategory.value]) {
      pool = categories.value[currentCategory.value].map((n) => withPrefix(n))
    }
    const kw = keyword.value.trim().toLowerCase()
    if (!kw) return pool
    return pool.filter((n) => n.toLowerCase().includes(kw))
  })

  const total = computed(() => filteredIcons.value.length)

  const pagedIcons = computed(() => {
    const start = (currentPage.value - 1) * props.pageSize
    return filteredIcons.value.slice(start, start + props.pageSize)
  })

  watch([keyword, currentCategory], () => {
    currentPage.value = 1
  })

  watch(
    () => props.prefix,
    () => {
      loaded.value = false
      allIcons.value = []
      categories.value = {}
    }
  )

  function withPrefix(name: string) {
    return name.includes(':') ? name : `${props.prefix}:${name}`
  }

  function handlePick(name: string) {
    emit('update:modelValue', name)
    emit('change', name)
    visible.value = false
  }

  function handleClear() {
    emit('update:modelValue', '')
    emit('change', '')
    emit('clear')
  }

  function openDialog() {
    if (props.disabled) return
    visible.value = true
  }

  function handleBeforeEnter() {
    if (!loaded.value) loadIcons()
  }

  async function loadIcons() {
    if (props.icons && props.icons.length) {
      allIcons.value = props.icons.map(withPrefix)
      categories.value = {}
      loaded.value = true
      return
    }

    const cached = collectionCache.get(props.prefix)
    if (cached) {
      allIcons.value = cached.icons
      categories.value = cached.categories
      loaded.value = true
      return
    }

    loading.value = true
    try {
      const res = await fetch(`${props.apiHost}/collection?prefix=${props.prefix}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as {
        uncategorized?: string[]
        categories?: Record<string, string[]>
        hidden?: string[]
      }

      const hidden = new Set(data.hidden ?? [])
      const categorized = data.categories ?? {}
      const flat: string[] = []

      Object.values(categorized).forEach((arr) => {
        arr.forEach((n) => {
          if (!hidden.has(n)) flat.push(withPrefix(n))
        })
      })
      ;(data.uncategorized ?? []).forEach((n) => {
        if (!hidden.has(n)) flat.push(withPrefix(n))
      })

      const unique = Array.from(new Set(flat))
      allIcons.value = unique
      categories.value = categorized

      collectionCache.set(props.prefix, { icons: unique, categories: categorized })
      loaded.value = true
    } catch (e) {
      ElMessage.error('图标列表加载失败，请检查网络或离线图标配置')
      console.error('[ArtIconPicker] load icons failed:', e)
    } finally {
      loading.value = false
    }
  }

  defineExpose({
    /** 手动重新加载图标集 */
    reload: () => {
      collectionCache.delete(props.prefix)
      loaded.value = false
      loadIcons()
    },
    /** 手动打开弹层 */
    open: () => {
      visible.value = true
    },
    /** 手动关闭弹层 */
    close: () => {
      visible.value = false
    }
  })
</script>

<style scoped lang="scss">
  @use './style';
</style>
