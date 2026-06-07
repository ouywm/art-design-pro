import type { ResourceFolder, ResourceItem, ResourceKind } from './types'

export const resourceFolders: ResourceFolder[] = [
  { id: 1, name: '商品素材', count: 18 },
  { id: 2, name: '详情装修', count: 12 },
  { id: 3, name: '活动素材', count: 10 },
  { id: 4, name: '视频资源', count: 8 },
  { id: 5, name: '运营附件', count: 14 }
]

const folderNameMap = new Map(resourceFolders.map((folder) => [folder.id, folder.name]))

const palette = [
  'linear-gradient(135deg, #5b8def, #7ed6df)',
  'linear-gradient(135deg, #f0932b, #eb4d4b)',
  'linear-gradient(135deg, #6ab04c, #badc58)',
  'linear-gradient(135deg, #686de0, #be2edd)',
  'linear-gradient(135deg, #22a6b3, #30336b)',
  'linear-gradient(135deg, #ff7979, #f9ca24)'
]

const imageUrls = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80'
]

const videoThumbnailUrls = [
  'https://images.unsplash.com/photo-1536240478700-b869070f9279b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=900&q=80'
]

let imageUrlIndex = 0
let videoUrlIndex = 0

function createResource(
  id: number,
  name: string,
  kind: ResourceKind,
  folderId: number,
  extension: string,
  description: string
): ResourceItem {
  const url = kind === 'image' ? imageUrls[imageUrlIndex++ % imageUrls.length] : undefined
  const thumbnailUrl =
    kind === 'video' ? videoThumbnailUrls[videoUrlIndex++ % videoThumbnailUrls.length] : url

  return {
    id,
    name,
    kind,
    folderId,
    folderName: folderNameMap.get(folderId) || '未归类',
    size:
      kind === 'video'
        ? `${28 + id} MB`
        : kind === 'image'
          ? `${320 + id * 12} KB`
          : `${2 + id} MB`,
    updatedAt: `2026-06-${String((id % 20) + 1).padStart(2, '0')} 14:${String(id % 6)}0`,
    extension,
    color: palette[id % palette.length],
    description,
    url,
    thumbnailUrl,
    dimensions: kind === 'image' ? `${1200 + id * 4} x ${800 + id * 2}` : undefined,
    duration: kind === 'video' ? `00:${String(18 + id).padStart(2, '0')}` : undefined
  }
}

export const resourceItems: ResourceItem[] = [
  createResource(1, '洛阳装备主图 A', 'image', 1, 'jpg', '商品主图'),
  createResource(2, '泉州即时零售封面', 'image', 1, 'png', '商品封面'),
  createResource(3, '夏季活动 Banner', 'image', 3, 'webp', '活动素材'),
  createResource(4, '详情页场景图 01', 'image', 2, 'jpg', '详情素材'),
  createResource(5, '详情页场景图 02', 'image', 2, 'jpg', '详情素材'),
  createResource(6, '品牌 Logo 深色版', 'image', 1, 'png', '品牌资源'),
  createResource(7, '商品轮播图 01', 'image', 1, 'webp', '轮播图'),
  createResource(8, '商品轮播图 02', 'image', 1, 'webp', '轮播图'),
  createResource(9, '商品轮播图 03', 'image', 1, 'webp', '轮播图'),
  createResource(10, '活动会场入口图', 'image', 3, 'png', '活动资源'),
  createResource(11, '商品介绍短视频', 'video', 4, 'mp4', '商品介绍'),
  createResource(12, '直播切片素材', 'video', 4, 'mp4', '直播素材'),
  createResource(13, '新品预热视频', 'video', 4, 'mov', '营销视频'),
  createResource(14, '活动落地页规范', 'document', 5, 'pdf', '运营文档'),
  createResource(15, '商品参数表', 'document', 5, 'xlsx', '配置附件'),
  createResource(16, '商详素材压缩包', 'archive', 5, 'zip', '素材归档'),
  createResource(17, '评价凭证 01', 'image', 2, 'jpg', '评价凭证'),
  createResource(18, '评价凭证 02', 'image', 2, 'jpg', '评价凭证'),
  createResource(19, '渠道投放素材包', 'archive', 3, 'zip', '投放资源'),
  createResource(20, '售后说明文档', 'document', 5, 'docx', '售后附件')
]

export const resourceKindOptions: Array<{ label: string; value: ResourceKind }> = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '文档', value: 'document' },
  { label: '压缩包', value: 'archive' }
]
