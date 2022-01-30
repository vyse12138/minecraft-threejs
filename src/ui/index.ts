import FPS from './fps'
import Bag from './bag'

export default class UI {
  constructor() {
    this.fps = new FPS()
    this.bag = new Bag()

    this.loading.className = 'loading'
    const loadingText = document.createElement('h1')
    loadingText.innerHTML = 'Loading...'
    loadingText.className = 'loading-text'
    this.loading.appendChild(loadingText)
    document.body.appendChild(this.loading)
  }

  fps: FPS
  bag: Bag

  loading = document.createElement('div')

  onLoad = () => {
    this.loading.classList.add('hidden')
  }

  update = () => {
    this.fps.update()
    this.bag.update()
  }
}
