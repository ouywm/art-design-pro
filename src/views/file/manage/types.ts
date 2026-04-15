export type UploadMode = 'direct' | 'proxy'

export interface FileFolderTreeNode extends Api.FileUpload.FileFolderTreeVo {
  children: FileFolderTreeNode[]
}

export interface FileSearchFormModel {
  /** 关键字：文件名/显示名/对象 Key */
  keyword?: string
  /** 文件分类 */
  kind?: Api.FileUpload.FileKind
  /** 可见性 */
  visibility?: Api.FileUpload.FileVisibility
  /** 云厂商/提供方 */
  provider?: Api.FileUpload.FileProvider
  /** 状态 */
  status?: Api.FileUpload.FileStatus
}
