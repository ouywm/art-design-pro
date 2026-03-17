export type ShowcaseProfileListItem = Api.ShowcaseProfile.ShowcaseProfileVo
export type ShowcaseProfileListItemDetail = Api.ShowcaseProfile.ShowcaseProfileDetailVo

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
  Api.ShowcaseProfile.ShowcaseProfileSearchFilters,
  SearchRangeParamKeys
> & {
  createdAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['createdAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['createdAtEnd']
  ]
  launchAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['launchAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['launchAtEnd']
  ]
  publishDateRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['publishDateStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['publishDateEnd']
  ]
  updatedAtRange?: [
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['updatedAtStart'],
    Api.ShowcaseProfile.ShowcaseProfileSearchFilters['updatedAtEnd']
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
