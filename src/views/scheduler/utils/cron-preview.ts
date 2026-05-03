// 6 段 cron 预览工具
// 格式:秒 分 时 日 月 周(0/7=星期日, 1=星期一)
// 仅支持基本语法:* / N / */N / m-n / m,n,k
// 不支持高级修饰符(L/W/?/H 等)— 这些场景由后端调度器实际触发,前端预览仅作辅助

interface ParsedCron {
  second: number[]
  minute: number[]
  hour: number[]
  dayOfMonth: number[]
  month: number[] // 1-12
  dayOfWeek: number[] // 0-6 (0=Sunday)
  dayOfMonthRaw: string
  dayOfWeekRaw: string
}

const range = (start: number, end: number) => {
  const arr: number[] = []
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
}

const parseField = (expr: string, min: number, max: number): number[] => {
  if (expr.includes(',')) {
    return Array.from(new Set(expr.split(',').flatMap((p) => parseField(p.trim(), min, max)))).sort(
      (a, b) => a - b
    )
  }
  if (expr === '*') return range(min, max)
  // 形如 a-b/n 或 */n
  if (expr.includes('/')) {
    const [base, stepStr] = expr.split('/')
    const step = parseInt(stepStr, 10)
    if (!step || step <= 0) throw new Error(`步长无效: ${expr}`)
    const baseValues = base === '*' ? range(min, max) : parseField(base, min, max)
    if (baseValues.length === 0) return []
    const start = baseValues[0]
    return baseValues.filter((v) => (v - start) % step === 0)
  }
  // 形如 a-b
  if (expr.includes('-')) {
    const [s, e] = expr.split('-').map((n) => parseInt(n, 10))
    if (Number.isNaN(s) || Number.isNaN(e) || s > e) throw new Error(`范围无效: ${expr}`)
    return range(Math.max(s, min), Math.min(e, max))
  }
  const v = parseInt(expr, 10)
  if (Number.isNaN(v)) throw new Error(`字段值无效: ${expr}`)
  if (v < min || v > max) throw new Error(`字段值超出范围: ${expr} (允许 ${min}-${max})`)
  return [v]
}

const normalizeDayOfWeek = (values: number[]): number[] =>
  Array.from(new Set(values.map((v) => (v === 7 ? 0 : v)))).sort((a, b) => a - b)

export const parseCron = (raw: string): ParsedCron => {
  const expr = raw.trim().replace(/\s+/g, ' ')
  const parts = expr.split(' ')
  if (parts.length !== 6) {
    throw new Error('Cron 必须是 6 段:秒 分 时 日 月 周')
  }
  const [s, m, h, dom, mo, dow] = parts
  return {
    second: parseField(s, 0, 59),
    minute: parseField(m, 0, 59),
    hour: parseField(h, 0, 23),
    dayOfMonth: parseField(dom, 1, 31),
    month: parseField(mo, 1, 12),
    dayOfWeek: normalizeDayOfWeek(parseField(dow.replace(/^7$/, '0'), 0, 7)),
    dayOfMonthRaw: dom,
    dayOfWeekRaw: dow
  }
}

const matchesDayConstraint = (cron: ParsedCron, date: Date): boolean => {
  const domMatches = cron.dayOfMonth.includes(date.getDate())
  const dowMatches = cron.dayOfWeek.includes(date.getDay())
  const domIsAny = cron.dayOfMonthRaw === '*'
  const dowIsAny = cron.dayOfWeekRaw === '*'

  if (domIsAny && dowIsAny) return true
  if (!domIsAny && dowIsAny) return domMatches
  if (domIsAny && !dowIsAny) return dowMatches
  return domMatches || dowMatches
}

// 给定起点 after,找出下一次满足 cron 的时间(包含 after 之后,不包含 after)
const nextFireAfter = (cron: ParsedCron, after: Date): Date | null => {
  const candidate = new Date(after.getTime())
  candidate.setMilliseconds(0)
  candidate.setSeconds(candidate.getSeconds() + 1)

  // 最多遍历 366 * 24 * 60 = 527040 分钟(在最坏情况下,如月日组合永不出现时跳出)
  for (let i = 0; i < 600_000; i++) {
    if (!cron.month.includes(candidate.getMonth() + 1)) {
      candidate.setDate(1)
      candidate.setHours(0)
      candidate.setMinutes(0)
      candidate.setSeconds(0)
      candidate.setMonth(candidate.getMonth() + 1)
      continue
    }
    if (!matchesDayConstraint(cron, candidate)) {
      candidate.setHours(0)
      candidate.setMinutes(0)
      candidate.setSeconds(0)
      candidate.setDate(candidate.getDate() + 1)
      continue
    }
    if (!cron.hour.includes(candidate.getHours())) {
      candidate.setMinutes(0)
      candidate.setSeconds(0)
      candidate.setHours(candidate.getHours() + 1)
      continue
    }
    if (!cron.minute.includes(candidate.getMinutes())) {
      candidate.setSeconds(0)
      candidate.setMinutes(candidate.getMinutes() + 1)
      continue
    }
    if (!cron.second.includes(candidate.getSeconds())) {
      candidate.setSeconds(candidate.getSeconds() + 1)
      continue
    }
    return candidate
  }
  return null
}

export interface CronNextFireItem {
  date: Date
  local: string
  utc: string
}

const pad = (n: number) => n.toString().padStart(2, '0')

