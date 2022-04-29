/**
 * Display current FPS
 */
export default class FPS {
  constructor() {
    this.fps.className = 'fps'
    this.fps.innerHTML = `FPS: 60`

    document.body.appendChild(this.fps)
  }

  p1 = performance.now()
  p2 = performance.now()
  gap = performance.now()
  fps = document.createElement('div')
  count = 0

  update = () => {
    this.p1 = performance.now()
    this.count++

    if (performance.now() - this.gap > 1000) {
      this.fps.innerHTML = `FPS: ${this.count}`
      this.gap = performance.now()
      this.count = 0
    }

    this.p2 = this.p1
  }
}
