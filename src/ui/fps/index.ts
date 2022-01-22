export default class FPS {
  constructor() {
    this.box.id = 'fps'
    this.box.appendChild(this.fps)
    document.body.appendChild(this.box)
  }

  p1 = performance.now()
  p2 = performance.now()
  box = document.createElement('div')
  fps = document.createTextNode('FPS: 60')
  count = 0

  update = () => {
    this.p1 = performance.now()

    if (this.count === 60) {
      const delta = 1000 / (this.p1 - this.p2)
      this.box.firstChild && this.box.removeChild(this.box.firstChild)
      this.fps = document.createTextNode(`FPS: ${Math.round(delta)}`)
      this.box.appendChild(this.fps)

      this.count = 1
    }

    this.count += 1
    this.p2 = this.p1
  }
}
