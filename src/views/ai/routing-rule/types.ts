export type RoutingRuleListItem = Api.AiManage.RoutingRuleVo
export type RoutingRuleDetailVo = Api.AiManage.RoutingRuleVo

export type SearchFormModel = Pick<
  Api.AiManage.RoutingRuleQueryParams,
  'organizationId' | 'projectId' | 'status' | 'ruleCode' | 'keyword'
>

export interface FormModel {
  organizationId: number | undefined
  projectId: number | undefined
  ruleCode: string
  ruleName: string
  priority: number | undefined
  matchType: string
  matchConditionsText: string
  routeStrategy: string
  fallbackStrategy: string
  status: Api.AiManage.RoutingRuleStatus | undefined
  startTime: string
  endTime: string
  metadataText: string
  remark: string
}
