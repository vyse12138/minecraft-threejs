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

  update = () => {
    this.p1 = performance.now()

    if (performance.now() - this.gap > 1000) {
      const delta = 1000 / (this.p1 - this.p2)

      this.fps.innerHTML = `FPS: ${Math.round(delta)}`

      this.gap = performance.now()
    }

    this.p2 = this.p1
  }
}
