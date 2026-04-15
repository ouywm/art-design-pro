<template>
  <ElDialog v-model="visible" :title="dialogTitle" width="420px" :close-on-click-modal="false">
    <ElForm ref="formRef" :model="form" label-position="top" @submit.prevent>
      <ElFormItem
        label="目录名称"
        prop="name"
        :rules="[{ required: true, message: '请输入目录名称', trigger: 'blur' }]"
      >
        <ElInput
          v-model="form.name"
          maxlength="120"
          placeholder="例如：品牌主视觉 / 产品截图"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="Slug" prop="slug" :rules="slugRules">
        <ElInput
          v-model="form.slug"
          maxlength="120"
          placeholder="例如：brand-assets / product-screenshots"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem v-if="props.mode === 'create'" label="父级目录" prop="parentId">
        <ElSelect v-model="form.parentId" class="w-full" placeholder="请选择父级目录" clearable>
          <ElOption :value="0" label="全部文件" />
          <ElOption
            v-for="opt in folderOptions"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="可见性" prop="visibility">
        <ElSelect v-model="form.visibility" class="w-full" placeholder="请选择可见性" clearable>
          <ElOption label="私有" value="PRIVATE" />
          <ElOption label="公开" value="PUBLIC" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="排序" prop="sort">
        <ElInput v-model.number="form.sort" type="number" placeholder="例如：10" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false" v-ripple>取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit" v-ripple>
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { fetchCreateFolder, fetchUpdateFolder } from '@/api/file-upload'
  import type { FormInstance } from 'element-plus'
  import type { FileFolderTreeNode } from '../types'

  defineOptions({ name: 'FolderDialog' })

  interface Props {
    mode?: 'create' | 'edit'
    folder?: Partial<Api.FileUpload.FileFolderVo> | null
    treeData?: FileFolderTreeNode[]
    defaultParentId?: number | null
  }

  const props = withDefaults(defineProps<Props>(), {
    mode: 'create',
    folder: null,
    treeData: () => [],
    defaultParentId: null
  })

  const emit = defineEmits<{
    (e: 'success'): void
  }>()

  const visible = defineModel<boolean>({ default: false })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogTitle = computed(() => (props.mode === 'edit' ? '编辑目录' : '新建目录'))

  const slugRules = computed(() => {
    if (props.mode !== 'create') return []
    return [{ required: true, message: '请输入 slug', trigger: 'blur' }]
  })

  type FolderOption = { value: number; label: string }
  const folderOptions = computed<FolderOption[]>(() => {
    const result: FolderOption[] = []

    const walk = (nodes: FileFolderTreeNode[], prefix: string) => {
      for (const n of nodes) {
        result.push({ value: n.id, label: `${prefix}${n.name}` })
        if (n.children.length) walk(n.children, `${prefix}${n.name} / `)
      }
    }

    walk(props.treeData || [], '')
    return result
  })

  const form = reactive<{
    name: string
    slug: string
    parentId: number
    visibility: Api.FileUpload.FileVisibility | null
    sort: number | null
  }>({
    name: '',
    slug: '',
    parentId: 0,
    visibility: 'PRIVATE',
    sort: null
  })

  watch(
    visible,
    (val) => {
      if (val) {
        form.name = props.folder?.name || ''
        form.slug = (props.folder as any)?.slug || ''
        form.parentId =
          props.mode === 'edit'
            ? Number(props.folder?.parentId ?? 0)
            : Number(props.defaultParentId ?? 0)
        form.visibility = (props.folder as any)?.visibility || 'PRIVATE'
        form.sort = (props.folder as any)?.sort ?? null
        nextTick(() => formRef.value?.clearValidate())
      }
    },
    { immediate: true }
  )

  async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      const name = form.name.trim()
      const slug = form.slug.trim()
      const parentId = form.parentId === 0 ? null : form.parentId
      const visibility = form.visibility || null
      const sort = typeof form.sort === 'number' && Number.isFinite(form.sort) ? form.sort : null

      if (props.mode === 'edit' && props.folder?.id) {
        const payload: Api.FileUpload.UpdateFileFolderDto = {}
        if (name) payload.name = name
        if (slug) payload.slug = slug
        if (sort != null) payload.sort = sort
        if (visibility) payload.visibility = visibility

        await fetchUpdateFolder(props.folder.id, payload)
        ElMessage.success('更新成功')
      } else {
        const payload: Api.FileUpload.CreateFileFolderDto = {
          name,
          slug,
          parentId,
          sort,
          visibility
        }

        await fetchCreateFolder(payload)
        ElMessage.success('创建成功')
      }
      emit('success')
      visible.value = false
    } finally {
      submitLoading.value = false
    }
  }
</script>
