import FPS from './fps'
import Bag from './bag'
import Terrain from '../terrain'
import Block from '../terrain/mesh/block'

export default class UI {
  constructor(terrain: Terrain) {
    this.fps = new FPS()
    this.bag = new Bag()

    this.crossHair.className = 'cross-hair'
    this.crossHair.innerHTML = '+'
    document.body.appendChild(this.crossHair)

    // play
    this.play?.addEventListener('click', () => {
      if (this.play?.innerHTML === 'Play') {
        this.onPlay()
        terrain.noise.seed = Math.random()
        terrain.noise.stoneSeed = Math.random()
        terrain.noise.treeSeed = Math.random()
        terrain.noise.coalSeed = Math.random()
        terrain.noise.leafSeed = Math.random()
        terrain.customBlocks = []

        terrain.generate()
        terrain.camera.position.y = 40
      }
    })

    // save load
    this.save?.addEventListener('click', () => {
      if (this.save?.innerHTML === 'Save and Exit') {
        // save game
        window.localStorage.setItem(
          'block',
          JSON.stringify(terrain.customBlocks)
        )
        window.localStorage.setItem('seed', JSON.stringify(terrain.noise.seed))
        window.localStorage.setItem(
          'treeSeed',
          JSON.stringify(terrain.noise.treeSeed)
        )
        window.localStorage.setItem(
          'stoneSeed',
          JSON.stringify(terrain.noise.stoneSeed)
        )
        window.localStorage.setItem(
          'coalSeed',
          JSON.stringify(terrain.noise.coalSeed)
        )
        window.localStorage.setItem(
          'leafSeed',
          JSON.stringify(terrain.noise.leafSeed)
        )
        window.localStorage.setItem(
          'position',
          JSON.stringify({
            x: terrain.camera.position.x,
            y: terrain.camera.position.y,
            z: terrain.camera.position.z
          })
        )
        this.menu?.classList.add('start')
        this.play && (this.play.innerHTML = 'Play')
        this.save && (this.save.innerHTML = 'Load Game')
        this.saveModal?.classList.remove('hidden')
        setTimeout(() => {
          this.saveModal?.classList.add('show')
        })
        setTimeout(() => {
          this.saveModal?.classList.remove('show')
        }, 1000)

        setTimeout(() => {
          this.saveModal?.classList.add('hidden')
        }, 1500)
      } else {
        // load game
        terrain.noise.seed =
          Number(window.localStorage.getItem('seed')) ?? Math.random()
        terrain.noise.treeSeed =
          Number(window.localStorage.getItem('treeSeed')) ?? Math.random()
        terrain.noise.stoneSeed =
          Number(window.localStorage.getItem('stoneSeed')) ?? Math.random()
        terrain.noise.coalSeed =
          Number(window.localStorage.getItem('coalSeed')) ?? Math.random()
        terrain.noise.leafSeed =
          Number(window.localStorage.getItem('leafSeed')) ?? Math.random()

        const customBlocks =
          (JSON.parse(
            window.localStorage.getItem('block') || 'null'
          ) as Block[]) ?? []

        terrain.customBlocks = customBlocks
        terrain.generate()

        const position =
          (JSON.parse(window.localStorage.getItem('position') || 'null') as {
            x: number
            y: number
            z: number
          }) ?? null

        position && (terrain.camera.position.x = position.x)
        position && (terrain.camera.position.y = position.y)
        position && (terrain.camera.position.z = position.z)
        this.onPlay()
      }
    })

    // guide
    this.feature?.addEventListener('click', () => {
      this.features?.classList.remove('hidden')
    })
    this.back?.addEventListener('click', () => {
      this.features?.classList.add('hidden')
    })

    // source
    this.source?.addEventListener('click', () => {
      window.open('https://github.com/Vyse12138/minecraft-threejs', '_blank')
    })

    // exit
    this.exit?.addEventListener('click', () => {
      this.menu?.classList.add('start')
      this.play && (this.play.innerHTML = 'Play')
      this.save && (this.save.innerHTML = 'Load Game')
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
  save = document.querySelector('#save')

  saveModal = document.querySelector('.save-modal')
  features = document.querySelector('.features')

  onPlay = () => {
    this.menu?.classList.add('hidden')
    this.menu?.classList.remove('start')
    this.play && (this.play.innerHTML = 'Resume')
    this.crossHair.classList.remove('hidden')
    this.save && (this.save.innerHTML = 'Load Game')
  }

  onPause = () => {
    this.menu?.classList.remove('hidden')
    this.crossHair.classList.add('hidden')
    this.save && (this.save.innerHTML = 'Save and Exit')
  }

  update = () => {
    this.fps.update()
    this.bag.update()
  }
}
