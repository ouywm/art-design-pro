import type {
  CapabilityGroup,
  DiagnosticItem,
  GenerationHistory,
  GenerationTask,
  GenerationVersion,
  GeneratorField,
  GeneratorModuleConfig,
  PreviewFile,
  PreviewRecord,
  QualityGate,
  WorkflowStep,
  WriteSummaryItem
} from './types'

export const workflowSteps: WorkflowStep[] = [
  {
    key: 'requirement',
    index: 1,
    title: '解析需求',
    desc: '输入业务描述，生成可编辑的模块结构。',
    tip: '已生成模块结构，可继续检查字段'
  },
  {
    key: 'fields',
    index: 2,
    title: '检查字段',
    desc: '确认模块信息、字段、搜索和表格展示。',
    tip: '字段已确认，可查看代码'
  },
  {
    key: 'preview',
    index: 3,
    title: '预览代码',
    desc: '查看将写入的页面和接口文件。',
    tip: '下一步：执行一键生成'
  },
  {
    key: 'generate',
    index: 4,
    title: '一键生成',
    desc: '自动写入代码、更新数据库结构、检查打包并刷新菜单权限。',
    tip: '点击代码预览区的一键生成'
  }
]

export const requirementExamples = [
  '项目管理',
  '客户档案',
  '合同台账',
  '资产台账',
  '供应商管理',
  '工单管理',
  '合同套件',
  '项目套件'
]

export const defaultRequirement =
  '生成客户管理模块，字段包含客户名称、手机号、所属行业、客户状态、客户等级、负责人、创建时间，支持搜索、新增、编辑、删除、批量删除、详情和状态启停。'

export const moduleConfig: GeneratorModuleConfig = {
  title: '客户管理',
  name: 'customer',
  group: 'crm',
  modelName: 'Customer',
  pagePath: '/crm/customer',
  apiPath: '/customers',
  statusField: '客户状态（status）',
  capabilities: {
    page: ['list', 'detail'],
    operation: ['create', 'update', 'delete', 'batchDelete', 'statusToggle']
  },
  strategy: {
    formMode: 'dialog',
    deleteMode: 'soft',
    conflictMode: 'stop'
  }
}

export const capabilityGroups: CapabilityGroup[] = [
  {
    key: 'page',
    label: '页面能力',
    options: [
      { label: '列表', value: 'list' },
      { label: '详情', value: 'detail' }
    ]
  },
  {
    key: 'operation',
    label: '操作能力',
    options: [
      { label: '新增', value: 'create' },
      { label: '编辑', value: 'update' },
      { label: '删除', value: 'delete' },
      { label: '批量删除', value: 'batchDelete' },
      { label: '状态启停', value: 'statusToggle' }
    ]
  }
]

