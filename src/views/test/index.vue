<!-- 测试页面 -->
<template>
  <div class="pb-5 space-y-4">
    <ElCard shadow="never" class="art-card-xs" header="ArtIconPicker · 基础用法">
      <div class="flex items-center gap-4 flex-wrap">
        <ArtIconPicker v-model="icon1" width="260px" @change="handleChange" />
        <span class="text-sm text-g-600">当前选择：{{ icon1 || '（未选）' }}</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="art-card-xs" header="禁用状态 / 预设值">
      <div class="flex items-center gap-4 flex-wrap">
        <ArtIconPicker v-model="icon2" width="260px" disabled />
        <ArtIconPicker v-model="icon3" width="260px" :clearable="false" />
      </div>
    </ElCard>

    <ElCard shadow="never" class="art-card-xs" header="ArtIconPicker · 弹窗模式 (mode=dialog)">
      <div class="flex items-center gap-4 flex-wrap">
        <ArtIconPicker
          v-model="icon5"
          mode="dialog"
          width="260px"
          dialog-title="选择一个系统图标"
          dialog-width="760px"
          :dialog-grid-min-size="56"
          dialog-grid-max-height="420px"
        />
        <span class="text-sm text-g-600">当前选择：{{ icon5 || '（未选）' }}</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="art-card-xs" header="切换图标集（line-md）">
      <div class="flex items-center gap-4 flex-wrap">
        <ArtIconPicker
          v-model="icon4"
          prefix="line-md"
          placeholder="选择 Material Line 图标"
          width="260px"
        />
        <span class="text-sm text-g-600">当前选择：{{ icon4 || '（未选）' }}</span>
      </div>
    </ElCard>

    <ElCard shadow="never" class="art-card-xs" header="表单中使用">
      <ElForm :model="form" label-width="80px" style="max-width: 520px">
        <ElFormItem label="菜单图标">
          <ArtIconPicker v-model="form.icon" />
        </ElFormItem>
        <ElFormItem label="菜单名称">
          <ElInput v-model="form.name" placeholder="请输入菜单名称" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSubmit" v-ripple>提交</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard shadow="never" class="art-card-xs" header="选中效果预览">
      <div class="flex items-center gap-6">
        <ArtSvgIcon v-if="icon1" :icon="icon1" class="text-sm" />
        <ArtSvgIcon v-if="icon1" :icon="icon1" class="text-2xl" />
        <ArtSvgIcon v-if="icon1" :icon="icon1" class="text-4xl text-primary" />
        <ArtSvgIcon v-if="icon1" :icon="icon1" class="text-4xl text-red-500" />
        <span v-if="!icon1" class="text-sm text-g-500">先在上方选择一个图标</span>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import ArtIconPicker from '@/components/core/forms/art-icon-picker/index.vue'

  defineOptions({ name: 'Test' })

  const icon1 = ref('ri:home-line')
  const icon2 = ref('ri:lock-line')
  const icon3 = ref('ri:user-line')
  const icon4 = ref('')
  const icon5 = ref('ri:apps-2-line')

  const form = reactive({
    icon: '',
    name: ''
  })

  function handleChange(value: string) {
    console.log('[ArtIconPicker] change →', value)
  }

  function handleSubmit() {
    ElMessage.success(`已提交：${form.name || '(空)'} / ${form.icon || '(未选图标)'}`)
  }
</script>
