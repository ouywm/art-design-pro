/**
 * 表格全局配置模块
 *
 * 提供表格与后端接口的字段映射配置
 *
 * ## 后端分页格式
 *
 * 后端使用统一的 Page<T> 结构：
 * - content: 数据列表
 * - page: 当前页码
 * - size: 每页条数
 * - totalElements: 总元素数
 * - totalPages: 总页数
 *
 * @module utils/table/tableConfig
 * @author Art Design Pro Team
 */
export const tableConfig = {
  // 请求参数映射配置，前端发送请求时使用的分页参数名
  // useTable 组合式函数传递分页参数的时候 用 page 跟 size
  paginationKey: {
    // 当前页码
    page: 'page',
    // 每页大小
    size: 'size'
  }
}
