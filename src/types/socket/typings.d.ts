/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Socket.IO 内部辅助类型
 *
 * 这些类型来自 socket.io-client 和 @socket.io/component-emitter 源码，
 * 因 pnpm 严格模式无法直接导入 @socket.io/component-emitter，
 * 且 socket.io-client 未从顶层导出这些辅助类型，故在此声明。
 *
 * 放置在 .d.ts 中以避免 ESLint no-unused-vars 对 infer 变量的误报。
 * 包裹在 namespace 中避免污染全局类型空间。
 */

declare namespace SocketIOTypes {
  // ---- @socket.io/component-emitter 核心类型 ----

  interface EventsMap {
    [event: string]: any
  }

  interface DefaultEventsMap {
    [event: string]: (...args: any[]) => void
  }

  type EventNames<Map extends EventsMap> = keyof Map & (string | symbol)

  type EventParams<Map extends EventsMap, Ev extends EventNames<Map>> = Parameters<Map[Ev]>

  // ---- socket.io-client 内部辅助类型 ----

  type Last<T extends any[]> = T extends [...infer H, infer L] ? L : any

  type AllButLast<T extends any[]> = T extends [...infer H, infer L] ? H : any[]

  type FirstArg<T> = T extends (arg: infer Param) => infer Result ? Param : any

  type DecorateAcknowledgements<E> = {
    [K in keyof E]: E[K] extends (...args: infer Params) => infer Result
      ? (...args: PrependTimeoutError<Params>) => Result
      : E[K]
  }

  type PrependTimeoutError<T extends any[]> = {
    [K in keyof T]: T[K] extends (...args: infer Params) => infer Result
      ? (err: Error, ...args: Params) => Result
      : T[K]
  }
}
