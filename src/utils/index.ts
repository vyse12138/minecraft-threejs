export const htmlToDom = (html: string) => {
  const templateDom = document.createElement('template')

  templateDom.innerHTML = html

  return templateDom.content
}

export const useDevice = () => {
  const matcher = (reg: RegExp) => reg.test(navigator.userAgent)
  return {
    isAndroid: matcher(/Android/i),
    isIos: matcher(/iPhone|iPad|iPod/i),
    isIpad: matcher(/iPad/i),
    isIpod: matcher(/iPod/i),
    isIphone: matcher(/iPhone/i),
    isWeb: matcher(/Chrome|Firefox|Safari/i),
    isChrome: matcher(/Chrome/i),
    isFirefox: matcher(/Firefox/i),
    isSafari: matcher(/Safari/i),
    isEdge: matcher(/Edge/i),
    isIE: matcher(/MSIE/i),
    isMobile: matcher(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i),
  } as const
}
