import { ERROR_TYPE, ERRORLEVEL } from './constant'
import { JsErrorDetails, ResourceErrorDetails } from '../../../public/types'
import browserViews from '@moinitor_sdk/browser-plugin-views'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

interface configDetails {
  user_id: string
  project_id: string // 项目ID
  plugin_instance: any // 插件实例
  is_report?: boolean // 是否上报
  env?: string // 环境
  is_track: true // 是否埋点
  interval: number // 埋点时间
}

function getId() {
  let uuid = localStorage.getItem('ze_monitor_uuid') || ''
  if (!uuid) {
    uuid = uuidv4()
    localStorage.setItem('ze_monitor_uuid', uuid)
  }
  return uuid
}

// 注册插件
function registerplugin(config: configDetails) {
  config.user_id = getId()
  if (config?.is_track) {
    browserViews.load(reportTrack, config)
  }
  window.addEventListener(
    'error',
    (e) => {
      reportError(e, config)
    },
    true,
  )
  window.addEventListener('unhandledrejection', (e) => {
    reportError(e, config)
  })
}

function reportError(e: ErrorEvent | PromiseRejectionEvent | Event, config: configDetails) {
  const requestParams = {
    project_id: config.project_id,
    env: config.env,
    is_report: config.is_report,
    error_url: window?.location?.href,
    user_id: config.user_id,
    ...parseError(e),
  }
  report(requestParams)
}

function report(reportInfo: JsErrorDetails | ResourceErrorDetails) {
  if (!reportInfo?.project_id || !reportInfo?.is_report) {
    console.log('请检查项目ID或是否允许上报')
    return
  }
  try {
    axios
      .post('/api/monitor/error/report', reportInfo)
      .then(() => {})
      .catch(() => {})
  } catch (error: any) {
    console.log('Error', error.message)
  }
}

function reportTrack(reportInfo: any) {
  try {
    axios
      .post('/api/monitor/view/report', reportInfo)
      .then(() => {})
      .catch(() => {})
  } catch (error: any) {
    console.log('Error', error.message)
  }
}

function parseError(e: ErrorEvent | PromiseRejectionEvent | Event) {
  if (e instanceof ErrorEvent) {
    return parseNormatlError(e)
  } else if (e instanceof PromiseRejectionEvent) {
    return parseUnhandledrejection(e)
  } else if (e instanceof Event) {
    return parseResourceError(e)
  }
}

// 同步报错
function parseNormatlError(e: ErrorEvent) {
  const { message, filename, lineno, colno, error, timeStamp } = e
  return {
    error_level: ERRORLEVEL.ERRORSERIOUS,
    error_type: ERROR_TYPE.JSERROR,
    time_stamp: timeStamp,
    error_info: message,
    resource_url: filename,
    line_no: lineno,
    col_no: colno,
    error_stack: error instanceof Error ? error.stack : JSON.stringify(error), // 防止报错不是Error对象
  }
}
// 异步报错
function parseUnhandledrejection(e: PromiseRejectionEvent) {
  const detail: any = {
    error_level: ERRORLEVEL.ERRORSERIOUS,
    error_type: ERROR_TYPE.UNJECTIONERROR,
    time_stamp: e?.timeStamp,
  }
  if (e.reason instanceof Error) {
    const { filename, lineno, colno } = parseStack(e?.reason?.stack || '')
    detail.error_info = e.reason.message
    detail.resource_url = filename
    detail.line_no = lineno
    detail.col_no = colno
    detail.error_stack = e.reason.stack
  } else {
    detail.error_stack = JSON.stringify(e.reason)
  }
  return detail
}
// 资源加载错误
function parseResourceError(e: Event) {
  const target = e?.target as HTMLElement
  return {
    error_level: ERRORLEVEL.ERRORWARNING,
    error_type: ERROR_TYPE.RESOURCEERROR,
    tag: target.nodeName,
    resource_url:
      (target instanceof HTMLScriptElement ? target.src : null) ||
      (target instanceof HTMLLinkElement ? target.href : null) ||
      'Unknown',
    outerHTML: target?.outerHTML,
    time_stamp: e?.timeStamp,
  }
}

function parseStack(stack: string) {
  try {
    if (!stack) return {}
    let regResults
    const getMatch = (str: string) => {
      return str.match(/\((.*?):(\d+):(\d+)\)$/)
    }
    const results = stack.split('\n')
    const first = getMatch(results[3]?.trim()?.split(' ')[1]) || ''
    const second = getMatch(results[1]?.trim()?.split(' ')[1]) || ''
    const third = getMatch(results[1]?.trim()?.split(' ')[2]) || ''
    if (first?.length >= 3) {
      regResults = first
    } else if (second?.length >= 3) {
      regResults = second
    } else if (third?.length >= 3) {
      regResults = third
    }
    const [, filename, lineno, colno] = regResults || []
    return { filename, lineno: +lineno, colno: +colno }
  } catch (err) {
    console.log(err)
    return {}
  }
}

export default {
  registerplugin,
}
