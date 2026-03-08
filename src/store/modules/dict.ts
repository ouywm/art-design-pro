/**
 * 字典状态管理模块
 *
 * 提供全局字典数据管理
 *
 * ## 主要功能
 *
 * - 全局字典数据存储和访问
 * - 根据字典类型和值获取标签和样式
 *
 * ## 使用场景
 *
 * - 下拉框选项数据源
 * - 状态标签显示
 * - 枚举值转换为可读文本
 *
 * @module store/modules/dict
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 字典状态管理
 * 管理全局字典数据，提供便捷的访问方法
 */
export const useDictStore = defineStore('dict', () => {
  // ============================================================
  // 状态定义
  // ============================================================

  /** 字典数据存储 - key: dictType, value: 字典数据数组 */
  const dictData = ref<Record<string, Api.SystemManage.DictDataSimpleVo[]>>({})

  /** 是否已初始化 */
  const initialized = ref(false)

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 设置所有字典数据
   * 由外部调用 API 后传入数据
   * @param data 字典数据
   */
  const setDictData = (data: Record<string, Api.SystemManage.DictDataSimpleVo[]>) => {
    dictData.value = data
    initialized.value = true
    console.log('✅ 字典数据已设置', Object.keys(data))
  }

  /**
   * 设置单个字典类型的数据
   * @param dictType 字典类型编码
   * @param data 字典数据数组
   */
  const setDictByType = (dictType: string, data: Api.SystemManage.DictDataSimpleVo[]) => {
    dictData.value[dictType] = data
    console.log(`✅ 字典类型 [${dictType}] 已设置`)
  }

  /**
   * 清空字典数据
   * 用于登出或重置场景
   */
  const clearDict = () => {
    dictData.value = {}
    initialized.value = false
  }

  // ============================================================
  // Getters
  // ============================================================

  /**
   * 获取指定类型的字典数据
   * @param dictType 字典类型编码
   * @returns 字典数据数组
   */
  const getDict = computed(() => {
    return (dictType: string): Api.SystemManage.DictDataSimpleVo[] => {
      return dictData.value[dictType] || []
    }
  })

  /**
   * 根据字典类型和值获取标签文本
   * @param dictType 字典类型编码
   * @param value 字典值
   * @returns 标签文本，未找到时返回原值
   */
  const getDictLabel = computed(() => {
    return (dictType: string, value: string | number): string => {
      const dict = dictData.value[dictType]
      if (!dict) return String(value)
      const item = dict.find((item) => item.value === String(value))
      return item?.label || String(value)
    }
  })

  /**
   * 根据字典类型和值获取样式类名
   * @param dictType 字典类型编码
   * @param value 字典值
   * @returns 样式类名（如 success, warning, danger）
   */
  const getDictClass = computed(() => {
    return (dictType: string, value: string | number): string => {
      const dict = dictData.value[dictType]
      if (!dict) return ''
      const item = dict.find((item) => item.value === String(value))
      return item?.listClass || ''
    }
  })

  /**
   * 检查字典类型是否已加载
   * @param dictType 字典类型编码
   * @returns 是否已加载
   */
  const hasDictType = computed(() => {
    return (dictType: string): boolean => {
      return !!dictData.value[dictType]
    }
  })

  /**
   * 获取所有已加载的字典类型
   * @returns 字典类型编码数组
   */
  const getDictTypes = computed(() => {
    return Object.keys(dictData.value)
  })

  return {
    // 状态
    dictData,
    initialized,

    // Actions
    setDictData,
    setDictByType,
    clearDict,

    // Getters
    getDict,
    getDictLabel,
    getDictClass,
    hasDictType,
    getDictTypes
  }
})
