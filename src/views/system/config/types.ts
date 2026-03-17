export type ConfigListItem = Api.Config.ConfigVo
export type ConfigListItemDetail = Api.Config.ConfigDetailVo

export type SearchFormModel = Api.Config.ConfigSearchFilters

type FormBase = Api.Config.CreateConfigParams & Api.Config.UpdateConfigParams
type FormUndefinedKeys = 'valueType'

export type FormModel = FormBase & {
  [K in FormUndefinedKeys]-?: FormBase[K] | undefined
}
