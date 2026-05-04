import request from '@/utils/http'

// Rhai 脚本试运行(不写 DB)
// POST /api/scheduler/script/dryrun
export function fetchScriptDryrun(params: Api.Scheduler.ScriptDryrunParams) {
  return request.post<Api.Scheduler.ScriptDryrunResult>({
    url: '/api/scheduler/script/dryrun',
    params
  })
}
