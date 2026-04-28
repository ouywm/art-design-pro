<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="820px"
    align-center
    destroy-on-close
  >
    <ElAlert
      type="info"
      :closable="false"
      show-icon
      class="mb-4"
      :title="
        mode === 'create'
          ? '为 OpenAI 渠道创建 OAuth 托管账号'
          : '为现有 OAuth 账号重新绑定 OpenAI 授权'
      "
    />

    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <ElRow :gutter="16">
        <ElCol v-if="mode === 'create'" :span="12">
          <ElFormItem label="所属渠道" prop="channelId">
            <ElSelect v-model="formData.channelId" filterable placeholder="请选择 OpenAI 渠道">
              <ElOption
                v-for="item in openAiChannelOptions"
                :key="item.value"
                :label="item.label + (item.status === 1 ? '' : '（已不可用）')"
                :value="item.value"
                :disabled="item.status !== 1"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol v-else :span="12">
          <ElFormItem label="所属渠道">
            <ElInput :model-value="selectedChannelLabel" readonly />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="账号名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入账号名称" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="mode === 'rebind'" :span="12">
          <ElFormItem label="账号 ID">
            <ElInput :model-value="`${formData.accountId || '-'}`" readonly />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="测速模型" prop="testModel">
            <ElInput v-model="formData.testModel" placeholder="可选，例如 gpt-4.1-mini" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="回调地址" prop="redirectUri">
        <ElInput v-model="formData.redirectUri" placeholder="请输入 OpenAI OAuth 回调地址" />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="可选，写入渠道账号备注"
        />
      </ElFormItem>

      <ElDivider content-position="left">授权会话</ElDivider>

      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="Session ID" prop="sessionId">
            <ElInput
              v-model="formData.sessionId"
              readonly
              placeholder="点击生成授权链接后自动填充"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="授权链接">
            <ElSpace wrap>
              <ElButton
                type="primary"
                plain
                :loading="generateLoading"
                @click="handleGenerateAuthUrl"
              >
                生成授权链接
              </ElButton>
              <ElButton :disabled="!formData.authUrl" @click="handleOpenAuthPage">
                前往授权
              </ElButton>
              <ElButton :disabled="!formData.authUrl" @click="handleCopyAuthUrl">复制链接</ElButton>
            </ElSpace>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem v-if="formData.authUrl" label="授权地址">
        <ElInput :model-value="formData.authUrl" type="textarea" :rows="3" readonly />
      </ElFormItem>

      <ElAlert
        v-if="callbackMessage"
        :type="callbackAlertType"
        :closable="false"
        show-icon
        class="mb-4"
        :title="callbackMessage"
      />

      <ElDivider content-position="left">授权回填</ElDivider>

      <ElFormItem label="授权码" prop="code">
        <ElInput
          v-model="formData.code"
          type="textarea"
          :rows="3"
          placeholder="完成 OpenAI 授权后，回跳参数中的 code 会自动写入这里，也支持手动粘贴"
        />
      </ElFormItem>

      <ElFormItem label="State" prop="state">
        <ElInput
          v-model="formData.state"
          placeholder="完成 OpenAI 授权后自动回填，也支持手动粘贴"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="exchangeLoading"
          :disabled="!formData.sessionId"
          @click="handleExchange"
        >
          {{ mode === 'create' ? '完成创建' : '完成重新绑定' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    fetchExchangeOpenAiOAuthCode,
    fetchGenerateOpenAiOAuthAuthUrl
  } from '@/api/ai-openai-oauth'
  import {
    buildDefaultOpenAiOAuthRedirectUri,
    buildOpenAiOAuthPendingPayload,
    clearOpenAiOAuthPendingPayload,
    readOpenAiOAuthPendingPayload,
    saveOpenAiOAuthPendingPayload
  } from '../oauth'
  import type {
    ChannelAccountListItem,
    ChannelOption,
    OpenAiOAuthCallbackParams,
    OpenAiOAuthDialogMode,
    OpenAiOAuthFormModel,
    OpenAiOAuthPendingPayload
  } from '../types'

  interface Props {
    visible: boolean
    mode: OpenAiOAuthDialogMode
    channelOptions: ChannelOption[]
    accountData?: Partial<ChannelAccountListItem>
    pendingPayload?: OpenAiOAuthPendingPayload
    callbackParams?: OpenAiOAuthCallbackParams
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', mode: OpenAiOAuthDialogMode): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const generateLoading = ref(false)
  const exchangeLoading = ref(false)
  const callbackMessage = ref('')
  const callbackAlertType = ref<'success' | 'warning'>('success')

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const mode = computed(() => props.mode)
  const openAiChannelOptions = computed(() => props.channelOptions)
  const dialogTitle = computed(() =>
    mode.value === 'create' ? 'OpenAI OAuth 新增账号' : 'OpenAI OAuth 重新绑定'
  )

  const createDefaultFormData = (): OpenAiOAuthFormModel => ({
    channelId: undefined,
    accountId: undefined,
    name: '',
    remark: '',
    testModel: '',
    redirectUri: buildDefaultOpenAiOAuthRedirectUri(),
    sessionId: '',
    authUrl: '',
    code: '',
    state: ''
  })

  const formData = reactive<OpenAiOAuthFormModel>(createDefaultFormData())

  const rules: FormRules<OpenAiOAuthFormModel> = {
    channelId: [{ required: true, message: '请选择 OpenAI 渠道', trigger: 'change' }],
    name: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
    redirectUri: [{ required: true, message: '请输入回调地址', trigger: 'blur' }],
    sessionId: [{ required: true, message: '请先生成授权链接', trigger: 'change' }],
    code: [{ required: true, message: '请输入授权码', trigger: 'blur' }],
    state: [{ required: true, message: '请输入 state', trigger: 'blur' }]
  }

  const selectedChannelLabel = computed(() => {
    const channelId = formData.channelId ?? props.accountData?.channelId
    if (!channelId) return '-'
    return props.channelOptions.find((item) => item.value === channelId)?.label ?? `#${channelId}`
  })

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
    callbackMessage.value = ''
    callbackAlertType.value = 'success'
  }

  const applyPendingPayload = (pending?: OpenAiOAuthPendingPayload) => {
    if (!pending) return

    Object.assign(formData, {
      channelId: pending.channelId,
      accountId: pending.accountId,
      name: pending.name,
      remark: pending.remark || '',
      testModel: pending.testModel || '',
      redirectUri: pending.redirectUri || buildDefaultOpenAiOAuthRedirectUri(),
      sessionId: pending.sessionId || '',
      authUrl: pending.authUrl || '',
      code: pending.code || '',
      state: pending.state || ''
    })
  }

  const initFormData = () => {
    resetFormData()

    if (mode.value === 'rebind') {
      Object.assign(formData, {
        channelId: props.accountData?.channelId,
        accountId: props.accountData?.id,
        name: props.accountData?.name || '',
        remark: props.accountData?.remark || '',
        testModel: props.accountData?.testModel || ''
      })
    }

    applyPendingPayload(props.pendingPayload)

    if (props.callbackParams?.error) {
      callbackMessage.value =
        props.callbackParams.errorDescription ||
        props.callbackParams.error ||
        'OpenAI OAuth 授权失败'
      callbackAlertType.value = 'warning'
      return
    }

    if (props.callbackParams?.code || props.callbackParams?.state) {
      formData.code = props.callbackParams.code || formData.code
      formData.state = props.callbackParams.state || formData.state
      callbackMessage.value = '已从当前回跳地址恢复 code/state，可直接完成绑定。'
      callbackAlertType.value = 'success'
    }
  }

  const validateFields = async (fields: Array<keyof OpenAiOAuthFormModel>) => {
    if (!formRef.value) return
    for (const field of fields) {
      await formRef.value.validateField(field)
    }
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined

  const persistPendingPayload = (override?: Partial<OpenAiOAuthPendingPayload>) => {
    saveOpenAiOAuthPendingPayload(
      buildOpenAiOAuthPendingPayload(mode.value, {
        sessionId: formData.sessionId,
        redirectUri: formData.redirectUri.trim(),
        authUrl: formData.authUrl || undefined,
        channelId: formData.channelId,
        accountId: mode.value === 'rebind' ? formData.accountId : undefined,
        name: formData.name.trim(),
        remark: normalizeOptionalString(formData.remark),
        testModel: normalizeOptionalString(formData.testModel),
        code: normalizeOptionalString(formData.code),
        state: normalizeOptionalString(formData.state),
        ...override
      })
    )
  }

  const handleGenerateAuthUrl = async () => {
    try {
      await validateFields(
        mode.value === 'create' ? ['channelId', 'name', 'redirectUri'] : ['name', 'redirectUri']
      )
    } catch {
      return
    }

    generateLoading.value = true
    try {
      const response = await fetchGenerateOpenAiOAuthAuthUrl({
        redirectUri: formData.redirectUri.trim()
      })
      formData.sessionId = response.sessionId
      formData.authUrl = response.authUrl
      persistPendingPayload({
        sessionId: response.sessionId,
        authUrl: response.authUrl,
        code: undefined,
        state: undefined
      })
      ElMessage.success('授权链接已生成')
    } finally {
      generateLoading.value = false
    }
  }

  const handleCopyAuthUrl = async () => {
    if (!formData.authUrl) return

    try {
      await navigator.clipboard.writeText(formData.authUrl)
      ElMessage.success('授权链接已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  const handleOpenAuthPage = () => {
    if (!formData.authUrl) return
    persistPendingPayload()
    window.location.assign(formData.authUrl)
  }

  const handleExchange = async () => {
    try {
      await validateFields(
        mode.value === 'create'
          ? ['channelId', 'name', 'redirectUri', 'sessionId', 'code', 'state']
          : ['name', 'redirectUri', 'sessionId', 'code', 'state']
      )
    } catch {
      return
    }

    exchangeLoading.value = true
    try {
      const response = await fetchExchangeOpenAiOAuthCode({
        sessionId: formData.sessionId.trim(),
        code: formData.code.trim(),
        state: formData.state.trim(),
        channelId: mode.value === 'create' ? formData.channelId : undefined,
        accountId: mode.value === 'rebind' ? formData.accountId : undefined,
        name: formData.name.trim(),
        remark: normalizeOptionalString(formData.remark),
        testModel: normalizeOptionalString(formData.testModel)
      })

      clearOpenAiOAuthPendingPayload()
      ElMessage.success(
        response.created ? 'OpenAI OAuth 账号创建成功' : 'OpenAI OAuth 账号重新绑定成功'
      )
      dialogVisible.value = false
      emit('submit', mode.value)
    } finally {
      exchangeLoading.value = false
    }
  }

  watch(
    () => [
      props.visible,
      props.mode,
      props.accountData?.id,
      props.pendingPayload?.sessionId,
      props.callbackParams?.code,
      props.callbackParams?.state
    ],
    async ([visible]) => {
      if (!visible) return
      initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        callbackMessage.value = ''
      }
    }
  )

  onMounted(() => {
    if (!props.pendingPayload) {
      applyPendingPayload(readOpenAiOAuthPendingPayload())
    }
  })
</script>
