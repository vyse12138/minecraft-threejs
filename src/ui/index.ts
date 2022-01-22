import FPS from './fps'

export default class UI {
  constructor() {
    this.fps = new FPS()
  }
  fps: FPS

  update = () => {
    this.fps.update()
  }
}
