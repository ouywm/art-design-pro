<template>
  <div class="data-select-page art-page-view">
    <section class="data-select-hero art-surface-sm">
      <div class="data-select-hero__main">
        <div>
          <h1>数据选择器</h1>
          <p>
            面向后台业务里的公司、人员、地区、组织等大体量数据选择场景，保留表单字段的轻量感，同时在弹窗里提供搜索、筛选、分页、树形选择和已选管理。
          </p>
        </div>

        <div class="data-select-hero__stats">
          <div class="art-surface-muted">
            <strong>2</strong>
            <span>数据模式</span>
          </div>
          <div class="art-surface-muted">
            <strong>4</strong>
            <span>选择策略</span>
          </div>
          <div class="art-surface-muted">
            <strong>{{ totalCount }}</strong>
            <span>演示数据</span>
          </div>
        </div>
      </div>
    </section>

    <section class="data-select-grid">
      <section class="data-select-card art-surface-sm">
        <div class="data-select-card__head">
          <h3>表格多选</h3>
          <p>适合选择客户、供应商、承运商等实体数据。</p>
        </div>
        <ArtDataSelect
          v-model="companyValues"
          multiple
          title="选择公司"
          selected-title="已选公司"
          placeholder="请选择公司"
          :data="companyData"
          :columns="companyColumns"
          :search-keys="['name', 'city', 'owner']"
          label-key="name"
        />
        <SelectedPreview class="mt-4" title="当前选择" :records="selectedCompanies" />
      </section>

      <section class="data-select-card art-surface-sm">
        <div class="data-select-card__head">
          <h3>表格单选</h3>
          <p>适合弹窗内精确选择负责人、门店、仓库等单条记录。</p>
        </div>
        <ArtDataSelect
          v-model="warehouseValue"
          title="选择仓库"
          selected-title="当前仓库"
          placeholder="请选择仓库"
          :data="warehouseData"
          :columns="warehouseColumns"
          :search-keys="['name', 'city']"
          label-key="name"
        />
        <SelectedPreview class="mt-4" title="当前仓库" :records="selectedWarehouse" />
      </section>

      <section class="data-select-card art-surface-sm">
        <div class="data-select-card__head">
          <h3>树形多选</h3>
          <p>适合区域、部门、权限目录等层级数据。</p>
        </div>
        <ArtDataSelect
          v-model="regionValues"
          mode="tree"
          multiple
          title="选择区域"
          selected-title="已选区域"
          placeholder="请选择区域"
          :data="regionTreeData"
          :search-keys="['name']"
          label-key="name"
          value-key="id"
          check-strictly
        />
        <SelectedPreview class="mt-4" variant="inline" :records="selectedRegions" />
      </section>

      <section class="data-select-card art-surface-sm">
        <div class="data-select-card__head">
          <h3>树形单选</h3>
          <p>适合选择默认地区、归属部门、主权限目录等单条层级数据。</p>
        </div>
        <ArtDataSelect
          v-model="regionValue"
          mode="tree"
          title="选择归属区域"
          selected-title="当前区域"
          placeholder="请选择归属区域"
          :data="regionTreeData"
          :search-keys="['name']"
          label-key="name"
          value-key="id"
        />
        <SelectedPreview class="mt-4" title="当前区域" :records="selectedRegion" />
      </section>
    </section>

    <section class="data-select-card art-surface-sm">
      <div class="data-select-command">
        <div class="data-select-card__head">
          <h3>命令式打开</h3>
          <p
            >可隐藏默认触发器，由业务按钮、表格操作列或详情页动作打开，适合批量关联和详情页操作。</p
          >
        </div>
        <ElButton type="primary" @click="projectSelectRef?.open()">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          关联项目
        </ElButton>
      </div>

      <ArtDataSelect
        ref="projectSelectRef"
        v-model="projectValues"
        multiple
        :show-trigger="false"
        title="关联项目"
        selected-title="已关联项目"
        :data="projectData"
        :columns="projectColumns"
        :search-keys="['name', 'owner', 'city']"
        label-key="name"
        value-key="id"
      />

      <div class="project-grid">
        <article v-for="item in selectedProjects" :key="String(item.id)" class="art-surface-muted">
          <div>
            <strong>{{ item.name }}</strong>
            <ElTag size="small" type="primary" effect="plain">{{ item.status }}</ElTag>
          </div>
          <span>{{ item.owner }} · {{ item.city }}</span>
        </article>
        <span v-if="selectedProjects.length === 0" class="empty-text">暂无数据</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import ArtDataSelect from '@/components/core/forms/art-data-select/index.vue'
  import type {
    DataSelectRecord,
    DataSelectValue
  } from '@/components/core/forms/art-data-select/types'
  import {
    companyColumns,
    companyData,
    projectColumns,
    projectData,
    regionTreeData,
    warehouseColumns,
    warehouseData
  } from './mock'
  import './style.scss'

  defineOptions({ name: 'WidgetsDataSelect' })

  const companyValues = ref<DataSelectValue[]>([1, 2])
  const warehouseValue = ref<DataSelectValue>('w-1')
  const regionValues = ref<DataSelectValue[]>(['ningbo', 'luoyang'])
  const regionValue = ref<DataSelectValue>('quanzhou')
  const projectValues = ref<DataSelectValue[]>(['p-1', 'p-2', 'p-3'])
  const projectSelectRef = ref<InstanceType<typeof ArtDataSelect>>()

  const flatten = (records: DataSelectRecord[]): DataSelectRecord[] => {
    return records.flatMap((item) => [
      item,
      ...flatten((item.children as DataSelectRecord[]) || [])
    ])
  }

  const pickRecords = (
    records: DataSelectRecord[],
    values: DataSelectValue | DataSelectValue[]
  ) => {
    const valueList = Array.isArray(values) ? values : [values]
    const map = new Map(flatten(records).map((item) => [item.id as DataSelectValue, item]))
    return valueList.map((value) => map.get(value)).filter(Boolean) as DataSelectRecord[]
  }

  const selectedCompanies = computed(() => pickRecords(companyData, companyValues.value))
  const selectedWarehouse = computed(() => pickRecords(warehouseData, warehouseValue.value))
  const selectedRegions = computed(() => pickRecords(regionTreeData, regionValues.value))
  const selectedRegion = computed(() => pickRecords(regionTreeData, regionValue.value))
  const selectedProjects = computed(() => pickRecords(projectData, projectValues.value))
  const totalCount = computed(
    () =>
      companyData.length +
      warehouseData.length +
      flatten(regionTreeData).length +
      projectData.length
  )

  const SelectedPreview = defineComponent({
    props: {
      title: { type: String, default: '' },
      records: { type: Array as PropType<DataSelectRecord[]>, default: () => [] },
      variant: { type: String as PropType<'panel' | 'inline'>, default: 'panel' }
    },
    setup(props) {
      return () =>
        h(
          'div',
          {
            class: [
              'selected-preview',
              `is-${props.variant}`,
              props.variant === 'panel' ? 'art-surface-muted' : ''
            ]
          },
          [
            props.variant === 'panel'
              ? h('div', { class: 'selected-preview__title' }, props.title)
              : null,
            h(
              'div',
              { class: 'selected-preview__body' },
              props.records.length
                ? props.records.map((item) =>
                    h('span', { class: 'selected-preview__item' }, String(item.name))
                  )
                : h('span', { class: 'empty-text' }, '暂无数据')
            )
          ]
        )
    }
  })
</script>
