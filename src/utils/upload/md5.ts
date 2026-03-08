import { MD5_CHUNK_SIZE } from './constants'

interface ComputeMd5Options {
  chunkSize?: number
  onProgress?: (percent: number) => void
}

interface ComputeMd5Result {
  promise: Promise<string>
  cancel: () => void
}

/**
 * 计算文件 MD5（Web Worker 非阻塞）
 * 返回 promise 和 cancel 方法
 */
export function computeFileMd5(file: File, options?: ComputeMd5Options): ComputeMd5Result {
  const chunkSize = options?.chunkSize ?? MD5_CHUNK_SIZE
  let worker: Worker | null = null
  let cancelled = false

  const promise = new Promise<string>((resolve, reject) => {
    worker = new Worker(new URL('./md5.worker.ts', import.meta.url), { type: 'module' })

    worker.addEventListener('message', (e: MessageEvent<Api.FileUpload.Md5WorkerResponse>) => {
      const msg = e.data

      switch (msg.type) {
        case 'progress':
          options?.onProgress?.(msg.percent)
          break
        case 'complete':
          resolve(msg.md5)
          terminateWorker()
          break
        case 'error':
          reject(new Error(msg.message))
          terminateWorker()
          break
        case 'cancelled':
          reject(new Error('MD5 computation cancelled'))
          terminateWorker()
          break
      }
    })

    worker.addEventListener('error', (e) => {
      reject(new Error(e.message || 'Worker error'))
      terminateWorker()
    })

    worker.postMessage({ type: 'start', file, chunkSize } satisfies Api.FileUpload.Md5WorkerRequest)
  })

  function terminateWorker() {
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  function cancel() {
    if (cancelled) return
    cancelled = true

    if (worker) {
      // 协作式取消：发消息让 Worker 自行退出
      worker.postMessage({ type: 'cancel' } satisfies Api.FileUpload.Md5WorkerRequest)

      // 兜底：100ms 后强制终止
      setTimeout(() => {
        terminateWorker()
      }, 100)
    }
  }

  return { promise, cancel }
}
