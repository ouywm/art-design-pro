// handler 元数据(前端硬编码)
// 由于后端 HandlerVo 仅有 { name },处理器卡片网格/参数卡片所需的 description /
// category / paramsSchema 等字段通过这里维护。
// 阶段 ② 仅暴露 name → label 映射,完整 schema 在阶段 ③ 扩展。

export interface HandlerParamSchema {
  key: string
  label: string
  description?: string
  type: 'number' | 'switch' | 'string'
  default: unknown
  min?: number
  max?: number
  step?: number
}

export interface HandlerMeta {
  name: string // = handler 字段值,业务唯一编码(SCREAMING_CASE)
  label: string // 中文友好名
  description: string
  category: string
  recommendedCron: string
  recommendedTimezone: string
  recommendedBlocking: 'Serial' | 'Discard' | 'Override'
  paramsSchema: HandlerParamSchema[]
}

export const HANDLER_META: HandlerMeta[] = [
  {
    name: 'CLEANUP_OPERATION_LOGS',
    label: '清理操作日志',
    description: '按保留天数定期清理操作日志,适合降低审计表膨胀风险。',
    category: '系统维护',
    recommendedCron: '0 0 3 * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'retentionDays',
        label: '日志保留天数',
        description: '仅清理早于该天数的操作日志。',
        type: 'number',
        default: 90,
        min: 1,
        max: 3650,
        step: 1
      },
      {
        key: 'batchLimit',
        label: '单次处理上限',
        description: '限制单次删除条数,降低对数据库的瞬时压力。',
        type: 'number',
        default: 5000,
        min: 100,
        max: 100000,
        step: 100
      }
    ]
  },
  {
    name: 'CLEANUP_LOGIN_LOGS',
    label: '清理登录日志',
    description: '清理历史登录日志,适合控制安全审计表的体量。',
    category: '系统维护',
    recommendedCron: '0 10 3 * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'retentionDays',
        label: '日志保留天数',
        type: 'number',
        default: 180,
        min: 1,
        max: 3650,
        step: 1
      },
      {
        key: 'batchLimit',
        label: '单次处理上限',
        type: 'number',
        default: 5000,
        min: 100,
        max: 100000,
        step: 100
      }
    ]
  },
  {
    name: 'CLEANUP_TASK_LOGS',
    label: '清理任务日志',
    description: '清理调度执行日志,防止任务日志表长期堆积。',
    category: '系统维护',
    recommendedCron: '0 20 3 * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'retentionDays',
        label: '日志保留天数',
        type: 'number',
        default: 60,
        min: 1,
        max: 3650,
        step: 1
      },
      {
        key: 'batchLimit',
        label: '单次处理上限',
        type: 'number',
        default: 5000,
        min: 100,
        max: 100000,
        step: 100
      }
    ]
  },
  {
    name: 'EXPIRE_NOTIFICATIONS',
    label: '过期通知回收',
    description: '自动将已到期的通知置为撤回状态,避免继续展示无效通知。',
    category: '通知中心',
    recommendedCron: '0 */10 * * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'graceMinutes',
        label: '宽限分钟',
        description: '到期后再延迟多少分钟才置撤回,防止时区抖动误回收。',
        type: 'number',
        default: 5,
        min: 0,
        max: 120,
        step: 1
      }
    ]
  },
  {
    name: 'PURGE_CONTENT_RECYCLE_BIN',
    label: '内容回收站自动清理',
    description: '定期彻底删除已进入内容回收站且保留期已满的数据。',
    category: '内容管理',
    recommendedCron: '0 30 3 * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'retentionDays',
        label: '回收站保留天数',
        description: '仅清理进入回收站早于该天数的内容。',
        type: 'number',
        default: 30,
        min: 1,
        max: 3650,
        step: 1
      },
      {
        key: 'batchLimit',
        label: '单次处理上限',
        description: '限制单次彻底删除数量,降低对数据库的瞬时压力。',
        type: 'number',
        default: 1000,
        min: 100,
        max: 100000,
        step: 100
      }
    ]
  },
  {
    name: 'PURGE_FILE_RECYCLE_BIN',
    label: '文件回收站自动清理',
    description: '定期彻底清理文件回收站中的过期文件,并同步删除对象存储资源。',
    category: '文件中心',
    recommendedCron: '0 40 3 * * *',
    recommendedTimezone: 'Asia/Shanghai',
    recommendedBlocking: 'Serial',
    paramsSchema: [
      {
        key: 'retentionDays',
        label: '回收站保留天数',
        type: 'number',
        default: 30,
        min: 1,
        max: 3650,
        step: 1
      },
      {
        key: 'batchLimit',
        label: '单次处理上限',
        type: 'number',
        default: 500,
        min: 100,
        max: 100000,
        step: 100
      },
      {
        key: 'deleteObjectStorage',
        label: '同步删除对象存储',
        description: '关闭则只清表,不调用对象存储 API。',
        type: 'switch',
        default: true
      }
    ]
  }
]

export const getHandlerMeta = (name: string | null | undefined): HandlerMeta | undefined => {
  if (!name) return undefined
  return HANDLER_META.find((h) => h.name === name)
}

export const getHandlerLabel = (name: string | null | undefined): string => {
  return getHandlerMeta(name)?.label ?? (name || '-')
}
