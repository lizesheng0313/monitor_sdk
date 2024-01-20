interface userConfig {
  project_id: string // 项目ID
  plugin_instance: any // 插件实例
  is_report?: boolean // 是否上报
  env?: string // 环境
}

const defaltConfig = {
  is_report: true, // 是否上报
  env: 'development', // 环境
  is_track: true, // 是否埋点
  interval: 60000, // 埋点时间
}

const init = (userConfig: userConfig) => {
  try {
    const config = {
      ...defaltConfig,
      ...userConfig,
    }
    // 插件实体
    if (!userConfig?.project_id || !config?.plugin_instance || !config?.is_report) {
      /* “console”用于将消息或数据记录到控制台。在此代码中，“console.error”用于在不满足某些条件时记录错误消息。 */
      console.error('请检查项目id|是否上报|相关插件')
      return
    }
    // 注册
    config?.plugin_instance?.registerplugin(config)
  } catch (err) {
    console.log('监听错误', err)
  }
}

export default {
  init,
}
