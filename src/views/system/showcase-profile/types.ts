export type ShowcaseProfileListItem = Api.ShowcaseProfile.ShowcaseProfileVo
export type ShowcaseProfileListItemDetail = Api.ShowcaseProfile.ShowcaseProfileDetailVo

type SearchSystemParamKeys = keyof Api.Common.CommonSearchParams
type SearchRangeParamKeys =
  | 'createdAtStart'
  | 'createdAtEnd'
  | 'launchAtStart'
  | 'launchAtEnd'
  | 'publishDateStart'
  | 'publishDateEnd'
  | 'updatedAtStart'
  | 'updatedAtEnd'

export type SearchFormModel = Omit<
  Api.ShowcaseProfile.ShowcaseProfileSearchParams,
  SearchSystemParamKeys | SearchRangeParamKeys
> & {
  createdAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['createdAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['createdAtEnd']
  ]
  launchAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['launchAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['launchAtEnd']
  ]
  publishDateRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['publishDateStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['publishDateEnd']
  ]
  updatedAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['updatedAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchParams['updatedAtEnd']
  ]
}

type FormBase = Api.ShowcaseProfile.CreateShowcaseProfileParams &
  Api.ShowcaseProfile.UpdateShowcaseProfileParams
type FormUndefinedKeys =
  | 'contactGender'
  | 'status'
  | 'priority'
  | 'publishDate'
  | 'launchAt'
  | 'serviceTime'

export type FormModel = FormBase & {
  [K in FormUndefinedKeys]-?: FormBase[K] | undefined
}
