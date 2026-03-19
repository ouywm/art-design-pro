export interface ConfigListItem extends Api.Config.ConfigGroupItemVo {
  configGroupId: number
  configGroupName: string
  configGroupCode: string
}

export type ConfigListItemDetail = Api.Config.ConfigDetailVo
export type ConfigValueType = Api.Config.ConfigValueType

export type SearchFormModel = Pick<
  Api.Config.ConfigGroupedQueryParams,
  | 'configName'
  | 'configKey'
  | 'configGroupId'
  | 'valueType'
  | 'optionDictType'
  | 'enabled'
  | 'isSystem'
>

export interface ConfigGroupSection {
  groupId: number
  groupName: string
  groupCode: string
  groupSort: number
  items: ConfigListItem[]
}

export interface FormModel {
  configName: string
  configKey: string
  configValue: string
  defaultValue: string
  valueType: ConfigValueType
  configGroupId: number | undefined
  optionDictType: string
  configSort: number | undefined
  enabled: boolean
  isSystem: boolean
  remark: string
}

export interface ConfigGroupFormModel {
  groupName: string
  groupCode: string
  groupSort: number | undefined
  enabled: boolean
  isSystem: boolean
  remark: string
}
