<template>
  <div class="art-data-select" :style="triggerWrapStyle">
    <div
      v-if="showTrigger"
      role="button"
      tabindex="0"
      class="art-data-select__trigger"
      :class="{ 'is-active': dialogVisible, 'is-disabled': disabled }"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
    >
      <div class="art-data-select__value">
        <template v-if="displaySelectedRecords.length > 0">
          <template v-if="multiple">
            <span
              v-for="item in visibleSelectedRecords"
              :key="String(getRecordValue(item))"
              class="art-data-select__tag"
            >
              <span>{{ getRecordLabel(item) }}</span>
            </span>
            <span v-if="hiddenSelectedCount > 0" class="art-data-select__tag is-count">
              +{{ hiddenSelectedCount }}
            </span>
          </template>
          <span v-else class="art-data-select__single">{{
            getRecordLabel(displaySelectedRecords[0])
          }}</span>
        </template>
        <span v-else class="art-data-select__placeholder">{{ placeholder }}</span>
      </div>

      <div class="art-data-select__suffix">
        <button
          v-if="clearable && displaySelectedRecords.length > 0 && !disabled"
          type="button"
          class="art-data-select__clear"
          @click.stop="clear"
        >
          <ArtSvgIcon icon="ri:close-line" />
        </button>
        <ArtSvgIcon icon="ri:arrow-down-s-line" class="art-data-select__arrow" />
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="title"
      :width="dialogWidth"
      align-center
      destroy-on-close
      class="art-data-select-dialog"
      @closed="handleClosed"
    >
      <div class="art-data-select-panel">
        <div class="art-data-select-panel__toolbar">
          <ElInput
            v-if="searchable"
            v-model="keyword"
            clearable
            :placeholder="searchPlaceholder"
            class="art-data-select-panel__search"
            @keyup.enter="handleSearchSubmit"
            @clear="handleSearchSubmit"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </ElInput>

          <template v-for="item in filterItems" :key="item.key">
            <ElInput
              v-if="item.type !== 'select'"
              :model-value="getInputFilterValue(item.key)"
              clearable
              :placeholder="item.placeholder || `请输入${item.label}`"
              :style="getFilterStyle(item.width)"
              @update:model-value="(value: string) => setFilterValue(item.key, value)"
              @keyup.enter="handleSearchSubmit"
              @clear="handleSearchSubmit"
            />
            <ElSelect
              v-else
              v-model="filterValues[item.key]"
              clearable
              :placeholder="item.placeholder || `请选择${item.label}`"
              :style="getFilterStyle(item.width)"
              @change="handleSearchSubmit"
              @clear="handleSearchSubmit"
            >
              <ElOption
                v-for="option in item.options || []"
                :key="String(option.value)"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </template>

          <ElButton v-if="hasRemoteRequest" type="primary" @click="handleSearchSubmit">
            查询
          </ElButton>

          <div class="art-data-select-panel__summary">
            已选 <strong>{{ localSelectedRecords.length }}</strong>
            <template v-if="multiple"> 项</template>
          </div>
        </div>

        <div class="art-data-select-panel__body" :class="`is-${mode}`">
          <div class="art-data-select-panel__main">
            <ElTable
              v-if="mode === 'table'"
              ref="tableRef"
              v-loading="remoteLoading"
              :data="tableRecords"
              :row-key="valueKey"
              border
              height="360"
              highlight-current-row
              @selection-change="handleTableSelectionChange"
              @row-click="handleTableRowClick"
            >
              <ElTableColumn v-if="multiple" type="selection" width="48" reserve-selection />
              <ElTableColumn v-else width="54">
                <template #default="{ row }">
                  <ElRadio :model-value="localSingleValue" :value="getRecordValue(row)" />
                </template>
              </ElTableColumn>
              <ElTableColumn
                v-for="column in columns"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                :min-width="column.minWidth"
              >
                <template #default="{ row }">
                  <DataSelectCell :column="column" :row="row" />
                </template>
              </ElTableColumn>
            </ElTable>

            <div v-else class="art-data-select-panel__tree">
              <ElTree
                ref="treeRef"
                :data="filteredTreeData"
                :node-key="valueKey"
                :props="treeProps"
                :show-checkbox="multiple"
                :check-strictly="checkStrictly"
                :highlight-current="!multiple"
                default-expand-all
                @check="handleTreeCheck"
                @node-click="handleTreeNodeClick"
              />
            </div>

            <div v-if="mode === 'table'" class="art-data-select-panel__pagination">
              <ElPagination
                v-model:current-page="currentPage"
                v-model:page-size="currentPageSize"
                :page-sizes="normalizedPageSizes"
                :total="tableTotal"
                layout="total, sizes, prev, pager, next"
                small
                @size-change="handlePageSizeChange"
              />
            </div>
          </div>

          <aside class="art-data-select-panel__selected">
            <div class="art-data-select-panel__selected-head">
              <span>{{ selectedTitle }}</span>
              <ElButton
                v-if="localSelectedRecords.length > 0"
                link
                type="primary"
                @click="clearLocal"
              >
                清空
              </ElButton>
            </div>

            <ElScrollbar class="art-data-select-panel__selected-list">
              <div v-if="localSelectedRecords.length === 0" class="art-data-select-panel__empty">
                {{ emptyText }}
              </div>
              <div
                v-for="item in localSelectedRecords"
                :key="String(getRecordValue(item))"
                class="art-data-select-panel__selected-item"
              >
                <span>{{ getRecordLabel(item) }}</span>
                <button type="button" @click="removeLocal(getRecordValue(item))">
                  <ArtSvgIcon icon="ri:close-line" />
                </button>
              </div>
            </ElScrollbar>
          </aside>
        </div>
      </div>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="confirm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { defineComponent, h } from 'vue'
  import type { CSSProperties, PropType, VNode } from 'vue'
  import type { ElTable, ElTree } from 'element-plus'
  import type {
    DataSelectColumn,
    DataSelectFilterItem,
    DataSelectFilterValue,
    DataSelectMode,
    DataSelectRecord,
    DataSelectRequest,
    DataSelectValue
  } from './types'
  import {
    buildDataSelectRequestParams,
    createSelectedRecordCache,
    normalizeDataSelectPageSizes,
    normalizeDataSelectResponse,
    sliceDataSelectPage
  } from './utils'
  import './style.scss'

  defineOptions({ name: 'ArtDataSelect' })

  interface Props {
    modelValue?: DataSelectValue | DataSelectValue[]
    data?: DataSelectRecord[]
    mode?: DataSelectMode
    multiple?: boolean
    valueKey?: string
    labelKey?: string
    childrenKey?: string
    columns?: DataSelectColumn[]
    selectedRecords?: DataSelectRecord[]
    request?: DataSelectRequest
    requestParams?: Record<string, unknown>
    filterItems?: DataSelectFilterItem[]
    searchable?: boolean
    searchKeys?: string[]
    placeholder?: string
    searchPlaceholder?: string
    title?: string
    selectedTitle?: string
    emptyText?: string
    disabled?: boolean
    clearable?: boolean
    showTrigger?: boolean
    width?: string | number
    dialogWidth?: string | number
    pageSize?: number
    pageSizes?: number[]
    maxCollapseTags?: number
    checkStrictly?: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: DataSelectValue | DataSelectValue[] | undefined): void
    (e: 'change', records: DataSelectRecord[]): void
    (e: 'open'): void
    (e: 'close'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    data: () => [],
    mode: 'table',
    multiple: false,
    valueKey: 'id',
    labelKey: 'label',
    childrenKey: 'children',
    columns: () => [],
    selectedRecords: () => [],
    request: undefined,
    requestParams: () => ({}),
    filterItems: () => [],
    searchable: true,
    searchKeys: () => [],
    placeholder: '请选择数据',
    searchPlaceholder: '搜索关键词',
    title: '选择数据',
    selectedTitle: '已选数据',
    emptyText: '暂无数据',
    disabled: false,
    clearable: true,
    showTrigger: true,
    width: '100%',
    dialogWidth: '860px',
    pageSize: 10,
    pageSizes: () => [10, 20, 50, 100],
    maxCollapseTags: 2,
    checkStrictly: false
  })

  const emit = defineEmits<Emits>()

  const tableRef = ref<InstanceType<typeof ElTable>>()
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const dialogVisible = ref(false)
  const keyword = ref('')
  const currentPage = ref(1)
  const currentPageSize = ref(props.pageSize)
  const localSelectedValues = ref<DataSelectValue[]>([])
  const remoteLoading = ref(false)
  const remoteRecords = ref<DataSelectRecord[]>([])
  const remoteTotal = ref(0)
  const filterValues = reactive<Record<string, DataSelectFilterValue>>({})
  const selectedRecordCache = createSelectedRecordCache(props.valueKey)

  const initFilterValues = () => {
    props.filterItems.forEach((item) => {
      if (!(item.key in filterValues)) {
        filterValues[item.key] = undefined
      }
    })
  }

  initFilterValues()

  const triggerWrapStyle = computed<CSSProperties>(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width
  }))

  const treeProps = computed(() => ({
    label: props.labelKey,
    children: props.childrenKey
  }))

  const modelValues = computed<DataSelectValue[]>(() => {
    if (props.multiple) {
      return Array.isArray(props.modelValue) ? props.modelValue : []
    }
    return props.modelValue === undefined || Array.isArray(props.modelValue)
      ? []
      : [props.modelValue]
  })

  const flattenRecords = (records: DataSelectRecord[]): DataSelectRecord[] => {
    const result: DataSelectRecord[] = []
    const walk = (items: DataSelectRecord[]) => {
      items.forEach((item) => {
        result.push(item)
        const children = item[props.childrenKey]
        if (Array.isArray(children)) {
          walk(children as DataSelectRecord[])
        }
      })
    }
    walk(records)
    return result
  }

  const flatRecords = computed(() => flattenRecords(props.data))

  const recordMap = computed(() => {
    const map = new Map<DataSelectValue, DataSelectRecord>()
    ;[
      ...flatRecords.value,
      ...remoteRecords.value,
      ...props.selectedRecords,
      ...selectedRecordCache.entries()
    ].forEach((item) => {
      map.set(getRecordValue(item), item)
    })
    return map
  })

  const getRecordValue = (record: DataSelectRecord): DataSelectValue => {
    return record[props.valueKey] as DataSelectValue
  }

  const getRecordLabel = (record: DataSelectRecord): string => {
    const value = record[props.labelKey]
    return value === undefined || value === null ? String(getRecordValue(record)) : String(value)
  }

  const getRecordsByValues = (values: DataSelectValue[]) => {
    return values.map((value) => recordMap.value.get(value)).filter(Boolean) as DataSelectRecord[]
  }

  const displaySelectedRecords = computed(() => getRecordsByValues(modelValues.value))
  const localSelectedRecords = computed(() => getRecordsByValues(localSelectedValues.value))
  const visibleSelectedRecords = computed(() =>
    displaySelectedRecords.value.slice(0, props.maxCollapseTags)
  )
  const hiddenSelectedCount = computed(() =>
    Math.max(0, displaySelectedRecords.value.length - props.maxCollapseTags)
  )
  const localSingleValue = computed(() => localSelectedValues.value[0])
  const hasRemoteRequest = computed(() => typeof props.request === 'function')
  const normalizedPageSizes = computed(() =>
    normalizeDataSelectPageSizes(props.pageSizes, currentPageSize.value)
  )

  const normalizeText = (value: unknown) => String(value ?? '').toLowerCase()

  const DataSelectCell = defineComponent({
    name: 'DataSelectCell',
    props: {
      column: {
        type: Object as PropType<DataSelectColumn>,
        required: true
      },
      row: {
        type: Object as PropType<DataSelectRecord>,
        required: true
      }
    },
    setup(cellProps) {
      return () => {
        const content = cellProps.column.formatter
          ? cellProps.column.formatter(cellProps.row)
          : cellProps.row[cellProps.column.prop]

        return typeof content === 'object' && content !== null
          ? (content as VNode)
          : h('span', String(content ?? ''))
      }
    }
  })

  const recordMatches = (record: DataSelectRecord, keys = props.searchKeys) => {
    const value = keyword.value.trim().toLowerCase()
    if (!value) return true

    const fields = keys.length > 0 ? keys : [props.labelKey]
    return fields.some((key) => normalizeText(record[key]).includes(value))
  }

  const filteredRecords = computed(() => {
    return flatRecords.value.filter((item) => recordMatches(item))
  })

  const pagedRecords = computed(() => {
    return sliceDataSelectPage(filteredRecords.value, currentPage.value, currentPageSize.value)
  })

  const tableRecords = computed(() =>
    hasRemoteRequest.value ? remoteRecords.value : pagedRecords.value
  )
  const tableTotal = computed(() =>
    hasRemoteRequest.value ? remoteTotal.value : filteredRecords.value.length
  )

  const filterTree = (items: DataSelectRecord[]): DataSelectRecord[] => {
    const value = keyword.value.trim()
    if (!value) return items

    return items
      .map((item) => {
        const children = item[props.childrenKey]
        const matchedChildren = Array.isArray(children)
          ? filterTree(children as DataSelectRecord[])
          : []
        if (recordMatches(item) || matchedChildren.length > 0) {
          return {
            ...item,
            [props.childrenKey]: matchedChildren
          }
        }
        return null
      })
      .filter(Boolean) as DataSelectRecord[]
  }

  const filteredTreeData = computed(() => filterTree(props.data))

  const syncWidgets = async () => {
    await nextTick()
    if (props.mode === 'table' && props.multiple) {
      tableRef.value?.clearSelection()
      tableRecords.value.forEach((row) => {
        if (localSelectedValues.value.includes(getRecordValue(row))) {
          tableRef.value?.toggleRowSelection(row, true)
        }
      })
    }

    if (props.mode === 'tree') {
      if (props.multiple) {
        treeRef.value?.setCheckedKeys(localSelectedValues.value)
      } else {
        treeRef.value?.setCurrentKey(localSelectedValues.value[0])
      }
    }
  }

  watch([pagedRecords, filteredTreeData], () => {
    if (dialogVisible.value) {
      syncWidgets()
    }
  })

  watch(remoteRecords, () => {
    if (dialogVisible.value) {
      syncWidgets()
    }
  })

  watch(keyword, () => {
    if (!hasRemoteRequest.value) {
      currentPage.value = 1
    }
  })

  watch(currentPage, () => {
    if (dialogVisible.value && hasRemoteRequest.value) {
      loadRemoteData()
    }
  })

  watch(
    () => props.selectedRecords,
    (records) => {
      selectedRecordCache.merge(records)
    },
    { immediate: true, deep: true }
  )

  watch(
    () => props.filterItems,
    () => {
      initFilterValues()
    },
    { deep: true }
  )

  const open = async () => {
    if (props.disabled) return
    localSelectedValues.value = [...modelValues.value]
    selectedRecordCache.merge(props.selectedRecords)
    selectedRecordCache.prune(localSelectedValues.value)
    dialogVisible.value = true
    emit('open')
    if (hasRemoteRequest.value) {
      await loadRemoteData()
    }
    await syncWidgets()
  }

  const handleClosed = () => {
    keyword.value = ''
    currentPage.value = 1
    Object.keys(filterValues).forEach((key) => {
      filterValues[key] = undefined
    })
    emit('close')
  }

  const clear = () => {
    const value = props.multiple ? [] : undefined
    selectedRecordCache.clear()
    emit('update:modelValue', value)
    emit('change', [])
  }

  const clearLocal = () => {
    localSelectedValues.value = []
    selectedRecordCache.clear()
    syncWidgets()
  }

  const removeLocal = (value: DataSelectValue) => {
    localSelectedValues.value = localSelectedValues.value.filter((item) => item !== value)
    selectedRecordCache.prune(localSelectedValues.value)
    syncWidgets()
  }

  const handleTableSelectionChange = (selection: DataSelectRecord[]) => {
    if (!props.multiple) return

    selectedRecordCache.merge(selection)
    const pageValues = tableRecords.value.map((item) => getRecordValue(item))
    const preservedValues = localSelectedValues.value.filter((value) => !pageValues.includes(value))
    localSelectedValues.value = [
      ...preservedValues,
      ...selection.map((item) => getRecordValue(item))
    ]
  }

  const handleTableRowClick = (row: DataSelectRecord) => {
    if (props.multiple) {
      const value = getRecordValue(row)
      if (localSelectedValues.value.includes(value)) {
        removeLocal(value)
      } else {
        localSelectedValues.value = [...localSelectedValues.value, value]
        selectedRecordCache.merge([row])
      }
      selectedRecordCache.prune(localSelectedValues.value)
      syncWidgets()
      return
    }

    localSelectedValues.value = [getRecordValue(row)]
    selectedRecordCache.merge([row])
  }

  const handleTreeCheck = (
    _node: DataSelectRecord,
    checked: { checkedKeys: DataSelectValue[] }
  ) => {
    localSelectedValues.value = checked.checkedKeys
  }

  const handleTreeNodeClick = (node: DataSelectRecord) => {
    if (props.multiple) return
    localSelectedValues.value = [getRecordValue(node)]
    syncWidgets()
  }

  const confirm = () => {
    const records = getRecordsByValues(localSelectedValues.value)
    const value = props.multiple ? [...localSelectedValues.value] : localSelectedValues.value[0]
    emit('update:modelValue', value)
    emit('change', records)
    dialogVisible.value = false
  }

  defineExpose({
    open,
    clear
  })

  const resetPageOrReloadRemote = () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    } else {
      if (dialogVisible.value && hasRemoteRequest.value) {
        loadRemoteData()
      }
    }
  }

  const handleSearchSubmit = () => {
    if (!hasRemoteRequest.value || !dialogVisible.value) return

    resetPageOrReloadRemote()
  }

  const handlePageSizeChange = () => {
    resetPageOrReloadRemote()
  }

  const loadRemoteData = async () => {
    if (!props.request) return

    remoteLoading.value = true
    try {
      const response = await props.request(
        buildDataSelectRequestParams({
          page: currentPage.value,
          size: currentPageSize.value,
          keyword: keyword.value,
          filters: filterValues,
          extraParams: props.requestParams
        })
      )
      const normalized = normalizeDataSelectResponse(response)
      remoteRecords.value = normalized.records
      remoteTotal.value = normalized.total
    } finally {
      remoteLoading.value = false
    }
  }

  watch(
    () => props.pageSize,
    (size) => {
      currentPageSize.value = size
      resetPageOrReloadRemote()
    }
  )

  const getFilterStyle = (width?: string | number): CSSProperties => ({
    width: typeof width === 'number' ? `${width}px` : width || '160px'
  })

  const getInputFilterValue = (key: string) => {
    const value = filterValues[key]
    return typeof value === 'boolean' ? String(value) : value
  }

  const setFilterValue = (key: string, value: DataSelectFilterValue) => {
    filterValues[key] = value
  }
</script>
