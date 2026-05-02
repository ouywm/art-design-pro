<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增渠道账号' : '编辑渠道账号'"
    width="920px"
    align-center
    destroy-on-close
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
      v-loading="detailLoading"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="所属渠道" prop="channelId">
            <ElSelect
              v-model="formData.channelId"
              :disabled="dialogType === 'edit'"
              filterable
              placeholder="请选择渠道"
            >
              <ElOption
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label + (item.status === 1 ? '' : '（已不可用）')"
                :value="item.value"
                :disabled="item.status !== 1 && dialogType === 'add'"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="账号名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入账号名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="凭证类型" prop="credentialType">
            <ElSelect
              v-model="formData.credentialType"
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入凭证类型"
            >
              <ElOption
                v-for="item in COMMON_CREDENTIAL_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="账号状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in CHANNEL_ACCOUNT_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="调度开关" prop="schedulable">
            <ElSwitch v-model="formData.schedulable" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密钥引用" prop="secretRef">
            <ElInput
              v-model="formData.secretRef"
              :disabled="isOpenAiOAuthFlow"
              :placeholder="
                isOpenAiOAuthFlow
                  ? 'OpenAI OAuth 账号不使用密钥引用'
                  : '可选，例如 vault/openai/prod'
              "
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="优先级" prop="priority">
            <ElInputNumber v-model="formData.priority" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="权重" prop="weight">
            <ElInputNumber
              v-model="formData.weight"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="倍率" prop="rateMultiplier">
            <ElInputNumber
              v-model="formData.rateMultiplier"
              :min="0"
              :step="0.1"
              :precision="2"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="并发上限" prop="concurrencyLimit">
            <ElInputNumber v-model="formData.concurrencyLimit" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="额度上限" prop="quotaLimit">
            <ElInputNumber
              v-model="formData.quotaLimit"
              :min="0"
              :step="100"
              :precision="2"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="测速模型" prop="testModel">
            <ElSelect
              v-model="formData.testModel"
              filterable
              allow-create
              default-first-option
              clearable
              placeholder="可选，优先选择渠道支持模型"
            >
              <ElOption
                v-for="item in availableTestModelOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <template v-if="isOpenAiOAuthFlow">
        <ElAlert
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="
            dialogType === 'add'
              ? '当前将通过 OpenAI OAuth 创建托管账号，不再手填 credentials JSON。'
              : '当前账号为 OpenAI OAuth 托管账号，可在这里重新绑定授权或刷新令牌。'
          "
        />

        <ElDivider content-position="left">OpenAI OAuth</ElDivider>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="回调地址" prop="redirectUri">
              <ElInput v-model="formData.redirectUri" placeholder="请输入 OpenAI OAuth 回调地址" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="Session ID" prop="oauthSessionId">
              <ElInput
                v-model="formData.oauthSessionId"
                readonly
                placeholder="点击生成授权链接后自动填充"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="授权操作">
          <ElSpace wrap>
            <ElButton
              type="primary"
              plain
              :loading="oauthGenerateLoading"
              @click="handleGenerateOAuthAuthUrl"
            >
              生成授权链接
            </ElButton>
            <ElButton :disabled="!formData.oauthAuthUrl" @click="handleOpenOAuthPage">
              前往授权
            </ElButton>
            <ElButton :disabled="!formData.oauthAuthUrl" @click="handleCopyOAuthAuthUrl">
              复制链接
            </ElButton>
            <ElButton
              v-if="canRefreshOAuthToken"
              :loading="oauthRefreshLoading"
              @click="handleRefreshOAuthToken"
            >
              刷新 OAuth
            </ElButton>
          </ElSpace>
        </ElFormItem>

        <ElFormItem v-if="formData.oauthAuthUrl" label="授权地址">
          <ElInput :model-value="formData.oauthAuthUrl" type="textarea" :rows="3" readonly />
        </ElFormItem>

        <ElAlert
          v-if="oauthCallbackMessage"
          class="mb-4"
          :type="oauthCallbackAlertType"
          :closable="false"
          show-icon
          :title="oauthCallbackMessage"
        />

        <ElFormItem label="授权码" prop="oauthCode">
          <ElInput
            v-model="formData.oauthCode"
            type="textarea"
            :rows="3"
            placeholder="完成 OpenAI 授权后，回跳参数中的 code 会自动写入这里，也支持手动粘贴"
          />
        </ElFormItem>

        <ElFormItem label="State" prop="oauthState">
          <ElInput
            v-model="formData.oauthState"
            placeholder="完成 OpenAI 授权后自动回填，也支持手动粘贴"
          />
        </ElFormItem>

        <ElFormItem v-if="oauthCredentialsPreviewText" label="当前凭证">
          <ElInput :model-value="oauthCredentialsPreviewText" type="textarea" :rows="4" readonly />
        </ElFormItem>
      </template>

      <ElFormItem v-else label="凭证配置" prop="credentialsText">
        <ElInput
          v-model="formData.credentialsText"
          type="textarea"
          :rows="5"
          :placeholder="credentialPlaceholder"
        />
      </ElFormItem>

      <ElFormItem label="扩展配置" prop="extraText">
        <ElInput
          v-model="formData.extraText"
          type="textarea"
          :rows="4"
          :placeholder="isOpenAiOAuthFlow ? oauthExtraPlaceholder : defaultExtraPlaceholder"
        />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>

      <ElAlert
        v-if="runtimeState.lastErrorMessage"
        class="mb-4"
        type="warning"
        :closable="false"
        show-icon
        :title="runtimeState.lastErrorMessage"
      />

      <ElFormItem v-if="runtimeState.disabledApiKeysText" label="禁用 Keys">
        <ElInput
          :model-value="runtimeState.disabledApiKeysText"
          type="textarea"
          :rows="3"
          readonly
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton
          v-if="showGenericSubmitButton"
          :type="isOpenAiOAuthFlow && dialogType === 'edit' ? 'default' : 'primary'"
          :loading="submitLoading"
          @click="handleGenericSubmit"
        >
          {{ genericSubmitLabel }}
        </ElButton>
        <ElButton
          v-if="isOpenAiOAuthFlow"
          type="primary"
          :loading="oauthSubmitLoading"
          @click="handleOAuthSubmit"
        >
          {{ oauthSubmitLabel }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import {
    fetchExchangeOpenAiOAuthCode,
    fetchGenerateOpenAiOAuthAuthUrl,
    fetchRefreshOpenAiOAuthToken
  } from '@/api/ai-openai-oauth'
  import {
    fetchCreateChannelAccount,
    fetchGetChannelAccountDetail,
    fetchUpdateChannelAccount
  } from '@/api/ai-channel-account'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    CHANNEL_ACCOUNT_STATUS_OPTIONS,
    COMMON_CREDENTIAL_TYPE_OPTIONS,
    DEFAULT_CREDENTIALS_TEMPLATE,
    OPENAI_CHANNEL_TYPE,
    OAUTH_CREDENTIAL_TYPE,
    getCredentialPlaceholder,
    getCredentialTemplate
  } from '../constants'
  import {
    buildDefaultOpenAiOAuthRedirectUri,
    buildOpenAiOAuthPendingPayload,
    clearOpenAiOAuthPendingPayload,
    isOAuthCredentialType,
    saveOpenAiOAuthPendingPayload
  } from '../oauth'
  import type {
    ChannelAccountListItem,
    ChannelOption,
    FormModel,
    OpenAiOAuthCallbackParams,
    OpenAiOAuthPendingPayload
  } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    accountData?: Partial<ChannelAccountListItem>
    channelOptions: ChannelOption[]
    pendingPayload?: OpenAiOAuthPendingPayload
    callbackParams?: OpenAiOAuthCallbackParams
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)
  const oauthGenerateLoading = ref(false)
  const oauthSubmitLoading = ref(false)
  const oauthRefreshLoading = ref(false)
  const oauthCallbackMessage = ref('')
  const oauthCallbackAlertType = ref<'success' | 'warning'>('success')
  const oauthCredentialsPreviewText = ref('')
  const oauthExtraPlaceholder = '可选，OAuth 账号的附加配置仍然可以写在 extra 中'
  const defaultExtraPlaceholder = '请输入 JSON，例如：{"region":"us-east-1"}'

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const channelOptions = computed(() => props.channelOptions)

  const createDefaultFormData = (): FormModel => ({
    channelId: undefined,
    name: '',
    credentialType: 'api_key',
    credentialsText: DEFAULT_CREDENTIALS_TEMPLATE,
    redirectUri: buildDefaultOpenAiOAuthRedirectUri(),
    oauthSessionId: '',
    oauthAuthUrl: '',
    oauthCode: '',
    oauthState: '',
    secretRef: '',
    status: 1,
    schedulable: true,
    priority: 0,
    weight: 10,
    rateMultiplier: 1,
    concurrencyLimit: 0,
    quotaLimit: 0,
    testModel: '',
    extraText: '',
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())
  const runtimeState = reactive({
    lastErrorMessage: '',
    disabledApiKeysText: ''
  })

  const selectedChannel = computed(() =>
    channelOptions.value.find((item) => item.value === formData.channelId)
  )
  const availableTestModelOptions = computed(() => {
    const values = new Set<string>()
    if (selectedChannel.value?.testModel?.trim()) {
      values.add(selectedChannel.value.testModel.trim())
    }
    for (const model of selectedChannel.value?.models || []) {
      const text = model.trim()
      if (text) values.add(text)
    }
    return Array.from(values)
  })
  const credentialPlaceholder = computed(() =>
    isOpenAiOAuthFlow.value ? '' : getCredentialPlaceholder(formData.credentialType)
  )

  const isOpenAiChannel = computed(() => selectedChannel.value?.channelType === OPENAI_CHANNEL_TYPE)
  const isOpenAiOAuthFlow = computed(
    () => isOpenAiChannel.value && isOAuthCredentialType(formData.credentialType)
  )
  const canRefreshOAuthToken = computed(
    () =>
      dialogType.value === 'edit' &&
      isOpenAiOAuthFlow.value &&
      typeof props.accountData?.id === 'number'
  )
  const showGenericSubmitButton = computed(
    () => !isOpenAiOAuthFlow.value || dialogType.value === 'edit'
  )
  const genericSubmitLabel = computed(() => {
    if (dialogType.value === 'edit' && isOpenAiOAuthFlow.value) return '保存基础配置'
    return '提交'
  })
  const oauthSubmitLabel = computed(() =>
    dialogType.value === 'add' ? '完成 OAuth 创建' : '完成 OAuth 重新绑定'
  )

  const validateCredentialsText = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (isOpenAiOAuthFlow.value) {
      callback()
      return
    }

    const text = value.trim()
    if (!text) {
      callback(new Error('请输入凭证配置'))
      return
    }

    try {
      JSON.parse(text)
      callback()
    } catch {
      callback(new Error('凭证配置必须是合法 JSON'))
    }
  }

  const validateRedirectUri = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!isOpenAiOAuthFlow.value) {
      callback()
      return
    }
    if (!value.trim()) {
      callback(new Error('请输入回调地址'))
      return
    }
    callback()
  }

  const rules: FormRules<FormModel> = {
    channelId: [{ required: true, message: '请选择所属渠道', trigger: 'change' }],
    name: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
    credentialType: [{ required: true, message: '请输入凭证类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择账号状态', trigger: 'change' }],
    credentialsText: [{ validator: validateCredentialsText, trigger: 'blur' }],
    redirectUri: [{ validator: validateRedirectUri, trigger: 'blur' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
    Object.assign(runtimeState, {
      lastErrorMessage: '',
      disabledApiKeysText: ''
    })
    oauthCallbackMessage.value = ''
    oauthCallbackAlertType.value = 'success'
    oauthCredentialsPreviewText.value = ''
  }

  const normalizeOptionalString = (value: string) => value.trim() || undefined
  const normalizeCredentialType = (value: string) => value.trim().toLowerCase()

  const stringifyJson = (value: unknown, emptyAsBlank = true) => {
    if (value === undefined || value === null) return ''
    if (
      emptyAsBlank &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length === 0
    ) {
      return ''
    }
    return JSON.stringify(value, null, 2)
  }

  const parseJsonValue = (value: string, fieldLabel: string, required = false): unknown => {
    const text = value.trim()
    if (!text) {
      if (required) {
        throw new Error(`${fieldLabel}不能为空`)
      }
      return undefined
    }
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`${fieldLabel}必须是合法 JSON`)
    }
  }

  const applyPendingPayload = (pending?: OpenAiOAuthPendingPayload) => {
    if (!pending) return

    if (dialogType.value === 'add' && pending.mode !== 'create') return
    if (dialogType.value === 'edit' && pending.mode !== 'rebind') return
    if (
      dialogType.value === 'edit' &&
      props.accountData?.id &&
      pending.accountId &&
      pending.accountId !== props.accountData.id
    ) {
      return
    }

    Object.assign(formData, {
      channelId: pending.channelId ?? formData.channelId,
      name: pending.name || formData.name,
      credentialType: OAUTH_CREDENTIAL_TYPE,
      redirectUri: pending.redirectUri || formData.redirectUri,
      oauthSessionId: pending.sessionId || '',
      oauthAuthUrl: pending.authUrl || '',
      oauthCode: pending.code || '',
      oauthState: pending.state || '',
      secretRef: pending.secretRef || '',
      status: pending.status ?? formData.status,
      schedulable: pending.schedulable ?? formData.schedulable,
      priority: pending.priority ?? formData.priority,
      weight: pending.weight ?? formData.weight,
      rateMultiplier: pending.rateMultiplier ?? formData.rateMultiplier,
      concurrencyLimit: pending.concurrencyLimit ?? formData.concurrencyLimit,
      quotaLimit: pending.quotaLimit ?? formData.quotaLimit,
      testModel: pending.testModel || '',
      remark: pending.remark || ''
    })
  }

  const applyCallbackParams = () => {
    if (!props.callbackParams) return

    if (props.callbackParams.error) {
      oauthCallbackMessage.value =
        props.callbackParams.errorDescription ||
        props.callbackParams.error ||
        'OpenAI OAuth 授权失败'
      oauthCallbackAlertType.value = 'warning'
      return
    }

    if (props.callbackParams.code || props.callbackParams.state) {
      formData.credentialType = OAUTH_CREDENTIAL_TYPE
      formData.oauthCode = props.callbackParams.code || formData.oauthCode
      formData.oauthState = props.callbackParams.state || formData.oauthState
      oauthCallbackMessage.value = '已从当前回跳地址恢复 code/state，可直接完成 OAuth 绑定。'
      oauthCallbackAlertType.value = 'success'
    }
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.accountData?.id
    if (isEdit) {
      detailLoading.value = true
      try {
        const detail = await fetchGetChannelAccountDetail(props.accountData!.id!)
        Object.assign(formData, {
          channelId: detail.channelId,
          name: detail.name,
          credentialType: detail.credentialType,
          credentialsText: stringifyJson(detail.credentials, false) || '{}',
          secretRef: detail.secretRef || '',
          status: detail.status,
          schedulable: detail.schedulable,
          priority: detail.priority,
          weight: detail.weight,
          rateMultiplier: detail.rateMultiplier,
          concurrencyLimit: detail.concurrencyLimit,
          quotaLimit: detail.quotaLimit,
          testModel: detail.testModel || '',
          extraText: stringifyJson(detail.extra),
          remark: detail.remark || ''
        })

        oauthCredentialsPreviewText.value =
          isOAuthCredentialType(detail.credentialType) && detail.credentials
            ? stringifyJson(detail.credentials, false)
            : ''

        Object.assign(runtimeState, {
          lastErrorMessage: detail.lastErrorMessage || '',
          disabledApiKeysText: stringifyJson(detail.disabledApiKeys, false)
        })
      } finally {
        detailLoading.value = false
      }
    }

    applyPendingPayload(props.pendingPayload)
    applyCallbackParams()
  }

  const validateFields = async (fields: Array<keyof FormModel>) => {
    if (!formRef.value) return
    for (const field of fields) {
      await formRef.value.validateField(field)
    }
  }

  const persistOAuthPendingPayload = () => {
    if (!isOpenAiOAuthFlow.value) return

    saveOpenAiOAuthPendingPayload(
      buildOpenAiOAuthPendingPayload(dialogType.value === 'add' ? 'create' : 'rebind', {
        sessionId: formData.oauthSessionId.trim(),
        redirectUri: formData.redirectUri.trim(),
        authUrl: formData.oauthAuthUrl || undefined,
        channelId: formData.channelId,
        accountId: dialogType.value === 'edit' ? props.accountData?.id : undefined,
        name: formData.name.trim(),
        secretRef: normalizeOptionalString(formData.secretRef),
        status: formData.status,
        schedulable: formData.schedulable,
        priority: formData.priority,
        weight: formData.weight,
        rateMultiplier: formData.rateMultiplier,
        concurrencyLimit: formData.concurrencyLimit,
        quotaLimit: formData.quotaLimit,
        remark: normalizeOptionalString(formData.remark),
        testModel: normalizeOptionalString(formData.testModel),
        code: normalizeOptionalString(formData.oauthCode),
        state: normalizeOptionalString(formData.oauthState)
      })
    )
  }

  const handleGenerateOAuthAuthUrl = async () => {
    if (!isOpenAiOAuthFlow.value) {
      ElMessage.warning('当前仅 OpenAI 渠道的 OAuth 账号支持自动授权流程')
      return
    }

    try {
      await validateFields(['channelId', 'name', 'redirectUri'])
    } catch {
      return
    }

    oauthGenerateLoading.value = true
    try {
      const response = await fetchGenerateOpenAiOAuthAuthUrl({
        redirectUri: formData.redirectUri.trim()
      })
      formData.oauthSessionId = response.sessionId
      formData.oauthAuthUrl = response.authUrl
      formData.credentialType = OAUTH_CREDENTIAL_TYPE
      persistOAuthPendingPayload()
      ElMessage.success('授权链接已生成')
    } finally {
      oauthGenerateLoading.value = false
    }
  }

  const handleCopyOAuthAuthUrl = async () => {
    if (!formData.oauthAuthUrl) return

    try {
      await navigator.clipboard.writeText(formData.oauthAuthUrl)
      ElMessage.success('授权链接已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  const handleOpenOAuthPage = () => {
    if (!formData.oauthAuthUrl) return
    persistOAuthPendingPayload()
    window.location.assign(formData.oauthAuthUrl)
  }

  const handleOAuthSubmit = async () => {
    if (!isOpenAiOAuthFlow.value) {
      ElMessage.warning('当前不是 OpenAI OAuth 账号')
      return
    }

    try {
      await validateFields(['channelId', 'name', 'redirectUri'])
      if (!formData.oauthSessionId.trim()) {
        throw new Error('请先生成授权链接')
      }
      if (!formData.oauthCode.trim()) {
        throw new Error('请输入授权码')
      }
      if (!formData.oauthState.trim()) {
        throw new Error('请输入 state')
      }
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
      return
    }

    oauthSubmitLoading.value = true
    try {
      const response = await fetchExchangeOpenAiOAuthCode({
        sessionId: formData.oauthSessionId.trim(),
        code: formData.oauthCode.trim(),
        state: formData.oauthState.trim(),
        channelId: dialogType.value === 'add' ? formData.channelId : undefined,
        accountId: dialogType.value === 'edit' ? props.accountData?.id : undefined,
        name: formData.name.trim(),
        remark: normalizeOptionalString(formData.remark),
        testModel: normalizeOptionalString(formData.testModel)
      })

      clearOpenAiOAuthPendingPayload()
      ElMessage.success(
        response.created ? 'OpenAI OAuth 账号创建成功' : 'OpenAI OAuth 账号重新绑定成功'
      )
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } finally {
      oauthSubmitLoading.value = false
    }
  }

  const handleRefreshOAuthToken = async () => {
    if (!props.accountData?.id) return

    oauthRefreshLoading.value = true
    try {
      await fetchRefreshOpenAiOAuthToken({ accountId: props.accountData.id })
      ElMessage.success('OAuth 令牌已刷新')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } finally {
      oauthRefreshLoading.value = false
    }
  }

  const buildUpdatePayload = (): Api.AiManage.UpdateChannelAccountParams => {
    const basePayload = {
      name: formData.name.trim(),
      credentialType: formData.credentialType.trim() || undefined,
      secretRef: isOpenAiOAuthFlow.value ? undefined : normalizeOptionalString(formData.secretRef),
      status: formData.status,
      schedulable: formData.schedulable,
      priority: formData.priority,
      weight: formData.weight,
      rateMultiplier: formData.rateMultiplier,
      concurrencyLimit: formData.concurrencyLimit,
      quotaLimit: formData.quotaLimit,
      testModel: normalizeOptionalString(formData.testModel),
      extra: parseJsonValue(formData.extraText, '扩展配置'),
      remark: normalizeOptionalString(formData.remark)
    }

    if (isOpenAiOAuthFlow.value) {
      return basePayload
    }

    return {
      ...basePayload,
      credentials: parseJsonValue(formData.credentialsText, '凭证配置', true)
    }
  }

  const buildCreatePayload = (): Api.AiManage.CreateChannelAccountParams => ({
    channelId: formData.channelId!,
    name: formData.name.trim(),
    credentialType: formData.credentialType.trim(),
    credentials: parseJsonValue(formData.credentialsText, '凭证配置', true),
    secretRef: normalizeOptionalString(formData.secretRef),
    status: formData.status,
    schedulable: formData.schedulable,
    priority: formData.priority,
    weight: formData.weight,
    rateMultiplier: formData.rateMultiplier,
    concurrencyLimit: formData.concurrencyLimit,
    quotaLimit: formData.quotaLimit,
    testModel: normalizeOptionalString(formData.testModel),
    extra: parseJsonValue(formData.extraText, '扩展配置'),
    remark: normalizeOptionalString(formData.remark)
  })

  const handleGenericSubmit = async () => {
    if (isOpenAiOAuthFlow.value && dialogType.value === 'add') {
      await handleOAuthSubmit()
      return
    }

    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await fetchCreateChannelAccount(buildCreatePayload())
      } else if (props.accountData?.id) {
        await fetchUpdateChannelAccount(props.accountData.id, buildUpdatePayload())
      }

      clearOpenAiOAuthPendingPayload()
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      emit('submit', dialogType.value)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('JSON') || error.message.includes('不能为空'))
      ) {
        ElMessage.error(error.message)
      }
    } finally {
      submitLoading.value = false
    }
  }

  watch(
    () => [
      props.visible,
      props.type,
      props.accountData?.id,
      props.pendingPayload?.sessionId,
      props.callbackParams?.code,
      props.callbackParams?.state,
      props.callbackParams?.error
    ],
    async ([visible]) => {
      if (!visible) return
      await initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  watch(
    () => formData.credentialType,
    (value, previousValue) => {
      const normalized = normalizeCredentialType(value)
      const previous = normalizeCredentialType(previousValue || '')

      if (!normalized || normalized === previous) return
      if (isOpenAiOAuthFlow.value) return

      const previousTemplate = getCredentialTemplate(previous)
      const nextTemplate = getCredentialTemplate(normalized)
      if (!formData.credentialsText.trim() || formData.credentialsText === previousTemplate) {
        formData.credentialsText = nextTemplate
      }
    }
  )

  watch(
    () => formData.channelId,
    () => {
      if (!availableTestModelOptions.value.length) return
      if (formData.testModel.trim()) return
      formData.testModel = availableTestModelOptions.value[0]
    }
  )
</script>
