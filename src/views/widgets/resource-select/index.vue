<template>
  <div class="resource-select-page art-page-view">
    <section class="resource-select-hero art-surface-sm">
      <div class="resource-select-hero__main">
        <div>
          <h1>资源选择器</h1>
          <p>
            复用系统文件中心的目录、搜索、上传和分页能力，适合商品图、详情图、视频素材、附件等业务资源选择场景。
          </p>
        </div>

        <div class="resource-select-hero__stats">
          <div class="art-surface-muted">
            <strong>4</strong>
            <span>选择模式</span>
          </div>
          <div class="art-surface-muted">
            <strong>{{ galleryResources.length }}/8</strong>
            <span>图集上限</span>
          </div>
          <div class="art-surface-muted">
            <strong>{{ commonResources.length }}/6</strong>
            <span>通用资源</span>
          </div>
        </div>
      </div>
    </section>

    <section class="resource-select-grid">
      <section class="resource-select-card art-surface-sm">
        <div class="resource-select-card__head">
          <div>
            <h3>商品主图</h3>
            <p>单选图片资源，确认后生成可访问链接，常用于商品封面、分类图标和品牌 Logo。</p>
          </div>
          <ElButton type="primary" plain @click="coverDialogVisible = true">
            <ArtSvgIcon icon="ri:image-add-line" class="mr-1" />
            选择图片
          </ElButton>
        </div>

        <div class="resource-select-cover-zone">
          <article v-if="coverResource" class="resource-select-cover-card">
            <div class="resource-select-cover-card__image" :style="getThumbStyle(coverResource)">
              <ArtSvgIcon v-if="shouldShowThumbIcon(coverResource)" icon="ri:image-line" />
            </div>
            <div>
              <strong>{{ coverResource.name }}</strong>
              <span>{{ coverResource.dimensions }} · {{ coverResource.size }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="resource-select-card art-surface-sm">
        <div class="resource-select-card__head">
          <div>
            <h3>视频资源</h3>
            <p>固定视频类型，适合商品介绍、活动素材和内容模块的视频引用。</p>
          </div>
          <ElButton type="primary" plain @click="videoDialogVisible = true">
            <ArtSvgIcon icon="ri:video-line" class="mr-1" />
            选择视频
          </ElButton>
        </div>

        <div class="resource-select-video art-surface-muted">
          <div
            class="resource-select-video__icon"
            :class="{ 'is-visual': videoResource && hasThumbImage(videoResource) }"
            :style="videoResource ? getThumbStyle(videoResource) : undefined"
          >
            <ArtSvgIcon icon="ri:video-line" />
          </div>
          <div>
            <strong>{{ videoResource?.name || '暂无视频' }}</strong>
            <span>
              {{
                videoResource
                  ? `${videoResource.duration} · ${videoResource.size}`
                  : '从资源选择器中选择或上传视频'
              }}
            </span>
          </div>
        </div>
      </section>
    </section>

    <section class="resource-select-card art-surface-sm">
      <div class="resource-select-card__head">
        <div>
          <h3>图集多选</h3>
          <p>多选图片并限制数量，适合商品轮播图、详情素材和评价凭证。</p>
        </div>
        <ElButton type="primary" plain @click="galleryDialogVisible = true">
          <ArtSvgIcon icon="ri:gallery-upload-line" class="mr-1" />
          选择图集
        </ElButton>
      </div>

      <div class="resource-select-gallery">
        <article
          v-for="item in galleryResources"
          :key="item.id"
          class="resource-select-gallery__item"
          :style="getThumbStyle(item)"
        >
          <button type="button" @click="removeGalleryResource(item)">
            <ArtSvgIcon icon="ri:close-line" />
          </button>
          <span>{{ item.name }}</span>
        </article>
        <button
          v-if="galleryResources.length < 8"
          type="button"
          class="resource-select-gallery__add"
          @click="galleryDialogVisible = true"
        >
          <span>
            <ArtSvgIcon icon="ri:add-line" />
            <span>添加图片</span>
          </span>
        </button>
      </div>
    </section>

    <section class="resource-select-card art-surface-sm">
      <div class="resource-select-card__head">
        <div>
          <h3>通用资源</h3>
          <p>不限制资源类型，可选择图片、视频、文档、压缩包等文件，适合配置附件和运营素材。</p>
        </div>
        <ElButton type="primary" plain @click="commonDialogVisible = true">
          <ArtSvgIcon icon="ri:file-search-line" class="mr-1" />
          选择资源
        </ElButton>
      </div>

      <div class="resource-select-common">
        <article
          v-for="item in commonResources"
          :key="item.id"
          class="resource-select-common__item art-surface-muted"
        >
          <div
            class="resource-select-common__icon"
            :class="{ 'is-visual': hasThumbImage(item) }"
            :style="getThumbStyle(item)"
          >
            <ArtSvgIcon v-if="shouldShowThumbIcon(item)" :icon="getResourceIcon(item)" />
          </div>
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.extension.toUpperCase() }} · {{ item.size }}</span>
          </div>
          <button type="button" @click="removeCommonResource(item)">
            <ArtSvgIcon icon="ri:close-line" />
          </button>
        </article>
        <div v-if="commonResources.length === 0" class="resource-select-common__empty">
          暂未选择通用资源
        </div>
      </div>
    </section>

    <ResourcePickerDialog
      v-model="coverResources"
      v-model:visible="coverDialogVisible"
      title="选择商品主图"
      :accept-kinds="['image']"
    />
    <ResourcePickerDialog
      v-model="galleryResources"
      v-model:visible="galleryDialogVisible"
      title="选择商品图集"
      multiple
      :max="8"
      :accept-kinds="['image']"
    />
    <ResourcePickerDialog
      v-model="videoResources"
      v-model:visible="videoDialogVisible"
      title="选择视频资源"
      :accept-kinds="['video']"
    />
    <ResourcePickerDialog
      v-model="commonResources"
      v-model:visible="commonDialogVisible"
      title="选择通用资源"
      multiple
      :max="6"
      :accept-kinds="['image', 'video', 'document', 'archive']"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import ResourcePickerDialog from './modules/resource-picker-dialog.vue'
  import { resourceItems } from './mock'
  import type { ResourceItem } from './types'
  import './style.scss'

  defineOptions({ name: 'WidgetsResourceSelect' })

  const coverDialogVisible = ref(false)
  const galleryDialogVisible = ref(false)
  const videoDialogVisible = ref(false)
  const commonDialogVisible = ref(false)

  const coverResources = ref<ResourceItem[]>([])
  const galleryResources = ref<ResourceItem[]>(
    resourceItems.filter((item) => item.kind === 'image').slice(3, 4)
  )
  const videoResources = ref<ResourceItem[]>(
    resourceItems.filter((item) => item.kind === 'video').slice(0, 1)
  )
  const commonResources = ref<ResourceItem[]>([])

  const coverResource = computed(() => coverResources.value[0])
  const videoResource = computed(() => videoResources.value[0])

  function removeGalleryResource(item: ResourceItem) {
    galleryResources.value = galleryResources.value.filter((resource) => resource.id !== item.id)
  }

  function removeCommonResource(item: ResourceItem) {
    commonResources.value = commonResources.value.filter((resource) => resource.id !== item.id)
  }

  function getResourceIcon(item: ResourceItem) {
    if (item.kind === 'image') return 'ri:image-line'
    if (item.kind === 'video') return 'ri:video-line'
    if (item.kind === 'archive') return 'ri:file-zip-line'
    return 'ri:file-text-line'
  }

  function getThumbUrl(item: ResourceItem) {
    return item.thumbnailUrl || item.url
  }

  function hasThumbImage(item: ResourceItem) {
    return Boolean(getThumbUrl(item)) && ['image', 'video'].includes(item.kind)
  }

  function shouldShowThumbIcon(item: ResourceItem) {
    return item.kind !== 'image'
  }

  function getThumbStyle(item: ResourceItem): CSSProperties {
    const thumbUrl = getThumbUrl(item)

    if (thumbUrl && ['image', 'video'].includes(item.kind)) {
      return {
        backgroundImage:
          item.kind === 'video'
            ? `linear-gradient(135deg, rgb(0 0 0 / 24%), rgb(0 0 0 / 38%)), url(${thumbUrl})`
            : `url(${thumbUrl})`
      }
    }

    return {
      background: item.kind === 'image' || item.kind === 'video' ? item.color : undefined
    }
  }
</script>
