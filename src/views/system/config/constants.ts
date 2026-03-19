import type { ConfigValueType } from './types'

export const CONFIG_VALUE_TYPE: Record<
  'TEXT' | 'NUMBER' | 'BOOLEAN' | 'TEXTAREA' | 'SELECT' | 'JSON' | 'PASSWORD' | 'IMAGE',
  ConfigValueType
> = {
  TEXT: 1,
  NUMBER: 2,
  BOOLEAN: 3,
  TEXTAREA: 4,
  SELECT: 5,
  JSON: 6,
  PASSWORD: 7,
  IMAGE: 8
}
