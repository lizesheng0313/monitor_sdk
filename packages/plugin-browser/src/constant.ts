export const ERROR_TYPE = {
  JSERROR: 'uncaught', // 同步错误
  WSERROR: 'websocket', // websocket错误
  UNJECTIONERROR: 'unhandledrejection', // 异步错误
  RESOURCEERROR: 'resourceError', // 资源错误
  BLANKSCREENERROR: 'blank_screen_error', // 白屏错误
  XHRERROR: 'httpError', // 请求错误
}

export const ERRORLEVEL = {
  ERRORFATAL: 'error_fatal',
  ERRORSERIOUS: 'error_serious',
  ERRORWARNING: 'error_warning',
}