export const mockFields: GeneratorField[] = [
  {
    id: 1,
    label: '客户名称',
    prop: 'customerName',
    type: '文本',
    validation: '自动',
    length: 80,
    defaultValue: '',
    required: true,
    inForm: true,
    searchable: true,
    inTable: true,
    sortable: false,
    component: 'Input',
    advanced: {
      formSpan: 12,
      placeholder: '请输入客户名称',
      help: '作为列表主字段和详情标题展示。'
    }
  },
  {
    id: 2,
    label: '手机号',
    prop: 'phone',
    type: '文本',
    validation: '手机号',
    length: 20,
    defaultValue: '',
    required: true,
    inForm: true,
    searchable: false,
    inTable: true,
    sortable: false,
    component: 'Input'
  },
  {
    id: 3,
    label: '所属行业',
    prop: 'industry',
    type: '下拉',
    validation: '自动',
    length: 40,
    defaultValue: '互联网',
    required: false,
    inForm: true,
    searchable: false,
    inTable: true,
    sortable: false,
    component: 'Select',
    dict: 'crm_industry'
  },
  {
    id: 4,
    label: '客户状态',
    prop: 'status',
    type: '下拉',
    validation: '自动',
    length: 20,
    defaultValue: '启用',
    required: true,
    inForm: true,
    searchable: true,
    inTable: true,
    sortable: false,
    component: 'Select',
    dict: 'common_status'
  },
  {
    id: 5,
    label: '客户等级',
    prop: 'level',
    type: '下拉',
    validation: '自动',
    length: 20,
    defaultValue: 'A',
    required: false,
    inForm: true,
    searchable: false,
    inTable: true,
    sortable: false,
    component: 'Select',
    dict: 'crm_customer_level'
  },
  {
    id: 6,
    label: '负责人',
    prop: 'ownerName',
    type: '文本',
    validation: '自动',
    length: 40,
    defaultValue: '',
    required: false,
    inForm: true,
    searchable: false,
    inTable: true,
    sortable: false,
    component: 'Input'
  },
  {
    id: 7,
    label: '成交金额',
    prop: 'dealAmount',
    type: '数字',
    validation: '百分比',
    length: 12,
    defaultValue: '0',
    required: false,
    inForm: true,
    searchable: false,
    inTable: false,
    sortable: true,
    component: 'InputNumber'
  },
  {
    id: 8,
    label: '备注',
    prop: 'remark',
    type: '长文本',
    validation: '自动',
    length: 500,
    defaultValue: '',
    required: false,
    inForm: true,
    searchable: false,
    inTable: false,
    sortable: false,
    component: 'Textarea'
  },
  {
    id: 9,
    label: '创建时间',
    prop: 'createdAt',
    type: '日期时间',
    validation: '自动',
    defaultValue: 'CURRENT_TIMESTAMP',
    required: false,
    inForm: false,
    searchable: false,
    inTable: true,
    sortable: true,
    component: 'DateTime'
  },
  {
    id: 10,
    label: '更新时间',
    prop: 'updatedAt',
    type: '日期时间',
    validation: '自动',
    defaultValue: 'CURRENT_TIMESTAMP',
    required: false,
    inForm: false,
    searchable: false,
    inTable: false,
    sortable: true,
    component: 'DateTime'
  }
]

export const readyDiagnostics: DiagnosticItem[] = [
  {
    title: '需求结构',
    desc: '客户管理 已形成可编辑的模块结构。',
    tag: '通过',
    tagType: 'success',
    level: 'ready'
  },
  {
    title: '结构检查',
    desc: '名称、页面地址、接口地址和基础字段结构暂无明显问题。',
    tag: '通过',
    tagType: 'success',
    level: 'ready'
  },
  {
    title: '数据模型',
    desc: '10 个字段，3 个必填，2 个可搜索。',
    tag: '通过',
    tagType: 'success',
    level: 'ready'
  },
  {
    title: '列表体验',
    desc: '当前配置 6 个列表字段、8 个表单字段。',
    tag: '通过',
    tagType: 'success',
    level: 'ready'
  },
  {
    title: '代码预览',
    desc: '已预览 14 个待写入文件。',
    tag: '通过',
    tagType: 'success',
    level: 'ready'
  },
  {
    title: '生成验证',
    desc: '正式环境仅允许生成预览和写入检查，写入与真实数据验证请在开发环境执行。',
    tag: '关注',
    tagType: 'warning',
    level: 'warning'
  }
]

export const pendingDiagnostics: DiagnosticItem[] = [
  {
    title: '需求结构',
    desc: '还没有生成模块结构，无法进入字段配置和生成验证。',
    tag: '需处理',
    tagType: 'danger',
    level: 'error'
  },
  {
    title: '结构检查',
    desc: '名称、页面地址、接口地址和基础字段结构暂无明显问题。',
    tag: '关注',
    tagType: 'warning',
    level: 'warning'
  },
  {
    title: '数据模型',
    desc: '0 个字段，0 个必填，0 个可搜索。',
    tag: '需处理',
    tagType: 'danger',
    level: 'error'
  },
  {
    title: '列表体验',
    desc: '当前配置 0 个列表字段、0 个表单字段。',
    tag: '需处理',
    tagType: 'danger',
    level: 'error'
  },
  {
    title: '代码预览',
    desc: '权限已生成，但还没有形成代码预览。',
    tag: '需处理',
    tagType: 'danger',
    level: 'error'
  },
  {
    title: '生成验证',
    desc: '正式环境仅允许生成预览和写入检查，写入与真实数据验证请在开发环境执行。',
    tag: '关注',
    tagType: 'warning',
    level: 'warning'
  }
]

