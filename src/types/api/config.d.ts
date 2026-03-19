declare namespace Api {
  /** 系统参数分组类型 */
  namespace ConfigGroup {
    /** 系统参数分组列表 */
    type ConfigGroupList = Api.Common.PaginatedResponse<ConfigGroupVo>

    /** 系统参数分组项（对应后端 ConfigGroupVo） */
    interface ConfigGroupVo {
      /** 分组ID */
      id: number
      /** 分组名称 */
      groupName: string
      /** 分组编码 */
      groupCode: string
      /** 分组排序 */
      groupSort: number
      /** 是否启用 */
      enabled: boolean
      /** 是否系统内置 */
      isSystem: boolean
      /** 备注 */
      remark: string
      /** 创建人 */
      createBy: string
      /** 创建时间 */
      createTime: string
      /** 更新人 */
      updateBy: string
      /** 更新时间 */
      updateTime: string
    }

    /** 系统参数分组筛选字段（对应后端 ConfigGroupQueryDto） */
    interface ConfigGroupSearchFilters {
      /** 分组ID */
      id?: number
      /** 分组名称 */
      groupName?: string
      /** 分组编码 */
      groupCode?: string
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
    }

    /** 系统参数分组查询参数 */
    interface ConfigGroupSearchParams
      extends Api.Common.CommonSearchParams,
        ConfigGroupSearchFilters {}

    /** 创建系统参数分组参数（对应后端 CreateConfigGroupDto） */
    interface CreateConfigGroupParams {
      /** 分组名称 */
      groupName: string
      /** 分组编码 */
      groupCode: string
      /** 分组排序 */
      groupSort?: number
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
      /** 备注 */
      remark?: string
    }

    /** 更新系统参数分组参数（对应后端 UpdateConfigGroupDto） */
    interface UpdateConfigGroupParams {
      /** 分组名称 */
      groupName?: string
      /** 分组排序 */
      groupSort?: number
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
      /** 备注 */
      remark?: string
    }
  }

  /** 系统参数配置类型 */
  namespace Config {
    /** 值类型（对应后端 sys_config::ValueType） */
    type ConfigValueType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

    /** 系统参数配置筛选字段（对应后端 ConfigQueryDto） */
    interface ConfigQueryFilters {
      /** 配置ID */
      id?: number
      /** 配置名称 */
      configName?: string
      /** 配置键 */
      configKey?: string
      /** 值类型 */
      valueType?: ConfigValueType
      /** 候选项字典类型编码 */
      optionDictType?: string
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
      /** 创建时间开始 */
      createTimeStart?: string
      /** 创建时间结束 */
      createTimeEnd?: string
      /** 更新时间开始 */
      updateTimeStart?: string
      /** 更新时间结束 */
      updateTimeEnd?: string
    }

    /** 配置分组筛选字段（对应后端 ConfigGroupFilterQueryDto） */
    interface ConfigGroupFilterQuery {
      /** 配置分组ID */
      configGroupId?: number
      /** 配置分组名称 */
      configGroupName?: string
      /** 配置分组编码 */
      configGroupCode?: string
    }

    /** 按分组查询参数（对应后端 ConfigGroupedQueryDto） */
    interface ConfigGroupedQueryParams extends ConfigQueryFilters, ConfigGroupFilterQuery {}

    /** 分组内配置项（对应后端 ConfigGroupItemVo） */
    interface ConfigGroupItemVo {
      /** 配置ID */
      id: number
      /** 配置名称 */
      configName: string
      /** 配置键 */
      configKey: string
      /** 当前配置值 */
      configValue: string
      /** 默认配置值 */
      defaultValue: string
      /** 值类型 */
      valueType: ConfigValueType
      /** 候选项字典类型编码 */
      optionDictType: string
      /** 同分组内排序 */
      configSort: number
      /** 是否启用 */
      enabled: boolean
      /** 是否系统内置 */
      isSystem: boolean
      /** 备注 */
      remark: string
    }

    /** 配置分组块（对应后端 ConfigGroupBlockVo） */
    interface ConfigGroupBlockVo {
      /** 分组ID */
      groupId: number
      /** 分组名称 */
      groupName: string
      /** 分组编码 */
      groupCode: string
      /** 分组排序 */
      groupSort: number
      /** 分组下配置项 */
      items: ConfigGroupItemVo[]
    }

    /** 按分组查询返回结果 */
    type ConfigGroupedList = ConfigGroupBlockVo[]

    /** 系统参数配置详情（对应后端 ConfigDetailVo） */
    interface ConfigDetailVo {
      /** 配置ID */
      id: number
      /** 配置名称 */
      configName: string
      /** 配置键 */
      configKey: string
      /** 当前配置值 */
      configValue: string
      /** 默认配置值 */
      defaultValue: string
      /** 值类型 */
      valueType: ConfigValueType
      /** 配置分组ID */
      configGroupId: number
      /** 配置分组名称 */
      configGroupName: string
      /** 配置分组编码 */
      configGroupCode: string
      /** 候选项字典类型编码 */
      optionDictType: string
      /** 同分组内排序 */
      configSort: number
      /** 是否启用 */
      enabled: boolean
      /** 是否系统内置 */
      isSystem: boolean
      /** 备注 */
      remark: string
      /** 创建人 */
      createBy: string
      /** 创建时间 */
      createTime: string
      /** 更新人 */
      updateBy: string
      /** 更新时间 */
      updateTime: string
    }

    /** 创建系统参数配置参数（对应后端 CreateConfigDto） */
    interface CreateConfigParams {
      /** 配置名称 */
      configName: string
      /** 配置键 */
      configKey: string
      /** 当前配置值 */
      configValue?: string
      /** 默认配置值 */
      defaultValue?: string
      /** 值类型 */
      valueType?: ConfigValueType
      /** 配置分组ID */
      configGroupId: number
      /** 候选项字典类型编码 */
      optionDictType?: string
      /** 同分组内排序 */
      configSort?: number
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
      /** 备注 */
      remark?: string
    }

    /** 更新系统参数配置参数（对应后端 UpdateConfigDto） */
    interface UpdateConfigParams {
      /** 配置名称 */
      configName?: string
      /** 配置键 */
      configKey?: string
      /** 当前配置值 */
      configValue?: string
      /** 默认配置值 */
      defaultValue?: string
      /** 值类型 */
      valueType?: ConfigValueType
      /** 配置分组ID */
      configGroupId?: number
      /** 候选项字典类型编码 */
      optionDictType?: string
      /** 同分组内排序 */
      configSort?: number
      /** 是否启用 */
      enabled?: boolean
      /** 是否系统内置 */
      isSystem?: boolean
      /** 备注 */
      remark?: string
    }

    /** 配置值（对应后端 ConfigValueVo） */
    interface ConfigValueVo {
      /** 配置名称 */
      configName: string
      /** 配置键 */
      configKey: string
      /** 当前配置值 */
      configValue: string
      /** 默认配置值 */
      defaultValue: string
      /** 值类型 */
      valueType: ConfigValueType
      /** 候选项字典类型编码 */
      optionDictType: string
    }

    /** 批量获取配置参数（对应后端 ConfigKeysDto） */
    interface ConfigKeysParams {
      /** 配置键列表 */
      configKeys: string[]
    }
  }
}
