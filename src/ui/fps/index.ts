/**
 * Display current FPS
 */
export default class FPS {
  constructor() {
    this.box.className = 'fps'
    this.box.appendChild(this.fps)
    document.body.appendChild(this.box)
  }

  p1 = performance.now()
  p2 = performance.now()
  gap = performance.now()
  box = document.createElement('div')
  fps = document.createTextNode('FPS: 60')

  update = () => {
    this.p1 = performance.now()

    if (performance.now() - this.gap > 1000) {
      const delta = 1000 / (this.p1 - this.p2)

      this.box.firstChild && this.box.removeChild(this.box.firstChild)
      this.box.appendChild(document.createTextNode(`FPS: ${Math.round(delta)}`))

      this.gap = performance.now()
    }

    this.p2 = this.p1
  }
}