export const initialDiagnostics = readyDiagnostics

export const previewRows: PreviewRecord[] = [
  {
    id: 1,
    name: '上海云桥科技有限公司',
    phone: '138****1024',
    industry: '互联网',
    status: '启用',
    level: 'A',
    owner: '林夏',
    createdAt: '2026-06-07 09:40'
  },
  {
    id: 2,
    name: '杭州镜湖供应链',
    phone: '136****3818',
    industry: '制造业',
    status: '跟进中',
    level: 'B',
    owner: '周宁',
    createdAt: '2026-06-06 15:22'
  },
  {
    id: 3,
    name: '深圳知远咨询',
    phone: '159****7720',
    industry: '企业服务',
    status: '停用',
    level: 'C',
    owner: '陈一',
    createdAt: '2026-06-05 11:08'
  }
]

export const previewFiles: PreviewFile[] = [
  {
    path: 'art-design-pro-x-ui/src/views/crm/customer/index.vue',
    language: 'vue',
    action: '新建',
    code: `<template>
  <div class="art-full-height">
    <CustomerSearch v-model="searchForm" @search="getList" @reset="resetSearch" />
    <ElCard class="art-table-card">
      <ArtTable :data="tableData" :columns="columns" />
    </ElCard>
  </div>
</template>`
  },
  {
    path: 'art-design-pro-x-ui/src/views/crm/customer/components/customer-search.vue',
    language: 'vue',
    action: '新建',
    code: `<template>
  <ArtSearchBar>
    <ElForm :model="modelValue">
      <ElFormItem label="客户名称">
        <ElInput v-model="modelValue.customerName" placeholder="搜索客户名称" />
      </ElFormItem>
      <ElFormItem label="客户状态">
        <ElSelect v-model="modelValue.status" placeholder="请选择客户状态" />
      </ElFormItem>
    </ElForm>
  </ArtSearchBar>
</template>`
  },
  {
    path: 'art-design-pro-x-ui/src/views/crm/customer/components/customer-dialog.vue',
    language: 'vue',
    action: '新建',
    code: `<template>
  <ElDialog v-model="visible" title="客户管理">
    <ElForm :model="form" label-width="96px">
      <ElFormItem label="客户名称" prop="customerName">
        <ElInput v-model="form.customerName" />
      </ElFormItem>
    </ElForm>
  </ElDialog>
</template>`
  },
  {
    path: 'art-design-pro-x-ui/src/api/crm/customer.ts',
    language: 'typescript',
    action: '新建',
    code: `import request from '@/utils/http'

export function fetchCustomerPage(params: Api.Crm.CustomerQuery) {
  return request.get<Api.Crm.CustomerPage>({
    url: '/api/crm/customers',
    params
  })
}`
  },
  {
    path: 'art-design-pro-x-ui/src/types/api/crm/customer.d.ts',
    language: 'typescript',
    action: '新建',
    code: `declare namespace Api.Crm {
  interface Customer {
    id: number
    customerName: string
    phone: string
    status: string
  }
}`
  },
  {
    path: 'art-design-pro-x-ui/src/router/modules/crm.ts',
    language: 'typescript',
    action: '合并',
    code: `export default {
  path: '/crm',
  meta: { title: 'CRM' },
  children: [
    {
      path: 'customer',
      name: 'CrmCustomer',
      component: () => import('@/views/crm/customer/index.vue')
    }
  ]
}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/customer.module.ts',
    language: 'typescript',
    action: '新建',
    code: `import { Module } from '@nestjs/common'
import { CustomerController } from './customer.controller'
import { CustomerService } from './customer.service'

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService]
})
export class CustomerModule {}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/customer.controller.ts',
    language: 'typescript',
    action: '新建',
    code: `import { Controller, Get, Query } from '@nestjs/common'
import { CustomerService } from './customer.service'

@Controller('/crm/customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get()
  page(@Query() query: Record<string, unknown>) {
    return this.service.page(query)
  }
}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/customer.service.ts',
    language: 'typescript',
    action: '新建',
    code: `export class CustomerService {
  page(query: Record<string, unknown>) {
    return { content: [], page: query.page ?? 1, size: query.size ?? 20 }
  }
}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/dto/customer-query.dto.ts',
    language: 'typescript',
    action: '新建',
    code: `export class CustomerQueryDto {
  customerName?: string
  status?: string
}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/dto/customer-save.dto.ts',
    language: 'typescript',
    action: '新建',
    code: `export class CustomerSaveDto {
  customerName!: string
  phone!: string
  status!: string
}`
  },
  {
    path: 'art-design-pro-x-server/src/modules/crm/entities/customer.entity.ts',
    language: 'typescript',
    action: '新建',
    code: `export interface CustomerEntity {
  id: number
  customerName: string
  phone: string
  industry?: string
  status: string
}`
  },
  {
    path: 'database/migrations/202606070001-create-crm-customer.sql',
    language: 'sql',
    action: '新建',
    code: `create table crm_customer (
  id bigint primary key,
  customer_name varchar(80) not null,
  phone varchar(20) not null,
  status varchar(20) not null,
  created_at timestamp not null
);`
  },
  {
    path: 'docs/generator/crm-customer.md',
    language: 'markdown',
    action: '新建',
    code: `# 客户管理

