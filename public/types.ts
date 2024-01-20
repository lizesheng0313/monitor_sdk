enum ErrorType {
  JSERROR = 'uncaught', // 同步错误
  WSERROR = 'websocket', // websocket错误
  UNJECTIONERROR = 'unhandledrejection', // 异步错误
  RESOURCEERROR = 'resourceError', // 资源错误
  WHITEERROR = 'whiteError', // 白屏错误
  XHRERROR = 'httpError', // 请求错误
}

export type JsErrorDetails = {
  is_report: boolean
  env?: string // 环境
  project_id: string
  error_type: ErrorType.JSERROR | ErrorType.UNJECTIONERROR // 错误类型
  error_info: string // 错误信息
  resource_url: string // 资源文件地址
  line_no: number // 错误行数
  col_no: number // 错误列数
  error_stack: string // 错误堆栈
  time_stamp: number
}

export type ResourceErrorDetails = {
  is_report: boolean
  env?: string // 环境
  project_id: string
  error_type: ErrorType.RESOURCEERROR
  tag: string // 加载出错的资源标签
  resource_url: string // 资源地址
  outer_html: string // html
  time_stamp: number
}
