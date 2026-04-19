<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :validate-on-rule-change="false"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="menuKind" :disabled="disableMenuKind">
          <ElRadioButton value="catalog">目录</ElRadioButton>
          <ElRadioButton value="menu">菜单</ElRadioButton>
          <ElRadioButton value="link">外链</ElRadioButton>
          <ElRadioButton value="iframe">内嵌</ElRadioButton>
          <ElRadioButton value="button">按钮</ElRadioButton>
        </ElRadioGroup>
      </template>

      <template #icon>
        <ArtIconPicker v-model="form.icon" mode="dialog" placeholder="请选择菜单图标" />
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { AppRouteRecord } from '@/types/router'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import ArtIconPicker from '@/components/core/forms/art-icon-picker/index.vue'
  import { formatMenuTitle } from '@/utils/router'
  import { useWindowSize } from '@vueuse/core'

  const { width } = useWindowSize()

  /** UI 级菜单类型：目录 / 菜单 / 外链 / 内嵌 / 按钮 */
  type MenuKind = 'catalog' | 'menu' | 'link' | 'iframe' | 'button'

  /**
   * 创建带 tooltip 的表单标签
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top'
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface Props {
    visible: boolean
    editData?: AppRouteRecord | any
    type?: Api.SystemManage.MenuType
    lockType?: boolean
    menuTree?: AppRouteRecord[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (
      e: 'submit',
      data: Api.SystemManage.CreateMenuParams | Api.SystemManage.CreateButtonParams,
      menuType: Api.SystemManage.MenuType
    ): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 1,
    lockType: false,
    menuTree: () => []
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = ref(false)
  const menuKind = ref<MenuKind>('menu')

  /**
   * 从 editData 反推 MenuKind
   * 判定顺序：按钮 > 内嵌 > 外链 > 目录（无 component）> 菜单
   */
  const detectMenuKind = (row: AppRouteRecord | Record<string, any>): MenuKind => {
    if (!row) return 'menu'
    if (row.meta?.isAuthButton || row.menuType === 2) return 'button'
    if (row.meta?.link && row.meta?.isIframe) return 'iframe'
    if (row.meta?.link) return 'link'
    if (!row.component) return 'catalog'
    return 'menu'
  }

  /**
   * 将菜单树转为 ElTreeSelect 数据格式
   * 编辑时排除自身及其子菜单（避免循环引用）
   */
  const parentTreeData = computed(() => {
    const currentId = isEdit.value ? props.editData?.id : null

    const convert = (items: AppRouteRecord[]): any[] => {
      return items
        .filter((item) => !item.meta?.isAuthButton && item.id !== currentId)
        .map((item) => ({
          value: item.id,
          label: formatMenuTitle(
            item.meta?.title || (typeof item.name === 'string' ? item.name : '')
          ),
          children: item.children?.length ? convert(item.children) : undefined
        }))
    }

    return [{ value: 0, label: '顶级菜单（无父级）', children: convert(props.menuTree) }]
  })

  const form = reactive<Api.SystemManage.MenuFormData>({
    menuType: 1,
    parentId: 0,
    name: '',
    path: '',
    component: '',
    redirect: '',
    icon: '',
    title: '',
    link: '',
    isIframe: false,
    isHide: false,
    isHideTab: false,
    isFullPage: false,
    isFirstLevel: false,
    keepAlive: false,
    fixedTab: false,
    showBadge: false,
    showTextBadge: '',
    activePath: '',
    authName: '',
    authMark: '',
    sort: 1,
    enabled: true
  })

  /**
   * 校验规则：按 menuKind 动态生成
   */
  const rules = computed<FormRules>(() => {
    if (menuKind.value === 'button') {
      return {
        authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
        authMark: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
      }
    }

    const common: FormRules = {
      title: [
        { required: true, message: '请输入菜单标题', trigger: 'blur' },
        { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
      ],
      name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }]
    }

    if (menuKind.value === 'link') {
      return {
        ...common,
        link: [{ required: true, message: '请输入外部链接', trigger: 'blur' }]
      }
    }

    if (menuKind.value === 'iframe') {
      return {
        ...common,
        path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
        link: [{ required: true, message: '请输入内嵌链接', trigger: 'blur' }]
      }
    }

    if (menuKind.value === 'menu') {
      return {
        ...common,
        path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
        component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
      }
    }

    // catalog
    return {
      ...common,
      path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
    }
  })

  /**
   * 表单项配置：按 menuKind 动态生成
   */
  const formItems = computed<FormItem[]>(() => {
    const switchSpan = width.value < 640 ? 12 : 6

    const baseItems: FormItem[] = [
      { label: '菜单类型', key: 'menuType', span: 24 },
      {
        label: '父级菜单',
        key: 'parentId',
        type: 'treeselect',
        props: {
          data: parentTreeData.value,
          checkStrictly: true,
          renderAfterExpand: false,
          defaultExpandedKeys: [0],
          placeholder: '请选择父级菜单',
          style: { width: '100%' }
        }
      }
    ]

    // 按钮类型：独立字段集
    if (menuKind.value === 'button') {
      return [
        ...baseItems,
        {
          label: '权限名称',
          key: 'authName',
          type: 'input',
          props: { placeholder: '如：新增、编辑、删除' }
        },
        {
          label: '权限标识',
          key: 'authMark',
          type: 'input',
          props: { placeholder: '如：add、edit、delete' }
        },
        {
          label: '权限排序',
          key: 'sort',
          type: 'number',
          props: { min: 0, controlsPosition: 'right', style: { width: '100%' } }
        },
        { label: '是否启用', key: 'enabled', type: 'switch', span: switchSpan }
      ]
    }

    // 菜单系四种类型的字段集合
    const items: FormItem[] = [
      ...baseItems,
      {
        label: createLabelTooltip(
          '菜单标题',
          '可直接填写文本（如：用户管理）\n或使用国际化键名（如：menus.system.user）'
        ),
        key: 'title',
        type: 'input',
        props: { placeholder: '如：用户管理 或 menus.system.user' }
      },
      {
        label: '路由名称',
        key: 'name',
        type: 'input',
        props: { placeholder: '如：SystemUser' }
      }
    ]

    // 外链类型不需要路由地址；其他三种需要
    if (menuKind.value !== 'link') {
      items.push({
        label: createLabelTooltip(
          '路由地址',
          '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
        ),
        key: 'path',
        type: 'input',
        props: { placeholder: '如：/dashboard 或 console' }
      })
    }

    // 组件路径：仅普通菜单
    if (menuKind.value === 'menu') {
      items.push({
        label: createLabelTooltip(
          '组件路径',
          '具体页面：填写组件路径（如 /system/user）\n一级父级菜单：填写 /index/index'
        ),
        key: 'component',
        type: 'input',
        props: { placeholder: '如：/system/user 或 /index/index' }
      })
    }

    // 外部链接：外链 / 内嵌
    if (menuKind.value === 'link' || menuKind.value === 'iframe') {
      items.push({
        label: menuKind.value === 'iframe' ? '内嵌链接' : '外部链接',
        key: 'link',
        type: 'input',
        props: { placeholder: '如：https://www.example.com' }
      })
    }

    // 图标（所有菜单系类型都展示，通过 ArtForm 的 #icon 插槽渲染 ArtIconPicker）
    items.push({ label: '图标', key: 'icon' })

    // 排序
    items.push({
      label: '菜单排序',
      key: 'sort',
      type: 'number',
      props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
    })

    // 激活路径：目录 / 菜单
    if (menuKind.value === 'catalog' || menuKind.value === 'menu') {
      items.push({
        label: createLabelTooltip(
          '激活路径',
          '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'
        ),
        key: 'activePath',
        type: 'input',
        props: { placeholder: '如：/system/user' }
      })
    }

    // 文本徽章：仅普通菜单
    if (menuKind.value === 'menu') {
      items.push({
        label: '文本徽章',
        key: 'showTextBadge',
        type: 'input',
        props: { placeholder: '如：New、Hot' }
      })
    }

    // 开关类字段：按类型展示
    items.push({ label: '是否启用', key: 'enabled', type: 'switch', span: switchSpan })

    if (menuKind.value !== 'link') {
      items.push({ label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan })
    }

    items.push({ label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan })

    if (menuKind.value === 'menu') {
      items.push(
        { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
        { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
        { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan },
        { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan }
      )
    }

    return items
  })

  const kindLabelMap: Record<MenuKind, string> = {
    catalog: '目录',
    menu: '菜单',
    link: '外链',
    iframe: '内嵌',
    button: '按钮'
  }

  const dialogTitle = computed(() => {
    const label = kindLabelMap[menuKind.value]
    return isEdit.value ? `编辑${label}` : `新建${label}`
  })

  /**
   * 是否禁用类型切换
   * 编辑时锁定；显式 lockType 也锁定（如新增权限入口）
   */
  const disableMenuKind = computed(() => isEdit.value || props.lockType)

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    Object.assign(form, {
      menuType: 1,
      parentId: 0,
      name: '',
      path: '',
      component: '',
      redirect: '',
      icon: '',
      title: '',
      link: '',
      isIframe: false,
      isHide: false,
      isHideTab: false,
      isFullPage: false,
      isFirstLevel: false,
      keepAlive: false,
      fixedTab: false,
      showBadge: false,
      showTextBadge: '',
      activePath: '',
      authName: '',
      authMark: '',
      sort: 1,
      enabled: true
    })
    menuKind.value = props.type === 2 ? 'button' : 'menu'
  }

  /**
   * 加载表单数据（编辑模式）
   * 调用前 menuKind 应已由 detectMenuKind 设置
   */
  const loadFormData = (): void => {
    if (!props.editData) return

    const row = props.editData

    if (menuKind.value === 'button') {
      form.parentId = row.parentId
      form.title = row.title || row.meta?.title || ''
      form.authName = row.authName || row.meta?.title || ''
      form.authMark = row.authMark || row.meta?.authMark || ''
      form.sort = row.sort ?? row.meta?.sort ?? 1
      form.enabled = row.enabled ?? row.meta?.enabled ?? true
      form.menuType = 2
      return
    }

    form.parentId = row.parentId || 0
    form.name = typeof row.name === 'string' ? row.name : ''
    form.path = row.path || ''
    form.component = row.component || ''
    form.redirect = row.redirect || ''
    form.icon = row.meta?.icon || ''
    form.title = row.meta?.title || ''
    form.link = row.meta?.link || ''
    form.isIframe = row.meta?.isIframe ?? false
    form.isHide = row.meta?.isHide ?? false
    form.isHideTab = row.meta?.isHideTab ?? false
    form.isFullPage = row.meta?.isFullPage ?? false
    form.isFirstLevel = row.meta?.isFirstLevel ?? false
    form.keepAlive = row.meta?.keepAlive ?? false
    form.fixedTab = row.meta?.fixedTab ?? false
    form.showBadge = row.meta?.showBadge ?? false
    form.showTextBadge = row.meta?.showTextBadge || ''
    form.activePath = row.meta?.activePath || ''
    form.sort = row.meta?.sort ?? 1
    form.enabled = row.meta?.enabled ?? true
    form.menuType = 1
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 按钮权限
      if (menuKind.value === 'button') {
        const buttonData: Api.SystemManage.CreateButtonParams = {
          parentId: form.parentId!,
          authName: form.authName!,
          authMark: form.authMark!,
          sort: form.sort,
          enabled: form.enabled
        }
        emit('submit', buttonData, 2)
        handleCancel()
        return
      }

      // 菜单系：按 kind 装配字段，清洗无关值
      const kind = menuKind.value
      const menuData: Api.SystemManage.CreateMenuParams = {
        parentId: form.parentId,
        name: form.name!,
        path: kind === 'link' ? '' : form.path!,
        component: kind === 'menu' ? form.component : '',
        redirect: form.redirect,
        icon: form.icon,
        title: form.title!,
        link: kind === 'link' || kind === 'iframe' ? form.link : '',
        isIframe: kind === 'iframe',
        isHide: form.isHide,
        isHideTab: kind === 'menu' ? form.isHideTab : false,
        isFullPage: kind === 'menu' ? form.isFullPage : false,
        isFirstLevel: form.isFirstLevel,
        keepAlive: kind === 'link' ? false : form.keepAlive,
        fixedTab: kind === 'menu' ? form.fixedTab : false,
        showBadge: kind === 'menu' ? form.showBadge : false,
        showTextBadge: kind === 'menu' ? form.showTextBadge : '',
        activePath: kind === 'catalog' || kind === 'menu' ? form.activePath : '',
        sort: form.sort,
        enabled: form.enabled
      }
      emit('submit', menuData, 1)
      handleCancel()
    } catch {
      ElMessage.error('表单校验失败，请检查输入')
    }
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    isEdit.value = false
  }

  /**
   * 切换 menuKind 时同步 menuType 并重置与新类型无关的字段
   * 编辑模式下类型锁定，watcher 不会被触发
   */
  watch(menuKind, (newKind) => {
    if (isEdit.value) return
    form.menuType = newKind === 'button' ? 2 : 1

    switch (newKind) {
      case 'catalog':
        form.component = ''
        form.link = ''
        form.isIframe = false
        form.showTextBadge = ''
        form.fixedTab = false
        form.showBadge = false
        form.isHideTab = false
        form.isFullPage = false
        break
      case 'menu':
        form.link = ''
        form.isIframe = false
        break
      case 'link':
        form.path = ''
        form.component = ''
        form.isIframe = false
        form.activePath = ''
        form.showTextBadge = ''
        form.fixedTab = false
        form.showBadge = false
        form.keepAlive = false
        form.isHideTab = false
        form.isFullPage = false
        break
      case 'iframe':
        form.component = ''
        form.isIframe = true
        form.activePath = ''
        form.showTextBadge = ''
        form.fixedTab = false
        form.showBadge = false
        form.isHideTab = false
        form.isFullPage = false
        break
      case 'button':
        form.path = ''
        form.component = ''
        form.link = ''
        form.isIframe = false
        form.icon = ''
        break
    }

    // 切换类型后清除已有的校验提示，避免新/旧字段残留错误
    nextTick(() => {
      formRef.value?.clearValidate?.()
    })
  })

  /**
   * 监听对话框显示状态
   * 先定 isEdit + menuKind，再走数据加载，避免 kind watcher 误触发清洗
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (!newVal) return

      isEdit.value = Boolean(props.editData?.id)

      if (isEdit.value) {
        menuKind.value = detectMenuKind(props.editData)
      } else {
        menuKind.value = props.type === 2 ? 'button' : 'menu'
      }
      form.menuType = menuKind.value === 'button' ? 2 : 1

      nextTick(() => {
        if (isEdit.value) {
          loadFormData()
        } else {
          form.sort = 1
          if (props.editData?.parentId) {
            form.parentId = props.editData.parentId
          }
        }
      })
    }
  )

  /**
   * 监听外部传入的 type 变化（非编辑模式下同步 kind）
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible && !isEdit.value) {
        menuKind.value = newType === 2 ? 'button' : 'menu'
      }
    }
  )
</script>