生成范围包含前端页面、接口类型、后端模块、DTO、实体和初始化迁移。`
  }
]

export const qualityGates: QualityGate[] = [
  {
    title: '模块结构检查',
    desc: '名称、页面地址、字段类型和下拉选项均已通过基础检查。',
    tag: '通过',
    tagType: 'success',
    status: 'passed'
  },
  {
    title: '列表检索体验',
    desc: '已配置 2 个搜索字段。',
    tag: '通过',
    tagType: 'success',
    status: 'passed'
  },
  {
    title: '表格信息密度',
    desc: '已配置 6 个表格展示字段。',
    tag: '通过',
    tagType: 'success',
    status: 'passed'
  },
  {
    title: '表单约束',
    desc: '已配置 3 个必填表单字段。',
    tag: '通过',
    tagType: 'success',
    status: 'passed'
  },
  {
    title: '权限覆盖',
    desc: '将生成 8 个页面与按钮权限标识。',
    tag: '通过',
    tagType: 'success',
    status: 'passed'
  },
  {
    title: '上线风险',
    desc: '写入真实项目之前仍需执行写入检查，确认不会覆盖手写代码。',
    tag: '建议',
    tagType: 'warning',
    status: 'warning'
  }
]

export const writeSummary: WriteSummaryItem[] = [
  { label: '新建', value: 13, type: 'success' },
  { label: '合并', value: 1, type: 'primary' },
  { label: '覆盖', value: 0, type: 'warning' },
  { label: '冲突', value: 0, type: 'danger' }
]

export const mockTasks: GenerationTask[] = [
  {
    id: 1,
    name: '环境检查',
    status: 'success',
    count: 1,
    duration: '74ms',
    message: '环境检查完成',
    retryable: false
  },
  {
    id: 2,
    name: '写入检查与改动对比',
    status: 'failed',
    count: 1,
    duration: '82ms',
    message: '不允许写入当前项目外的路径：art-design-pro-x-ui/src/views/crm/customer/index.vue',
    retryable: true
  },
  {
    id: 3,
    name: '生成代码预览',
    status: 'success',
    count: 1,
    duration: '130ms',
    message: '代码预览已生成',
    retryable: false
  },
  {
    id: 4,
    name: '解析需求并生成模块结构',
    status: 'success',
    count: 1,
    duration: '5696ms',
    message: '模块结构解析完成',
    retryable: false
  }
]

export const mockVersions: GenerationVersion[] = [
  {
    version: 'v3',
    module: '客户管理',
    source: '代码预览',
    fields: 10,
    time: '2026/6/7 21:11:53'
  },
  {
    version: 'v2',
    module: '客户管理',
    source: '代码预览',
    fields: 7,
    time: '2026/6/6 23:56:12'
  },
  {
    version: 'v1',
    module: '客户管理',
    source: '需求解析',
    fields: 6,
    time: '2026/6/6 23:55:53'
  }
]

export const mockHistory: GenerationHistory[] = []
