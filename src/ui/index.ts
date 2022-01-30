import FPS from './fps'
import Bag from './bag'

export default class UI {
  constructor() {
    this.fps = new FPS()
    this.bag = new Bag()
  }
  fps: FPS
  bag: Bag
  update = () => {
    this.fps.update()
    this.bag.update()
  }
}
