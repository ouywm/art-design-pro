/**
 * 字典工具函数
 *
 * 提供便捷的字典访问方法
 *
 * ## 使用示例
 *
 * ```typescript
 * import { useDict } from '@/utils/dict'
 *
 * const { getDict, getDictLabel, getDictClass } = useDict()
 *
 * // 获取字典数据（用于下拉框）
 * const statusOptions = getDict('user_status')
 *
 * // 获取标签文本
 * const statusText = getDictLabel('user_status', 1) // '启用'
 *
 * // 获取样式类名
 * const statusClass = getDictClass('user_status', 1) // 'success'
 * ```
 *
 * @module utils/dict
 * @author Art Design Pro Team
 */
import { useDictStore } from '@/store/modules/dict'
import { storeToRefs } from 'pinia'

export type DictTagType = 'success' | 'warning' | 'danger' | 'info'

export interface DictMeta {
  label: string
  listClass: string
  tagType: DictTagType
}

/**
 * 字典工具函数
 * 提供便捷的字典数据访问方法
 */
export function useDict() {
  const dictStore = useDictStore()
  const { initialized } = storeToRefs(dictStore)
  const getDictTagType = (dictType: string, value: string | number): DictTagType => {
    return dictClassToTagType(dictStore.getDictClass(dictType, value))
  }
  const getDictMeta = (dictType: string, value: string | number): DictMeta => {
    const label = dictStore.getDictLabel(dictType, value)
    const listClass = dictStore.getDictClass(dictType, value)

    return {
      label,
      listClass,
      tagType: dictClassToTagType(listClass)
    }
  }

  return {
    // 状态
    initialized,

    // 获取字典数据
    getDict: dictStore.getDict,

    // 获取标签文本
    getDictLabel: dictStore.getDictLabel,

    // 获取样式类名
    getDictClass: dictStore.getDictClass,

    // 获取标签类型
    getDictTagType,

    // 获取字典展示元信息
    getDictMeta,

    // 检查字典类型是否存在
    hasDictType: dictStore.hasDictType,

    // 获取所有字典类型
    getDictTypes: dictStore.getDictTypes
  }
}

/**
 * 将字典的 listClass 转换为 Element Plus Tag 的 type
 * @param listClass 字典的 listClass（如 success, warning, danger）
 * @returns Element Plus Tag 的 type
 */
export function dictClassToTagType(listClass: string): DictTagType {
  const typeMap: Record<string, DictTagType> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    primary: 'info'
  }
  return typeMap[listClass] || 'info'
}
