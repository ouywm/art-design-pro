import type { FormModel } from './types'

const trimToUndefined = (value: string) => {
  const trimmed = value.trim()
  return trimmed || undefined
}

export const createDefaultFormData = (): FormModel => ({
  appName: '',
  namespace: 'xxl',
  key: '',
  description: '',
  scheduleType: 'CRON',
  cronValue: '',
  delaySecond: undefined,
  intervalSecond: undefined,
  runMode: 'BEAN',
  handleName: '',
  triggerParamText: '',
  routerStrategy: 'FIRST',
  pastDueStrategy: 'DEFAULT',
  blockingStrategy: 'SERIAL_EXECUTION',
  timeoutSecond: 30,
  tryTimes: 0,
  retryInterval: 0,
  enable: true
})

const buildBasePayload = (form: FormModel): Api.Scheduler.CreateJobPayload => ({
  appName: form.appName.trim(),
  namespace: form.namespace.trim(),
  key: trimToUndefined(form.key),
  description: trimToUndefined(form.description),
  handleName: trimToUndefined(form.handleName),
  scheduleType: form.scheduleType,
  cronValue: form.scheduleType === 'CRON' ? trimToUndefined(form.cronValue) : undefined,
  delaySecond: form.scheduleType === 'DELAY' ? form.delaySecond : undefined,
  intervalSecond: form.scheduleType === 'INTERVAL' ? form.intervalSecond : undefined,
  runMode: form.runMode,
  triggerParam: trimToUndefined(form.triggerParamText),
  routerStrategy: form.routerStrategy,
  pastDueStrategy: form.pastDueStrategy,
  blockingStrategy: form.blockingStrategy,
  timeoutSecond: form.timeoutSecond,
  tryTimes: form.tryTimes,
  retryInterval: form.retryInterval,
  enable: form.enable
})

export const buildCreateJobPayload = (form: FormModel): Api.Scheduler.CreateJobPayload =>
  buildBasePayload(form)

export const buildUpdateJobPayload = (form: FormModel): Api.Scheduler.UpdateJobPayload =>
  buildBasePayload(form)
