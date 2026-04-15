<template>
  <div class="config-value-field">
    <ElSwitch
      v-if="valueType === CONFIG_VALUE_TYPE.BOOLEAN"
      v-model="stringValue"
      active-value="true"
      inactive-value="false"
    />

    <template v-else-if="valueType === CONFIG_VALUE_TYPE.SELECT">
      <ElSelect
        v-model="stringValue"
        filterable
        clearable
        :disabled="selectOptions.length === 0"
        :placeholder="selectPlaceholder"
      >
        <ElOption
          v-for="option in selectOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
      <ElText v-if="!optionDictType" size="small" type="info">请先选择候选字典类型</ElText>
    </template>

    <ElInput
      v-else-if="valueType === CONFIG_VALUE_TYPE.TEXTAREA"
      v-model="stringValue"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
    />

    <ElInput
      v-else-if="valueType === CONFIG_VALUE_TYPE.JSON"
      v-model="stringValue"
      class="monospace-input"
      type="textarea"
      :rows="jsonRows"
      :placeholder="placeholder"
    />

    <ElInput
      v-else-if="valueType === CONFIG_VALUE_TYPE.NUMBER"
      v-model="stringValue"
      type="number"
      :placeholder="placeholder"
    />

    <ElInput
      v-else-if="valueType === CONFIG_VALUE_TYPE.PASSWORD"
      v-model="stringValue"
      show-password
      :placeholder="placeholder"
    />

    <ArtFileUpload
      v-else-if="valueType === CONFIG_VALUE_TYPE.IMAGE"
      v-model="imageFiles"
      accept=".jpg,.jpeg,.png,.gif,.webp"
      :max-size="5 * 1024 * 1024"
      :max-count="1"
      list-type="picture-card"
      tip="支持 .jpg,.jpeg,.png,.gif,.webp 格式，单个文件不超过 5.0 MB，最多 1 个文件"
      @upload-success="handleImageUploadSuccess"
    />

    <ElInput v-else v-model="stringValue" :placeholder="placeholder" />
  </div>
</template>

<script setup lang="ts">
  import ArtFileUpload from '@/components/core/forms/art-file-upload/index.vue'
  import { useDict } from '@/utils/dict'
  import { CONFIG_VALUE_TYPE } from '../constants'
  import type { ConfigValueType } from '../types'

  defineOptions({ name: 'ConfigValueField' })

  interface Props {
    modelValue?: string
    valueType?: ConfigValueType
    optionDictType?: string
    placeholder?: string
    rows?: number
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    valueType: CONFIG_VALUE_TYPE.TEXT,
    optionDictType: '',
    placeholder: '请输入配置值',
    rows: 3
  })

  const emit = defineEmits<Emits>()
  const { getDict } = useDict()
  const imageFiles = ref<Api.FileUpload.FileUploadVo[]>([])

  const stringValue = computed({
    get: () => props.modelValue ?? '',
    set: (value: string) => emit('update:modelValue', value)
  })

  const selectOptions = computed(() => {
    if (!props.optionDictType) {
      return []
    }

    return getDict(props.optionDictType).map((item) => ({
      label: item.label,
      value: item.value
    }))
  })

  const selectPlaceholder = computed(() => {
    if (props.optionDictType) {
      return props.placeholder
    }
    return '请先选择候选字典类型'
  })

  const jsonRows = computed(() => Math.max(props.rows, 5))

  const createImageFile = (url: string): Api.FileUpload.FileUploadVo => ({
    fileId: 0,
    fileNo: '',
    originalName: url.split('/').pop() || 'image',
    size: 0,
    url
  })

  watch(
    stringValue,
    (value) => {
      if (!value) {
        imageFiles.value = []
        return
      }

      if (imageFiles.value.length === 1 && imageFiles.value[0].url === value) {
        return
      }

      imageFiles.value = [createImageFile(value)]
    },
    { immediate: true }
  )

  const handleImageUploadSuccess = (file: Api.FileUpload.FileUploadVo) => {
    imageFiles.value = [file]
    stringValue.value = file.url
  }

  watch(imageFiles, (files) => {
    if (files.length === 0 && stringValue.value) {
      stringValue.value = ''
    }
  })
</script>

<style scoped lang="scss">
  .config-value-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;

    .monospace-input {
      :deep(textarea) {
        font-family: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
      }
    }

    :deep(.art-file-upload) {
      width: 100%;
    }

    :deep(.el-upload--picture-card),
    :deep(.el-upload-list--picture-card .el-upload-list__item) {
      width: 148px;
      height: 148px;
    }
  }
</style>
