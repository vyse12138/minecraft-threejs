import FPS from './fps'
import Bag from './bag'

export default class UI {
  constructor() {
    this.fps = new FPS()
    this.bag = new Bag()

    this.crossHair.className = 'cross-hair'
    this.crossHair.innerHTML = '+'
    document.body.appendChild(this.crossHair)

    this.play?.addEventListener('click', () => {
      this.onPlay()
    })
    this.source?.addEventListener('click', () => {
      window.open('https://yuleiz.com', '_blank')
    })
    this.feature?.addEventListener('click', () => {
      this.features?.classList.remove('hidden')
    })
    this.back?.addEventListener('click', () => {
      this.features?.classList.add('hidden')
    })
    this.exit?.addEventListener('click', () => {
      this.menu?.classList.add('start')
      this.play && (this.play.innerHTML = 'Play')
    })
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        this.onPlay()
      } else {
        this.onPause()
      }
    })

    document.addEventListener('contextmenu', e => {
      e.preventDefault()
    })
  }

  fps: FPS
  bag: Bag

  menu = document.querySelector('.menu')
  crossHair = document.createElement('div')

  play = document.querySelector('#play')
  control = document.querySelector('#control')
  source = document.querySelector('#source')
  feature = document.querySelector('#feature')
  back = document.querySelector('#back')
  exit = document.querySelector('#exit')

  features = document.querySelector('.features')

  onPlay = () => {
    this.menu?.classList.add('hidden')
    this.menu?.classList.remove('start')
    this.play && (this.play.innerHTML = 'Resume')
    this.crossHair.classList.remove('hidden')
  }
  onPause = () => {
    this.menu?.classList.remove('hidden')
    this.crossHair.classList.add('hidden')
  }
  update = () => {
    this.fps.update()
    this.bag.update()
  }
}
