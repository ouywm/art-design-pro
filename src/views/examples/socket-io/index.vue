<template>
  <div class="page-content mb-5">
    <div class="mb-15 text-center">
      <h1 class="my-4 text-2xl font-semibold leading-tight">Socket.IO {{ t('socketIO.title') }}</h1>
      <p class="m-0 text-base leading-relaxed text-g-700">
        {{ t('socketIO.description') }}
      </p>
    </div>

    <!-- 连接状态卡片 -->
    <ElRow :gutter="20" class="mb-15">
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <ElTag :type="statusTagType" size="large" class="mb-2">
              {{ statusText }}
            </ElTag>
            <div class="text-sm font-medium text-gray-900">{{ t('socketIO.connStatus') }}</div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <div class="text-lg font-bold text-blue-500 mb-1 font-mono truncate">
              {{ socketId || '-' }}
            </div>
            <div class="text-sm font-medium text-gray-900">Socket ID</div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500 mb-1">{{ eventCount }}</div>
            <div class="text-sm font-medium text-gray-900">{{ t('socketIO.eventCount') }}</div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-500 mb-1">{{ reconnectCount }}</div>
            <div class="text-sm font-medium text-gray-900">{{ t('socketIO.reconnectCount') }}</div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 连接配置和 Token 信息 -->
    <ElRow :gutter="20" class="mb-15">
      <ElCol :xs="24" :md="12">
        <ElCard class="h-full border-0">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold">{{ t('socketIO.connConfig') }}</span>
              <ElTag :type="statusTagType" size="small">{{ statusText }}</ElTag>
            </div>
          </template>

          <ElForm :model="config" label-width="120px" class="max-w-lg">
            <ElFormItem :label="t('socketIO.serverUrl')">
              <ElInput v-model="config.url" placeholder="http://localhost:8080" clearable />
            </ElFormItem>
            <ElFormItem :label="t('socketIO.namespace')">
              <ElInput v-model="config.namespace" placeholder="/summer-admin" clearable />
            </ElFormItem>
            <ElFormItem :label="t('socketIO.path')">
              <ElInput v-model="config.path" placeholder="/api/socket.io" clearable />
            </ElFormItem>
            <ElFormItem :label="t('socketIO.transport')">
              <ElSelect v-model="config.transports" multiple class="w-full">
                <ElOption label="WebSocket" value="websocket" />
                <ElOption label="Polling" value="polling" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem :label="t('socketIO.options')">
              <ElSpace>
                <ElCheckbox v-model="config.reconnection">
                  {{ t('socketIO.autoReconnect') }}
                </ElCheckbox>
              </ElSpace>
            </ElFormItem>
            <ElFormItem>
              <ElSpace>
                <ElButton
                  type="primary"
                  @click="handleConnect"
                  :loading="isConnecting"
                  :disabled="isConnected"
                >
                  {{ isConnecting ? t('socketIO.connecting') : t('socketIO.connect') }}
                </ElButton>
                <ElButton type="danger" @click="handleDisconnect" :disabled="!isConnected">
                  {{ t('socketIO.disconnect') }}
                </ElButton>
                <ElButton @click="handleReconnect" :disabled="isConnecting">
                  {{ t('socketIO.reconnect') }}
                </ElButton>
              </ElSpace>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard class="h-full border-0">
          <template #header>
            <span class="text-base font-bold">Token {{ t('socketIO.info') }}</span>
          </template>

          <ElForm label-width="120px" class="max-w-lg">
            <ElFormItem label="Access Token">
              <div class="flex gap-2 w-full">
                <ElInput
                  v-model="tokenDisplay"
                  readonly
                  :type="showToken ? 'text' : 'password'"
                  class="flex-1"
                />
                <ElButton @click="showToken = !showToken">
                  {{ showToken ? t('socketIO.hide') : t('socketIO.show') }}
                </ElButton>
              </div>
            </ElFormItem>
            <ElFormItem :label="t('socketIO.tokenStatus')">
              <ElTag :type="userStore.accessToken ? 'success' : 'danger'">
                {{ userStore.accessToken ? t('socketIO.tokenValid') : t('socketIO.tokenEmpty') }}
              </ElTag>
            </ElFormItem>
            <ElFormItem :label="t('socketIO.customToken')">
              <ElInput
                v-model="customToken"
                :placeholder="t('socketIO.customTokenPlaceholder')"
                clearable
              />
            </ElFormItem>
            <ElFormItem>
              <ElSpace>
                <ElButton
                  type="primary"
                  @click="handleConnectWithCustomToken"
                  :disabled="!customToken"
                >
                  {{ t('socketIO.connectWithCustomToken') }}
                </ElButton>
                <ElButton @click="handleConnectWithoutToken">
                  {{ t('socketIO.connectWithoutToken') }}
                </ElButton>
              </ElSpace>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- Composable 演示 -->
    <ElCard class="border-0 mb-15">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-base font-bold">{{ t('socketIO.composableDemo') }}</span>
            <span class="text-sm text-gray-500 ml-2">useSocketIO()</span>
          </div>
          <ElTag :type="composableConnected ? 'success' : 'danger'" size="small">
            {{
              composableConnected ? t('socketIO.statusConnected') : t('socketIO.statusDisconnected')
            }}
          </ElTag>
        </div>
      </template>

      <p class="text-sm text-gray-500 mb-4">{{ t('socketIO.composableDesc') }}</p>

      <ElRow :gutter="20">
        <ElCol :xs="24" :md="12">
          <ElForm label-width="120px" class="max-w-lg">
            <!-- 连接/断开 -->
            <ElFormItem :label="t('socketIO.composableStatus')">
              <ElSpace>
                <ElButton
                  type="primary"
                  size="small"
                  @click="composableConnect"
                  :disabled="composableConnected"
                >
                  {{ t('socketIO.composableConnect') }}
                </ElButton>
                <ElButton
                  type="danger"
                  size="small"
                  @click="composableDisconnect"
                  :disabled="!composableConnected"
                >
                  {{ t('socketIO.composableDisconnect') }}
                </ElButton>
              </ElSpace>
            </ElFormItem>

            <!-- 事件名和载荷 -->
            <ElFormItem :label="t('socketIO.composableEventName')">
              <ElInput v-model="composableEventName" placeholder="ping" clearable />
            </ElFormItem>
            <ElFormItem :label="t('socketIO.composablePayload')">
              <ElInput v-model="composablePayload" placeholder='{"hello": "world"}' clearable />
            </ElFormItem>
            <ElFormItem :label="t('socketIO.composableTimeoutMs')">
              <ElInputNumber v-model="composableTimeoutMs" :min="500" :max="30000" :step="500" />
            </ElFormItem>

            <!-- 操作按钮 -->
            <ElFormItem>
              <ElSpace wrap>
                <ElButton
                  type="primary"
                  size="small"
                  @click="handleComposableEmit"
                  :disabled="!composableConnected"
                >
                  {{ t('socketIO.composableEmit') }}
                </ElButton>
                <ElButton
                  type="success"
                  size="small"
                  @click="handleComposableEmitWithAck"
                  :disabled="!composableConnected"
                >
                  {{ t('socketIO.composableEmitWithAck') }}
                </ElButton>
                <ElButton
                  type="warning"
                  size="small"
                  @click="handleComposableTimeout"
                  :disabled="!composableConnected"
                >
                  {{ t('socketIO.composableTimeout') }}
                </ElButton>
                <ElButton
                  size="small"
                  @click="handleComposableVolatile"
                  :disabled="!composableConnected"
                >
                  {{ t('socketIO.composableVolatile') }}
                </ElButton>
              </ElSpace>
            </ElFormItem>
          </ElForm>
        </ElCol>

        <ElCol :xs="24" :md="12">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold">{{ t('socketIO.composableLog') }}</span>
            <ElButton size="small" @click="composableLogs = []">{{
              t('socketIO.clearLog')
            }}</ElButton>
          </div>
          <div class="log-container">
            <ElAlert
              v-for="(log, index) in composableLogs"
              :key="index"
              :type="log.type"
              :closable="false"
              class="!mb-2"
            >
              <template #title>
                <div class="flex items-start gap-2">
                  <span class="text-xs opacity-70 whitespace-nowrap">{{ log.time }}</span>
                  <ElTag :type="log.tagType" size="small" class="!mr-1">{{ log.tag }}</ElTag>
                  <span class="flex-1 font-mono text-xs break-all">{{ log.message }}</span>
                </div>
              </template>
            </ElAlert>
            <ElEmpty
              v-if="composableLogs.length === 0"
              :description="t('socketIO.noLogs')"
              :image-size="60"
            />
          </div>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 事件日志 -->
    <ElCard class="border-0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold">{{ t('socketIO.eventLog') }}</span>
          <ElButton size="small" @click="clearLogs">{{ t('socketIO.clearLog') }}</ElButton>
        </div>
      </template>

      <div class="log-container">
        <ElAlert
          v-for="(log, index) in logList"
          :key="index"
          :type="log.type"
          :closable="false"
          class="!mb-2"
        >
          <template #title>
            <div class="flex items-start gap-2">
              <span class="text-xs opacity-70 whitespace-nowrap">{{ log.time }}</span>
              <ElTag :type="log.tagType" size="small" class="!mr-1">{{ log.event }}</ElTag>
              <span class="flex-1 font-mono text-xs break-all">{{ log.message }}</span>
            </div>
          </template>
        </ElAlert>

        <ElEmpty
          v-if="logList.length === 0"
          :description="t('socketIO.noLogs')"
          :image-size="100"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { io, type Socket } from 'socket.io-client'
  import { useSocketIO } from '@/utils/socket/socket-io'
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ExamplesSocketIO' })

  const { t } = useI18n()
  const userStore = useUserStore()

  // ==================== 直接 io() 连接测试（保留原有功能） ====================

  // Socket 实例
  let socket: Socket | null = null

  // 连接状态
  const isConnecting = ref(false)
  const isConnected = ref(false)
  const socketId = ref<string>('')
  const eventCount = ref(0)
  const reconnectCount = ref(0)

  // 配置
  const config = ref({
    url: 'http://localhost:8080',
    namespace: '/summer-admin',
    path: '/api/socket.io',
    transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
    reconnection: true
  })

  // Token 相关
  const showToken = ref(false)
  const customToken = ref('')
  const tokenDisplay = computed(() => userStore.accessToken || '')

  // 日志
  const logList = ref<
    Array<{
      type: 'info' | 'success' | 'warning' | 'error'
      tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info'
      event: string
      message: string
      time: string
    }>
  >([])

  // 计算属性
  const statusTagType = computed(() => {
    if (isConnecting.value) return 'warning'
    if (isConnected.value) return 'success'
    return 'danger'
  })

  const statusText = computed(() => {
    if (isConnecting.value) return t('socketIO.statusConnecting')
    if (isConnected.value) return t('socketIO.statusConnected')
    return t('socketIO.statusDisconnected')
  })

  /**
   * 添加日志
   */
  const addLog = (
    type: 'info' | 'success' | 'warning' | 'error',
    event: string,
    message: string,
    tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'info'
  ) => {
    eventCount.value++
    logList.value.unshift({
      type,
      tagType,
      event,
      message,
      time: new Date().toLocaleTimeString()
    })
    if (logList.value.length > 200) {
      logList.value = logList.value.slice(0, 200)
    }
  }

  /**
   * 创建 Socket 连接
   */
  const createSocket = (authPayload?: Record<string, string>) => {
    // 先清理已有连接
    destroySocket()

    const url = `${config.value.url}${config.value.namespace}`
    const auth = authPayload ?? { accessToken: userStore.accessToken }

    isConnecting.value = true
    addLog('info', 'INIT', `${t('socketIO.logConnecting')} ${url} (path: ${config.value.path})`)

    socket = io(url, {
      path: config.value.path,
      auth,
      transports: config.value.transports,
      reconnection: config.value.reconnection,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    })

    // 连接成功
    socket.on('connect', () => {
      isConnecting.value = false
      isConnected.value = true
      socketId.value = socket?.id || ''
      reconnectCount.value = 0
      addLog('success', 'connect', `${t('socketIO.logConnected')} id=${socket?.id}`, 'success')
    })

    // 断开连接
    socket.on('disconnect', (reason: string) => {
      isConnected.value = false
      isConnecting.value = false
      socketId.value = ''
      addLog(
        'warning',
        'disconnect',
        `${t('socketIO.logDisconnected')} reason=${reason}`,
        'warning'
      )
    })

    // 连接错误
    socket.on('connect_error', (err: Error) => {
      isConnecting.value = false
      isConnected.value = false
      addLog('error', 'connect_error', err.message, 'danger')
    })

    // 重连尝试
    socket.io.on('reconnect_attempt', (attempt: number) => {
      reconnectCount.value = attempt
      isConnecting.value = true
      addLog('info', 'reconnect_attempt', `${t('socketIO.logReconnectAttempt')} #${attempt}`)
    })

    // 重连成功
    socket.io.on('reconnect', (attempt: number) => {
      addLog('success', 'reconnect', `${t('socketIO.logReconnected')} #${attempt}`, 'success')
    })

    // 重连失败
    socket.io.on('reconnect_failed', () => {
      isConnecting.value = false
      addLog('error', 'reconnect_failed', t('socketIO.logReconnectFailed'), 'danger')
    })

    // 监听所有服务端事件（用于日志）
    socket.onAny((event: string, ...args: any[]) => {
      addLog('info', event, JSON.stringify(args))
    })
  }

  /**
   * 销毁 Socket 连接
   */
  const destroySocket = () => {
    if (socket) {
      socket.offAny()
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
    isConnected.value = false
    isConnecting.value = false
    socketId.value = ''
  }

  /**
   * 使用当前 accessToken 连接
   */
  const handleConnect = () => {
    if (!userStore.accessToken) {
      addLog('error', 'AUTH', t('socketIO.logNoToken'), 'danger')
      return
    }
    createSocket()
  }

  /**
   * 断开连接
   */
  const handleDisconnect = () => {
    addLog('info', 'MANUAL', t('socketIO.logManualDisconnect'))
    destroySocket()
  }

  /**
   * 使用最新 token 重连
   */
  const handleReconnect = () => {
    addLog('info', 'MANUAL', t('socketIO.logManualReconnect'))
    createSocket()
  }

  /**
   * 使用自定义 token 连接
   */
  const handleConnectWithCustomToken = () => {
    addLog('info', 'AUTH', t('socketIO.logCustomToken'))
    createSocket({ accessToken: customToken.value })
  }

  /**
   * 不传 token 连接（测试鉴权失败）
   */
  const handleConnectWithoutToken = () => {
    addLog('info', 'AUTH', t('socketIO.logNoTokenConnect'))
    createSocket({})
  }

  /**
   * 清空日志
   */
  const clearLogs = () => {
    logList.value = []
    eventCount.value = 0
  }

  // ==================== Composable 演示 ====================

  // useSocketIO composable — 使用默认泛型
  const {
    connected: composableConnected,
    connect: composableConnect,
    disconnect: composableDisconnect,
    emit: composableEmitFn,
    emitWithAck: composableEmitWithAckFn,
    timeout: composableTimeoutFn,
    volatile: composableVolatileFn
  } = useSocketIO({
    namespace: import.meta.env.VITE_SOCKET_NS || '/summer-admin',
    path: import.meta.env.VITE_SOCKET_PATH || '/api/socket.io',
    autoConnect: false
  })

  // Composable 演示配置
  const composableEventName = ref('ping')
  const composablePayload = ref('{"hello": "world"}')
  const composableTimeoutMs = ref(5000)

  // Composable 日志
  const composableLogs = ref<
    Array<{
      type: 'info' | 'success' | 'warning' | 'error'
      tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info'
      tag: string
      message: string
      time: string
    }>
  >([])

  const addComposableLog = (
    type: 'info' | 'success' | 'warning' | 'error',
    tag: string,
    message: string,
    tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'info'
  ) => {
    composableLogs.value.unshift({
      type,
      tagType,
      tag,
      message,
      time: new Date().toLocaleTimeString()
    })
    if (composableLogs.value.length > 50) {
      composableLogs.value = composableLogs.value.slice(0, 50)
    }
  }

  const parsePayload = (): unknown => {
    try {
      return JSON.parse(composablePayload.value)
    } catch {
      return composablePayload.value
    }
  }

  const handleComposableEmit = () => {
    const payload = parsePayload()
    composableEmitFn(composableEventName.value, payload)
    addComposableLog('info', 'emit', `${composableEventName.value} → ${JSON.stringify(payload)}`)
  }

  const handleComposableEmitWithAck = async () => {
    const payload = parsePayload()
    addComposableLog(
      'info',
      'emitWithAck',
      `${composableEventName.value} → ${JSON.stringify(payload)}`
    )
    try {
      const result = await composableEmitWithAckFn(composableEventName.value, payload)
      addComposableLog('success', 'ack', JSON.stringify(result), 'success')
    } catch (err) {
      addComposableLog('error', 'ack-error', String(err), 'danger')
    }
  }

  const handleComposableTimeout = async () => {
    const payload = parsePayload()
    const ms = composableTimeoutMs.value
    addComposableLog(
      'info',
      `timeout(${ms})`,
      `${composableEventName.value} → ${JSON.stringify(payload)}`,
      'warning'
    )
    try {
      const { emitWithAck } = composableTimeoutFn(ms)
      const result = await emitWithAck(composableEventName.value, payload)
      addComposableLog('success', 'ack', JSON.stringify(result), 'success')
    } catch (err) {
      addComposableLog('error', 'timeout', String(err), 'danger')
    }
  }

  const handleComposableVolatile = () => {
    const payload = parsePayload()
    composableVolatileFn.emit(composableEventName.value, payload)
    addComposableLog(
      'info',
      'volatile',
      `${composableEventName.value} → ${JSON.stringify(payload)}`,
      'warning'
    )
  }

  onUnmounted(() => {
    destroySocket()
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .log-container {
    @apply max-h-96 overflow-y-auto;
  }

  .log-container::-webkit-scrollbar {
    @apply w-4;
  }

  .log-container::-webkit-scrollbar-track {
    @apply bg-gray-100 rounded;
  }

  .log-container::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded hover:bg-gray-400;
  }
</style>
