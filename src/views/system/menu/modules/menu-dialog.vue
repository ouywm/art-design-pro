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
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="disableMenuType">
          <ElRadioButton :value="1" label="1">菜单</ElRadioButton>
          <ElRadioButton :value="2" label="2">按钮</ElRadioButton>
        </ElRadioGroup>
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
  import { formatMenuTitle } from '@/utils/router'
  import { useWindowSize } from '@vueuse/core'

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   * @param label 标签文本
   * @param tooltip 提示文本
   * @returns 渲染函数
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
          label: formatMenuTitle(item.meta?.title || item.name || ''),
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

  const rules = computed<FormRules>(() => ({
    title: [
      { required: true, message: '请输入菜单标题', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authMark: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  }))

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => {
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

    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6

    if (form.menuType === 1) {
      return [
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
        { label: '路由名称', key: 'name', type: 'input', props: { placeholder: '如：SystemUser' } },
        {
          label: createLabelTooltip(
            '路由地址',
            '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
          ),
          key: 'path',
          type: 'input',
          props: { placeholder: '如：/dashboard 或 console' }
        },
        {
          label: createLabelTooltip(
            '组件路径',
            '一级父级菜单：填写 /index/index\n具体页面：填写组件路径（如 /system/user）\n目录菜单：留空'
          ),
          key: 'component',
          type: 'input',
          props: { placeholder: '如：/system/user 或留空' }
        },
        { label: '图标', key: 'icon', type: 'input', props: { placeholder: '如：ri:user-line' } },
        {
          label: '菜单排序',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        },
        {
          label: createLabelTooltip(
            '激活路径',
            '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'
          ),
          key: 'activePath',
          type: 'input',
          props: { placeholder: '如：/system/user' }
        },
        {
          label: '文本徽章',
          key: 'showTextBadge',
          type: 'input',
          props: { placeholder: '如：New、Hot' }
        },
        {
          label: '外部链接',
          key: 'link',
          type: 'input',
          props: { placeholder: '如：https://www.example.com' }
        },
        { label: '是否启用', key: 'enabled', type: 'switch', span: switchSpan },
        { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan },
        { label: '隐藏菜单', key: 'isHide', type: 'switch', span: switchSpan },
        { label: '是否内嵌', key: 'isIframe', type: 'switch', span: switchSpan },
        { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
        { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
        { label: '标签隐藏', key: 'isHideTab', type: 'switch', span: switchSpan },
        { label: '全屏页面', key: 'isFullPage', type: 'switch', span: switchSpan }
      ]
    } else {
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
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 1 ? '菜单' : '按钮'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  /**
   * 是否禁用菜单类型切换
   */
  const disableMenuType = computed(() => {
    if (isEdit.value) return true
    if (!isEdit.value && form.menuType === 1 && props.lockType) return true
    return false
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    // 手动重置所有字段为初始值，避免 undefined 导致字段不发送
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
  }

  /**
   * 加载表单数据（编辑模式）
   */
  const loadFormData = (): void => {
    if (!props.editData) return

    isEdit.value = true

    if (form.menuType === 1) {
      // 菜单类型
      const row = props.editData
      form.parentId = row.parentId || 0
      form.name = row.name || ''
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
    } else {
      // 按钮类型
      const row = props.editData
      form.parentId = row.parentId
      form.title = row.title || ''
      form.authName = row.authName || ''
      form.authMark = row.authMark || ''
      form.sort = row.sort ?? 1
      form.enabled = row.enabled ?? true
    }
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      // 根据菜单类型构建不同的请求数据
      if (form.menuType === 1) {
        // 菜单类型
        const menuData: Api.SystemManage.CreateMenuParams = {
          parentId: form.parentId,
          name: form.name!,
          path: form.path!,
          component: form.component,
          redirect: form.redirect,
          icon: form.icon,
          title: form.title!,
          link: form.link,
          isIframe: form.isIframe,
          isHide: form.isHide,
          isHideTab: form.isHideTab,
          isFullPage: form.isFullPage,
          isFirstLevel: form.isFirstLevel,
          keepAlive: form.keepAlive,
          fixedTab: form.fixedTab,
          showBadge: form.showBadge,
          showTextBadge: form.showTextBadge,
          activePath: form.activePath,
          sort: form.sort,
          enabled: form.enabled
        }
        emit('submit', menuData, 1)
      } else {
        // 按钮类型
        const buttonData: Api.SystemManage.CreateButtonParams = {
          parentId: form.parentId!,
          authName: form.authName!,
          authMark: form.authMark!,
          sort: form.sort,
          enabled: form.enabled
        }
        emit('submit', buttonData, 2)
      }

      ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
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
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        form.menuType = props.type
        nextTick(() => {
          if (props.editData?.id) {
            // 编辑模式：有 id 字段
            loadFormData()
          } else {
            // 新增模式：确保 sort 字段有默认值
            form.sort = 1
            // 如果 editData 有 parentId，说明是新增按钮（需要预设父菜单）
            if (props.editData?.parentId) {
              form.parentId = props.editData.parentId
            }
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.menuType = newType
      }
    }
  )
</script>
