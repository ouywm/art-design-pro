export type ResourceKind = 'image' | 'video' | 'document' | 'archive'

export interface ResourceFolder {
  id: number
  name: string
  count: number
}

export interface ResourceItem {
  id: number
  name: string
  kind: ResourceKind
  folderId: number
  folderName: string
  size: string
  updatedAt: string
  extension: string
  color: string
  description: string
  url?: string
  thumbnailUrl?: string
  dimensions?: string
  duration?: string
}

export interface ResourcePickerConfig {
  title: string
  multiple: boolean
  max: number
  acceptKinds: ResourceKind[]
}
