type Config = {
  interval: number
}
const defaultConfig: Config = {
  interval: 60000,
  // 其他配置项
}
let addEventFlag = false // 防止同时触发popstate和hashchange
const screenWidth = window.screen.width
const screenHeight = window.screen.height

function getPath() {
  let path
  if (window.location.hash.includes('#')) {
    path = window.location.hash.split('#')[1]
  } else {
    path = window.location.pathname
  }
  return path
}

function handleRouterChange(url_list: any, path?: string) {
  if (addEventFlag) return
  addEventFlag = true
  const leaveTimestamp = new Date().getTime()
  url_list.push({
    initStamp: leaveTimestamp,
    path: path || getPath(),
  })
  // 计算上个页面停留时间
  if (url_list[url_list.length - 2]) {
    url_list[url_list.length - 2].timeStamp = leaveTimestamp - url_list[url_list.length - 2].initStamp
  }
  addEventFlag = false
}

function reportPV(report: Function, url_list: any, userConfig: any) {
  const leaveTimestamp = new Date().getTime()
  // 将最后一个页面的停留时间 计算出来
  url_list[url_list.length - 1].timeStamp = leaveTimestamp - url_list[url_list.length - 1].initStamp
  const list = url_list.map(({ timeStamp, path }: { timeStamp: number; path: string }) => ({ timeStamp, path }))
  report?.({
    resolution: `${screenWidth}x${screenHeight}`,
    project_id: userConfig.project_id,
    user_id: userConfig.user_id,
    url_list: list,
  })
}

function sendUnloadReport(url_list: any, userConfig: any) {
  const list = url_list.map(({ timeStamp, path }: { timeStamp: number; path: string }) => ({ timeStamp, path }))
  const formData = new FormData()
  formData.append('user_id', userConfig.user_id)
  formData.append('url_list', JSON.stringify(list))
  formData.append('project_id', userConfig.project_id)
  navigator.sendBeacon('/api/monitor/view/report', formData)
  url_list = []
}

function load(report: Function, config: Config) {
  const userConfig = { ...defaultConfig, ...config }
  let url_list: any[] = []

  window.addEventListener('popstate', function () {
    handleRouterChange(url_list)
  })

  window.addEventListener('hashchange', function () {
    handleRouterChange(url_list)
  })

  history.pushState = new Proxy(history.pushState, {
    apply: function (target, thisBinding, args: any) {
      handleRouterChange(url_list, thisBinding?.state?.forward)
      return target.apply(thisBinding, args)
    },
  })

  window.onload = function () {
    handleRouterChange(url_list)
    reportPV(report, url_list, userConfig)
  }

  window.addEventListener('unload', function () {
    sendUnloadReport(url_list, userConfig)
  })

  setInterval(() => {
    reportPV(report, url_list, userConfig)
    url_list = []
    handleRouterChange(url_list)
  }, userConfig.interval)
}

export default {
  load,
}