const formatLocal = (d: Date) =>
  `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

export const computeNextFires = (
  cron: string,
  count = 5,
  from: Date = new Date()
): CronNextFireItem[] => {
  const parsed = parseCron(cron)
  const result: CronNextFireItem[] = []
  let cursor = from
  for (let i = 0; i < count; i++) {
    const next = nextFireAfter(parsed, cursor)
    if (!next) break
    result.push({
      date: next,
      local: formatLocal(next),
      utc: next.toISOString()
    })
    cursor = next
  }
  return result
}

// ============ humanizeCron: 把 cron 翻译成中文人话描述 ============

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

const isAll = (raw: string) => raw === '*'

const isStep = (raw: string): { step: number } | null => {
  const m = raw.match(/^\*\/(\d+)$/)
  return m ? { step: parseInt(m[1], 10) } : null
}

const isSingle = (raw: string): number | null => {
  return /^\d+$/.test(raw) ? parseInt(raw, 10) : null
}

const padTime = (h: number, m: number, s: number) => `${pad(h)}:${pad(m)}:${pad(s)}`

export const humanizeCron = (cron: string): string => {
  const expr = cron.trim().replace(/\s+/g, ' ')
  const parts = expr.split(' ')
  if (parts.length !== 6) return ''
  const [s, m, h, dom, , dow] = parts
  // 月份固定 *,处理 5 个常见模式

  // 模式: 每 N 秒 (秒=*/N, 其他=*)
  const secStep = isStep(s)
  if (secStep && isAll(m) && isAll(h) && isAll(dom) && isAll(dow)) {
    return `每 ${secStep.step} 秒执行`
  }

  // 模式: 每 N 分钟 (秒=单值, 分=*/N, 时日周=*)
  const minStep = isStep(m)
  if (isSingle(s) !== null && minStep && isAll(h) && isAll(dom) && isAll(dow)) {
    return `每 ${minStep.step} 分钟执行(第 ${parseInt(s, 10)} 秒)`
  }

  // 模式: 每小时整点 (秒=单值, 分=单值, 时=*, 日周=*)
  const sVal = isSingle(s)
  const mVal = isSingle(m)
  if (sVal !== null && mVal !== null && isAll(h) && isAll(dom) && isAll(dow)) {
    return `每小时第 ${mVal} 分 ${sVal} 秒执行`
  }

  // 模式: 每日 HH:MM:SS (秒分时=单值, 日=*, 周=*)
  const hVal = isSingle(h)
  if (sVal !== null && mVal !== null && hVal !== null && isAll(dom) && isAll(dow)) {
    return `每日 ${padTime(hVal, mVal, sVal)} 执行`
  }

  // 模式: 每周 X HH:MM:SS (秒分时=单值, 日=*, 周=单值)
  const dowVal = isSingle(dow)
  if (sVal !== null && mVal !== null && hVal !== null && isAll(dom) && dowVal !== null) {
    const idx = dowVal === 7 ? 0 : dowVal
    return `每周周${WEEKDAY_LABELS[idx]} ${padTime(hVal, mVal, sVal)} 执行`
  }

  // 模式: 每月 D 日 HH:MM:SS (秒分时日=单值, 周=*)
  const domVal = isSingle(dom)
  if (sVal !== null && mVal !== null && hVal !== null && domVal !== null && isAll(dow)) {
    return `每月 ${domVal} 日 ${padTime(hVal, mVal, sVal)} 执行`
  }

  // 兜底:展示原表达式,提示自定义
  return `自定义表达式 (${cron})`
}

// ============ composeCron: 从可视化字段合成 6 段 cron ============

export type CronVisualMode =
  | 'intervalMinutes' // 每 N 分钟 (n)
  | 'intervalHours' // 每 N 小时 (n + minute)
  | 'daily' // 每日 (hour + minute)
  | 'weekly' // 每周 (weekday + hour + minute)
  | 'monthly' // 每月 (dayOfMonth + hour + minute)

export interface CronVisualFields {
  second?: number // 0-59,默认 0
  minute?: number // 0-59
  hour?: number // 0-23
  dayOfMonth?: number // 1-31
  weekday?: number // 0-6 (0=周日 / 1=周一 ... 7=周日 也接受)
  intervalN?: number // 间隔数 (intervalMinutes / intervalHours 用)
}

export const composeCron = (mode: CronVisualMode, f: CronVisualFields): string => {
  const sec = f.second ?? 0
  const min = f.minute ?? 0
  const hr = f.hour ?? 0
  switch (mode) {
    case 'intervalMinutes': {
      const n = Math.max(1, f.intervalN ?? 5)
      return `${sec} */${n} * * * *`
    }
    case 'intervalHours': {
      const n = Math.max(1, f.intervalN ?? 1)
      return `${sec} ${min} */${n} * * *`
    }
    case 'daily':
      return `${sec} ${min} ${hr} * * *`
    case 'weekly': {
      const w = f.weekday ?? 1
      return `${sec} ${min} ${hr} * * ${w === 7 ? 0 : w}`
    }
    case 'monthly': {
      const d = Math.max(1, f.dayOfMonth ?? 1)
      return `${sec} ${min} ${hr} ${d} * *`
    }
  }
}

// ============ Cron 校验:返回 valid + reason ============

export interface CronValidation {
  valid: boolean
  reason?: string
  description?: string
}

export const validateCron = (expr: string): CronValidation => {
  if (!expr.trim()) {
    return { valid: false, reason: '请输入 Cron 表达式' }
  }
  try {
    parseCron(expr)
    const description = humanizeCron(expr)
    return { valid: true, description }
  } catch (e) {
    return { valid: false, reason: (e as Error).message || '表达式不合法' }
  }
}
