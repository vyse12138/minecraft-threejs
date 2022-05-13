export const htmlToDom = (html: string) => {
  const templateDom = document.createElement('template')
  templateDom.innerHTML = html
  window.document.body.appendChild(templateDom.content)
}

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
  navigator.userAgent
)
