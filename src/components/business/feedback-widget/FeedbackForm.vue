<template>
  <ElForm ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ElFormItem label="反馈类型" prop="type" class="mb-0">
        <ElSelect v-model="form.type" class="w-full" placeholder="请选择反馈类型">
          <ElOption
            v-for="item in feedbackTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="紧急程度" prop="urgency" class="mb-0">
        <ElSelect v-model="form.urgency" class="w-full" placeholder="请选择紧急程度">
          <ElOption
            v-for="item in urgencyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
    </div>

    <ElFormItem label="问题标题" prop="title" class="mt-4 mb-0">
      <ElInput
        v-model.trim="form.title"
        maxlength="150"
        placeholder="一句话描述问题或建议"
        clearable
      />
    </ElFormItem>

    <ElFormItem label="详细描述" prop="description" class="mt-4 mb-0">
      <ElInput
        v-model.trim="form.description"
        type="textarea"
        :rows="4"
        maxlength="5000"
        show-word-limit
        resize="none"
        placeholder="请尽量写清楚触发步骤、现象、影响范围，方便我们快速复现和判断优先级"
      />
    </ElFormItem>

    <ElFormItem label="你期望它如何表现" prop="expected" class="mt-4 mb-0">
      <ElInput
        v-model.trim="form.expected"
        type="textarea"
        :rows="3"
        maxlength="1000"
        show-word-limit
        resize="none"
        placeholder="可选，写下你觉得更合理的结果或希望新增的能力"
      />
    </ElFormItem>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ElFormItem label="联系人" prop="contactName" class="mb-0">
        <ElInput
          v-model.trim="form.contactName"
          maxlength="50"
          placeholder="姓名 / 昵称"
          clearable
        />
      </ElFormItem>

      <ElFormItem label="联系方式" prop="contact" class="mb-0">
        <ElInput
          v-model.trim="form.contact"
          maxlength="100"
          placeholder="手机号 / 微信 / 邮箱"
          clearable
        />
      </ElFormItem>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ElFormItem label="发生频率" prop="frequency" class="mb-0">
        <ElSelect v-model="form.frequency" class="w-full" clearable placeholder="请选择发生频率">
          <ElOption
            v-for="item in frequencyOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="影响范围" prop="impact" class="mb-0">
        <ElSelect v-model="form.impact" class="w-full" clearable placeholder="请选择影响范围">
          <ElOption
            v-for="item in impactOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
    </div>

    <FeedbackContext :context="context" />
  </ElForm>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import FeedbackContext from './FeedbackContext.vue'
  import type {
    FeedbackContext as FeedbackContextData,
    FeedbackFormModel,
    FeedbackPayload
  } from './types'

  const props = defineProps<{
    context: FeedbackContextData
  }>()

  const emit = defineEmits<{
    (e: 'submit', payload: FeedbackPayload): void
  }>()

  const createDefaultForm = (): FeedbackFormModel => ({
    type: 'feature',
    urgency: 'medium',
    title: '',
    description: '',
    expected: '',
    contactName: '',
    contact: '',
    frequency: '',
    impact: ''
  })

  const feedbackTypeOptions = [
    { label: '功能建议', value: 'feature' },
    { label: 'Bug 反馈', value: 'bug' },
    { label: '体验问题', value: 'experience' },
    { label: '其他', value: 'other' }
  ] as const

  const urgencyOptions = [
    { label: '低', value: 'low' },
    { label: '中', value: 'medium' },
    { label: '高', value: 'high' }
  ] as const

  const frequencyOptions = [
    { label: '仅出现一次', value: 'once' },
    { label: '偶尔出现', value: 'sometimes' },
    { label: '每次都会出现', value: 'always' }
  ] as const

  const impactOptions = [
    { label: '只影响我', value: 'personal' },
    { label: '影响团队协作', value: 'team' },
    { label: '影响核心业务', value: 'business' }
  ] as const

  const formRef = ref<FormInstance>()
  const form = reactive<FeedbackFormModel>(createDefaultForm())

  const rules: FormRules<FeedbackFormModel> = {
    type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
    urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
    title: [
      { required: true, message: '请输入问题标题', trigger: 'blur' },
      { min: 2, max: 150, message: '长度在 2 到 150 个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入详细描述', trigger: 'blur' },
      { min: 5, max: 5000, message: '长度在 5 到 5000 个字符', trigger: 'blur' }
    ],
    expected: [{ max: 1000, message: '最多输入 1000 个字符', trigger: 'blur' }],
    contactName: [{ max: 50, message: '最多输入 50 个字符', trigger: 'blur' }],
    contact: [{ max: 100, message: '最多输入 100 个字符', trigger: 'blur' }]
  }

  const reset = async () => {
    Object.assign(form, createDefaultForm())
    await nextTick()
    formRef.value?.clearValidate()
  }

  const submit = async () => {
    if (!formRef.value) return false

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return false

    emit('submit', {
      ...form,
      context: props.context,
      createdAt: new Date().toISOString()
    })
    return true
  }

  defineExpose({
    reset,
    submit
  })
</script>
