import SparkMD5 from 'spark-md5'

const MD5_CHUNK_SIZE = 2 * 1024 * 1024

let cancelled = false

self.addEventListener('message', (e: MessageEvent<Api.FileUpload.Md5WorkerRequest>) => {
  const msg = e.data

  if (msg.type === 'cancel') {
    cancelled = true
    return
  }

  if (msg.type === 'start') {
    cancelled = false
    computeMd5(msg.file, msg.chunkSize || MD5_CHUNK_SIZE)
  }
})

async function computeMd5(file: File, chunkSize: number) {
  const spark = new SparkMD5.ArrayBuffer()
  const totalChunks = Math.ceil(file.size / chunkSize)

  try {
    for (let i = 0; i < totalChunks; i++) {
      if (cancelled) {
        self.postMessage({ type: 'cancelled' } satisfies Api.FileUpload.Md5WorkerResponse)
        return
      }

      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const buffer = await file.slice(start, end).arrayBuffer()
      spark.append(buffer)

      const percent = Math.round(((i + 1) / totalChunks) * 100)
      self.postMessage({ type: 'progress', percent } satisfies Api.FileUpload.Md5WorkerResponse)
    }

    if (cancelled) {
      self.postMessage({ type: 'cancelled' } satisfies Api.FileUpload.Md5WorkerResponse)
      return
    }

    const md5 = spark.end()
    self.postMessage({ type: 'complete', md5 } satisfies Api.FileUpload.Md5WorkerResponse)
  } catch (err: any) {
    self.postMessage({
      type: 'error',
      message: err.message || 'MD5 computation failed'
    } satisfies Api.FileUpload.Md5WorkerResponse)
  }
}
