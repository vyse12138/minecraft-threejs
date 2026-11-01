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
  coords = { x: 0, y: 0, z: 0 }

  setCoords = (x: number, y: number, z: number) => {
    this.coords.x = Math.floor(x)
    this.coords.y = Math.floor(y)
    this.coords.z = Math.floor(z)
  }
  update = () => {
    this.p1 = performance.now()
    this.count++

    if (performance.now() - this.gap > 1000) {
      this.fps.innerHTML = `FPS: ${this.count} XYZ: ${this.coords.x}, ${this.coords.y}, ${this.coords.z}`
      this.gap = performance.now()
      this.count = 0
    }

    this.p2 = this.p1
  }
}
