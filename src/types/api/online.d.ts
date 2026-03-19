declare namespace Api {
  /** 在线用户类型 */
  namespace Online {
    /** 在线用户列表 */
    type OnlineUserList = Api.Common.PaginatedResponse<OnlineUserVo>

    /** 在线用户项（对应后端 OnlineUserVo） */
    interface OnlineUserVo {
      /** 登录会话 ID（用于强制下线） */
      loginId: string
      /** 用户 ID */
      userId: number
      /** 用户名 */
      userName: string
      /** 昵称 */
      nickName: string
      /** 头像 */
      avatar: string
      /** 设备类型 */
      device: string
      /** 登录时间（Unix 毫秒时间戳） */
      loginTime: number
      /** 登录 IP */
      loginIp: string
      /** 登录位置 */
      loginLocation: string
    }

    /** 在线用户列表项别名 */
    type OnlineUserListItem = OnlineUserVo
  }
}
