<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-auth="'add'" @click="handleAddMenu" v-ripple> 添加菜单 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="path"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :editData="editData"
        :lockType="lockMenuType"
        :menuTree="tableData"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { AppRouteRecord } from '@/types/router'
  import MenuDialog from './modules/menu-dialog.vue'
  import {
    fetchGetAllMenuList,
    fetchDeleteMenu,
    fetchCreateMenu,
    fetchCreateButton,
    fetchUpdateMenu,
    fetchUpdateButton
  } from '@/api/system-manage'
  import { ElMessageBox, ElTag } from 'element-plus'

  defineOptions({ name: 'Menus' })

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<Api.SystemManage.MenuType>(1)
  const editData = ref<AppRouteRecord | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 获取菜单列表数据
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true

    try {
      tableData.value = await fetchGetAllMenuList()
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取菜单类型标签颜色
   * @param row 菜单行数据
   * @returns 标签颜色类型
   */
  const getMenuTypeTag = (
    row: AppRouteRecord
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (row.meta?.isAuthButton) return 'danger'
    if (row.children?.length) return 'info'
    if (row.meta?.link && row.meta?.isIframe) return 'success'
    if (row.path) return 'primary'
    if (row.meta?.link) return 'warning'
    return 'info'
  }

  /**
   * 获取菜单类型文本
   * @param row 菜单行数据
   * @returns 菜单类型文本
   */
  const getMenuTypeText = (row: AppRouteRecord): string => {
    if (row.meta?.isAuthButton) return '按钮'
    if (row.children?.length) return '目录'
    if (row.meta?.link && row.meta?.isIframe) return '内嵌'
    if (row.path) return '菜单'
    if (row.meta?.link) return '外链'
    return '未知'
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '菜单名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => formatMenuTitle(row.meta?.title)
    },
    {
      prop: 'type',
      label: '菜单类型',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) return ''
        return row.meta?.link || row.path || ''
      }
    },
    {
      prop: 'meta.authList',
      label: '权限标识',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) {
          return row.meta?.authMark || ''
        }
        if (!row.meta?.authList?.length) return ''
        return `${row.meta.authList.length} 个权限标识`
      }
    },
    {
      prop: 'updateTime',
      label: '编辑时间',
      formatter: (row: AppRouteRecord) => row.updateTime || '-'
    },
    {
      prop: 'status',
      label: '状态',
      formatter: (row: AppRouteRecord) => {
        const enabled = row.meta?.enabled ?? true
        return h(ElTag, { type: enabled ? 'success' : 'info' }, () => (enabled ? '启用' : '禁用'))
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 220,
      align: 'right',
      formatter: (row: AppRouteRecord) => {
        const buttonStyle = { style: 'text-align: right' }

        if (row.meta?.isAuthButton) {
          return h('div', buttonStyle, [
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEditAuth(row)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDelete(row, '权限')
            })
          ])
        }

        return h('div', buttonStyle, [
          h(ArtButtonTable, {
            type: 'add',
            icon: 'ri:menu-add-line',
            onClick: () => handleAddChildMenu(row),
            title: '新增子菜单'
          }),
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => handleAddAuth(row),
            title: '新增权限'
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditMenu(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDelete(row)
          })
        ])
      }
    }
  ])

  // 数据相关
  const tableData = ref<AppRouteRecord[]>([])

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    getMenuList()
  }

  /**
   * 刷新菜单列表
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  const deepClone = <T,>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 将权限列表转换为子节点
   * @param items 菜单项数组
   * @returns 转换后的菜单项数组
   */
  const convertAuthListToChildren = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items.map((item) => {
      const clonedItem = deepClone(item)

      if (clonedItem.children?.length) {
        clonedItem.children = convertAuthListToChildren(clonedItem.children)
      }

      if (item.meta?.authList?.length) {
        const authChildren: AppRouteRecord[] = item.meta.authList.map(
          (auth: Api.SystemManage.AuthItem) => ({
            id: auth.id,
            path: `${item.path}_auth_${auth.authMark}`,
            name: `${String(item.name)}_auth_${auth.authMark}`,
            updateTime: auth.updateTime,
            meta: {
              title: auth.title,
              authMark: auth.authMark,
              sort: auth.sort ?? 1,
              enabled: auth.enabled ?? true,
              isAuthButton: true,
              parentPath: item.path
            }
          })
        )

        clonedItem.children = clonedItem.children?.length
          ? [...clonedItem.children, ...authChildren]
          : authChildren
      }

      return clonedItem
    })
  }

  /**
   * 搜索菜单
   * @param items 菜单项数组
   * @returns 搜索结果数组
   */
  const searchMenu = (items: AppRouteRecord[]): AppRouteRecord[] => {
    const results: AppRouteRecord[] = []

    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    const searchedData = searchMenu(tableData.value)
    return convertAuthListToChildren(searchedData)
  })

  /**
   * 打开对话框
   */
  const openDialog = (
    type: Api.SystemManage.MenuType,
    data: AppRouteRecord | Record<string, any> | null = null,
    lock = false
  ): void => {
    dialogType.value = type
    editData.value = data
    lockMenuType.value = lock
    dialogVisible.value = true
  }

  /**
   * 添加菜单
   */
  const handleAddMenu = (): void => openDialog(1, null, true)

  /**
   * 添加子菜单
   * @param row 父菜单行数据
   */
  const handleAddChildMenu = (row: AppRouteRecord): void =>
    openDialog(1, { parentId: row.id }, true)

  /**
   * 添加权限按钮
   * @param row 父菜单行数据
   */
  const handleAddAuth = (row: AppRouteRecord): void => openDialog(2, { parentId: row.id })

  /**
   * 编辑菜单
   * @param row 菜单行数据
   */
  const handleEditMenu = (row: AppRouteRecord): void => openDialog(1, row, true)

  /**
   * 编辑权限按钮
   * @param row 权限行数据
   */
  const handleEditAuth = (row: AppRouteRecord): void =>
    openDialog(2, {
      id: row.id,
      menuType: 2,
      title: row.meta?.title,
      authName: row.meta?.title,
      authMark: row.meta?.authMark,
      sort: row.meta?.sort || 1,
      enabled: row.meta?.enabled ?? true
    })

  /**
   * 提交表单数据
   * @param formData 表单数据
   * @param menuType 菜单类型
   */
  const handleSubmit = async (
    formData: Api.SystemManage.CreateMenuParams | Api.SystemManage.CreateButtonParams,
    menuType: Api.SystemManage.MenuType
  ): Promise<void> => {
    try {
      if (editData.value?.id) {
        // 编辑模式
        if (menuType === 1) {
          await fetchUpdateMenu(
            Number(editData.value.id),
            formData as Api.SystemManage.UpdateMenuParams
          )
        } else {
          await fetchUpdateButton(
            Number(editData.value.id),
            formData as Api.SystemManage.UpdateButtonParams
          )
        }
        ElMessage.success('更新成功')
      } else {
        // 新增模式
        if (menuType === 1) {
          await fetchCreateMenu(formData as Api.SystemManage.CreateMenuParams)
        } else {
          await fetchCreateButton(formData as Api.SystemManage.CreateButtonParams)
        }
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      getMenuList()
    } catch (error) {
      console.error('保存菜单失败:', error)
    }
  }

  /**
   * 删除菜单或权限
   * @param row 行数据
   * @param label 类型标签（菜单/权限）
   */
  const handleDelete = async (row: AppRouteRecord, label = '菜单'): Promise<void> => {
    if (!row.id) {
      ElMessage.error(`${label} ID 不存在`)
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除该${label}吗？删除后无法恢复`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await fetchDeleteMenu(Number(row.id))
      ElMessage.success('删除成功')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(`删除${label}失败:`, error)
      }
    }
  }

  /**
   * 切换展开/收起所有菜单
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>
