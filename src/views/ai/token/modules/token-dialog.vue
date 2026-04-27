<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增令牌' : '编辑令牌'"
    width="980px"
    align-center
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      v-loading="detailLoading"
    >
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="所属用户" prop="userId">
            <ElSelect
              v-model="formData.userId"
              :disabled="dialogType === 'edit'"
              filterable
              placeholder="请选择用户"
            >
              <ElOption
                v-for="item in userOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="服务账号 ID" prop="serviceAccountId">
            <ElInputNumber
              v-model="formData.serviceAccountId"
              :disabled="dialogType === 'edit'"
              :min="0"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="项目 ID" prop="projectId">
            <ElInputNumber
              v-model="formData.projectId"
              :disabled="dialogType === 'edit'"
              :min="0"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="令牌名称" prop="name">
            <ElInput v-model="formData.name" maxlength="128" placeholder="请输入令牌名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="formData.status" placeholder="请选择状态">
              <ElOption
                v-for="item in TOKEN_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="无限额度" prop="unlimitedQuota">
            <ElSwitch v-model="formData.unlimitedQuota" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="剩余额度" prop="remainQuota">
            <ElInputNumber
              v-model="formData.remainQuota"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="分组覆盖" prop="groupCodeOverride">
            <ElInput v-model="formData.groupCodeOverride" placeholder="为空时跟随用户额度分组" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="过期时间" prop="expireTime">
            <ElDatePicker
              v-model="formData.expireTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              placeholder="可选"
              clearable
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="允许 Endpoint" prop="endpointScopes">
        <ElSelect
          v-model="formData.endpointScopes"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或直接输入 endpoint scope"
        >
          <ElOption
            v-for="item in COMMON_ENDPOINT_SCOPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="允许模型" prop="modelsText">
        <ElInput
          v-model="formData.modelsText"
          type="textarea"
          :rows="3"
          placeholder="使用逗号或换行分隔；为空表示不限制"
        />
      </ElFormItem>

      <ElRow :gutter="16">
        <ElCol :span="8">
          <ElFormItem label="RPM 限制" prop="rpmLimit">
            <ElInputNumber
              v-model="formData.rpmLimit"
              :min="0"
              :step="10"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="TPM 限制" prop="tpmLimit">
            <ElInputNumber
              v-model="formData.tpmLimit"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="并发限制" prop="concurrencyLimit">
            <ElInputNumber v-model="formData.concurrencyLimit" :min="0" controls-position="right" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="日额度上限" prop="dailyQuotaLimit">
            <ElInputNumber
              v-model="formData.dailyQuotaLimit"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="月额度上限" prop="monthlyQuotaLimit">
            <ElInputNumber
              v-model="formData.monthlyQuotaLimit"
              :min="0"
              :step="1000"
              controls-position="right"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="IP 白名单" prop="ipWhitelistText">
        <ElInput
          v-model="formData.ipWhitelistText"
          type="textarea"
          :rows="3"
          placeholder="使用逗号或换行分隔，支持 IP / CIDR"
        />
      </ElFormItem>

      <ElFormItem label="IP 黑名单" prop="ipBlacklistText">
        <ElInput
          v-model="formData.ipBlacklistText"
          type="textarea"
          :rows="3"
          placeholder="使用逗号或换行分隔，支持 IP / CIDR"
        />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchCreateToken, fetchGetTokenDetail, fetchUpdateToken } from '@/api/ai-token'
  import type { DialogType } from '@/types'
  import { ElMessage, type FormInstance, type FormItemRule, type FormRules } from 'element-plus'
  import { COMMON_ENDPOINT_SCOPE_OPTIONS } from '../../channel/constants'
  import { TOKEN_STATUS_OPTIONS } from '../constants'
  import type { FormModel, TokenListItem, UserOption } from '../types'

  interface Props {
    visible: boolean
    type: DialogType
    tokenData?: Partial<TokenListItem>
    userOptions: UserOption[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', type: DialogType, result?: Api.AiManage.CreatedTokenVo): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const detailLoading = ref(false)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)
  const userOptions = computed(() => props.userOptions)

  const createDefaultFormData = (): FormModel => ({
    userId: undefined,
    serviceAccountId: 0,
    projectId: 0,
    name: '',
    remainQuota: 0,
    unlimitedQuota: true,
    modelsText: '',
    endpointScopes: [],
    ipWhitelistText: '',
    ipBlacklistText: '',
    groupCodeOverride: '',
    rpmLimit: 0,
    tpmLimit: 0,
    concurrencyLimit: 0,
    dailyQuotaLimit: 0,
    monthlyQuotaLimit: 0,
    expireTime: '',
    status: 1,
    remark: ''
  })

  const formData = reactive<FormModel>(createDefaultFormData())

  const splitTextList = (value: string) => {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const stringifyList = (value: string[] | undefined) => {
    if (!value?.length) return ''
    return value.join('\n')
  }

  const normalizeBindingId = (value: number | undefined) => {
    if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) return undefined
    return Number(value)
  }

  const validateRemainQuota: FormItemRule['validator'] = (_rule, value, callback) => {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      callback(new Error('请输入合法的剩余额度'))
      return
    }

    if (formData.status === 1 && !formData.unlimitedQuota && value <= 0) {
      callback(new Error('启用状态下，非无限额度令牌的剩余额度必须大于 0'))
      return
    }

    callback()
  }

  const validateExpireTime: FormItemRule['validator'] = (_rule, value, callback) => {
    if (!value) {
      callback()
      return
    }

    if (formData.status !== 1) {
      callback()
      return
    }

    const time = new Date(value).getTime()
    if (Number.isNaN(time) || time <= Date.now()) {
      callback(new Error('启用状态下，过期时间必须晚于当前时间'))
      return
    }

    callback()
  }

  const rules: FormRules = {
    userId: [{ required: true, message: '请选择所属用户', trigger: 'change' }],
    name: [{ required: true, message: '请输入令牌名称', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    remainQuota: [{ required: true, validator: validateRemainQuota, trigger: 'change' }],
    expireTime: [{ validator: validateExpireTime, trigger: 'change' }]
  }

  const resetFormData = () => {
    Object.assign(formData, createDefaultFormData())
  }

  const initFormData = async () => {
    resetFormData()

    const isEdit = props.type === 'edit' && props.tokenData?.id
    if (!isEdit) return

    detailLoading.value = true
    try {
      const detail = await fetchGetTokenDetail(props.tokenData!.id!)
      Object.assign(formData, {
        userId: detail.userId,
        serviceAccountId: detail.serviceAccountId,
        projectId: detail.projectId,
        name: detail.name,
        remainQuota: detail.remainQuota,
        unlimitedQuota: detail.unlimitedQuota,
        modelsText: stringifyList(detail.models),
        endpointScopes: detail.endpointScopes,
        ipWhitelistText: stringifyList(detail.ipWhitelist),
        ipBlacklistText: stringifyList(detail.ipBlacklist),
        groupCodeOverride: detail.groupCodeOverride || '',
        rpmLimit: detail.rpmLimit,
        tpmLimit: detail.tpmLimit,
        concurrencyLimit: detail.concurrencyLimit,
        dailyQuotaLimit: detail.dailyQuotaLimit,
        monthlyQuotaLimit: detail.monthlyQuotaLimit,
        expireTime: detail.expireTime || '',
        status: detail.status,
        remark: detail.remark || ''
      })
    } finally {
      detailLoading.value = false
    }
  }

  watch(
    () => [props.visible, props.type, props.tokenData?.id],
    async ([visible]) => {
      if (!visible) return
      await initFormData()
      await nextTick()
      formRef.value?.clearValidate()
    }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitLoading.value = true
    try {
      const createPayload: Api.AiManage.CreateTokenParams = {
        userId: Number(formData.userId),
        serviceAccountId: normalizeBindingId(formData.serviceAccountId),
        projectId: normalizeBindingId(formData.projectId),
        name: formData.name.trim(),
        remainQuota: Number(formData.remainQuota ?? 0),
        unlimitedQuota: formData.unlimitedQuota,
        models: splitTextList(formData.modelsText),
        endpointScopes: formData.endpointScopes.map((item) => item.trim()).filter(Boolean),
        ipWhitelist: splitTextList(formData.ipWhitelistText),
        ipBlacklist: splitTextList(formData.ipBlacklistText),
        groupCodeOverride: formData.groupCodeOverride.trim(),
        rpmLimit: Number(formData.rpmLimit ?? 0),
        tpmLimit: Number(formData.tpmLimit ?? 0),
        concurrencyLimit: Number(formData.concurrencyLimit ?? 0),
        dailyQuotaLimit: Number(formData.dailyQuotaLimit ?? 0),
        monthlyQuotaLimit: Number(formData.monthlyQuotaLimit ?? 0),
        expireTime: formData.expireTime || undefined,
        remark: formData.remark.trim(),
        status: formData.status
      }

      if (dialogType.value === 'add') {
        const result = await fetchCreateToken(createPayload)
        ElMessage.success('新增成功')
        dialogVisible.value = false
        emit('submit', dialogType.value, result)
        return
      }

      if (props.tokenData?.id) {
        const updatePayload: Api.AiManage.UpdateTokenParams = {
          name: createPayload.name,
          status: createPayload.status,
          remainQuota: createPayload.remainQuota,
          unlimitedQuota: createPayload.unlimitedQuota,
          models: createPayload.models,
          endpointScopes: createPayload.endpointScopes,
          ipWhitelist: createPayload.ipWhitelist,
          ipBlacklist: createPayload.ipBlacklist,
          groupCodeOverride: createPayload.groupCodeOverride,
          rpmLimit: createPayload.rpmLimit,
          tpmLimit: createPayload.tpmLimit,
          concurrencyLimit: createPayload.concurrencyLimit,
          dailyQuotaLimit: createPayload.dailyQuotaLimit,
          monthlyQuotaLimit: createPayload.monthlyQuotaLimit,
          expireTime: createPayload.expireTime,
          remark: createPayload.remark
        }
        await fetchUpdateToken(props.tokenData.id, updatePayload)
        ElMessage.success('更新成功')
        dialogVisible.value = false
        emit('submit', dialogType.value)
      }
    } finally {
      submitLoading.value = false
    }
  }
</script>
