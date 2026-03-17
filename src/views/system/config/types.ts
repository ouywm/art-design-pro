export type ConfigListItem = Api.Config.ConfigVo
export type ConfigListItemDetail = Api.Config.ConfigDetailVo

type SearchSystemParamKeys = keyof Api.Common.CommonSearchParams
export type SearchFormModel = Omit<Api.Config.ConfigSearchParams, SearchSystemParamKeys>

type FormBase = Api.Config.CreateConfigParams & Api.Config.UpdateConfigParams
type FormUndefinedKeys = 'valueType'

export type FormModel = FormBase & {
  [K in FormUndefinedKeys]-?: FormBase[K] | undefined
}
