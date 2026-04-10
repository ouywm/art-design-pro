export type GuardrailConfigItem = Api.AiGuardrail.GuardrailConfigVo
export type GuardrailRuleItem = Api.AiGuardrail.GuardrailRuleVo
export type GuardrailViolationItem = Api.AiGuardrail.GuardrailViolationVo
export type PromptProtectionRuleItem = Api.AiGuardrail.PromptProtectionRuleVo
export type GuardrailMetricDailyItem = Api.AiGuardrail.GuardrailMetricDailyVo
export type GuardrailRuleSeverity = Api.AiGuardrail.GuardrailRuleSeverity
export type PromptProtectionRuleStatus = Api.AiGuardrail.PromptProtectionRuleStatus

export interface GuardrailConfigFormModel {
  scopeType: string
  organizationId: number | undefined
  projectId: number | undefined
  enabled: boolean
  mode: string
  systemRulesText: string
  allowedFileTypesText: string
  maxFileSizeMb: number | undefined
  piiAction: string
  secretAction: string
  metadataText: string
  remark: string
}

export type GuardrailRuleSearchFormModel = Api.AiGuardrail.GuardrailRuleSearchFilters

export type GuardrailViolationSearchFormModel = Omit<
  Api.AiGuardrail.GuardrailViolationSearchFilters,
  'createTimeStart' | 'createTimeEnd'
> & {
  createTimeRange?: [string, string]
}
