export interface ConfigListItem extends Api.Config.ConfigGroupItemVo {
  configGroupId: number
  configGroupName: string
  configGroupCode: string
  updateTime?: string
  updateBy?: string
}

export type ConfigListItemDetail = Api.Config.ConfigDetailVo
export type ConfigValueType = Api.Config.ConfigValueType

export type SearchFormModel = Pick<
  Api.Config.ConfigGroupedQueryParams,
  'configGroupId' | 'valueType' | 'enabled' | 'isSystem'
> & {
  keyword?: string
}

export interface ConfigGroupSection {
  groupId: number
  groupName: string
  groupCode: string
  groupSort: number
  items: ConfigListItem[]
}

export interface ConfigStatsModel {
  total: number
  enabled: number
  builtIn: number
  groupCount: number
  latestUpdate: string
}

export interface LocalPaginationModel {
  page: number
  size: number
  total: number
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
