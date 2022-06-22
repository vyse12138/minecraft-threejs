import FPS from './fps'
import Bag from './bag'
import Terrain from '../terrain'
import Block from '../terrain/mesh/block'
import Control from '../control'
import { Mode } from '../player'
import Joystick from './joystick'
import { isMobile } from '../utils'
import * as THREE from 'three'

export default class UI {
  constructor(terrain: Terrain, control: Control) {
    this.fps = new FPS()
    this.bag = new Bag()
    this.joystick = new Joystick(control)

    this.crossHair.className = 'cross-hair'
    this.crossHair.innerHTML = '+'
    document.body.appendChild(this.crossHair)

    // play
    this.play?.addEventListener('click', () => {
      if (this.play?.innerHTML === '开始游戏') {
        this.onPlay()

        // reset game
        terrain.noise.seed = Math.random()
        terrain.noise.stoneSeed = Math.random()
        terrain.noise.treeSeed = Math.random()
        terrain.noise.coalSeed = Math.random()
        terrain.noise.leafSeed = Math.random()
        terrain.customBlocks = []
        terrain.initBlocks()
        terrain.generate()
        terrain.camera.position.y = 40
        control.player.setMode(Mode.walking)
      }
      !isMobile && control.control.lock()
    })

    // save load
    this.save?.addEventListener('click', () => {
      if (this.save?.innerHTML === '保存并退出') {
        // save game
        window.localStorage.setItem(
          'block',
          JSON.stringify(terrain.customBlocks)
        )
        window.localStorage.setItem('seed', JSON.stringify(terrain.noise.seed))

        window.localStorage.setItem(
          'position',
          JSON.stringify({
            x: terrain.camera.position.x,
            y: terrain.camera.position.y,
            z: terrain.camera.position.z
          })
        )

        // ui update
        this.onExit()
        this.onSave()
      } else {
        // load game
        terrain.noise.seed =
          Number(window.localStorage.getItem('seed')) ?? Math.random()

        const customBlocks =
          (JSON.parse(
            window.localStorage.getItem('block') || 'null'
          ) as Block[]) ?? []

        terrain.customBlocks = customBlocks
        terrain.initBlocks()
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

        // ui update
        this.onPlay()
        this.onLoad()
        !isMobile && control.control.lock()
      }
    })

    // guide
    this.feature?.addEventListener('click', () => {
      this.features?.classList.remove('hidden')
    })
    this.back?.addEventListener('click', () => {
      this.features?.classList.add('hidden')
    })

    // setting
    this.setting?.addEventListener('click', () => {
      this.settings?.classList.remove('hidden')
    })
    this.settingBack?.addEventListener('click', () => {
      this.settings?.classList.add('hidden')
    })

    // render distance
    this.distanceInput?.addEventListener('input', (e: Event) => {
      if (this.distance && e.target instanceof HTMLInputElement) {
        this.distance.innerHTML = `渲染距离: ${e.target.value}`
      }
    })

    // fov
    this.fovInput?.addEventListener('input', (e: Event) => {
      if (this.fov && e.target instanceof HTMLInputElement) {
        this.fov.innerHTML = `视野: ${e.target.value}`
        control.camera.fov = parseInt(e.target.value)
        control.camera.updateProjectionMatrix()
      }
    })

    // music
    this.musicInput?.addEventListener('input', (e: Event) => {
      if (this.fov && e.target instanceof HTMLInputElement) {
        const disabled = e.target.value === '0'
        control.audio.disabled = disabled
        this.music!.innerHTML = `音乐: ${disabled ? '关' : '开'}`
      }
    })

    // apply settings
    this.settingBack?.addEventListener('click', () => {
      if (this.distanceInput instanceof HTMLInputElement) {
        terrain.distance = parseInt(this.distanceInput.value)
        terrain.maxCount =
          (terrain.distance * terrain.chunkSize * 2 + terrain.chunkSize) ** 2 +
          500

        terrain.initBlocks()
        terrain.generate()
        terrain.scene.fog = new THREE.Fog(
          0x87ceeb,
          1,
          terrain.distance * 24 + 24
        )
      }
    })

    // menu and fullscreen
    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      // menu
      if (e.key === 'e' && document.pointerLockElement) {
        !isMobile && control.control.unlock()
      }

      // fullscreen
      if (e.key === 'f') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.body.requestFullscreen()
        }
      }
    })

    // exit
    this.exit?.addEventListener('click', () => {
      this.onExit()
    })

    // play / pause handler
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        this.onPlay()
      } else {
        this.onPause()
      }
    })

    // disable context menu
    document.addEventListener('contextmenu', e => {
      e.preventDefault()
    })

    // fallback lock handler
    document.querySelector('canvas')?.addEventListener('click', (e: Event) => {
      e.preventDefault()
      !isMobile && control.control.lock()
    })
  }

  fps: FPS
  bag: Bag
  joystick: Joystick

  menu = document.querySelector('.menu')
  crossHair = document.createElement('div')

  // buttons
  play = document.querySelector('#play')
  control = document.querySelector('#control')
  setting = document.querySelector('#setting')
  feature = document.querySelector('#feature')
  back = document.querySelector('#back')
  exit = document.querySelector('#exit')
  save = document.querySelector('#save')

  // modals
  saveModal = document.querySelector('.save-modal')
  loadModal = document.querySelector('.load-modal')
  settings = document.querySelector('.settings')
  features = document.querySelector('.features')
  github = document.querySelector('.github')

  // settings
  distance = document.querySelector('#distance')
  distanceInput = document.querySelector('#distance-input')

  fov = document.querySelector('#fov')
  fovInput = document.querySelector('#fov-input')

  music = document.querySelector('#music')
  musicInput = document.querySelector('#music-input')

  settingBack = document.querySelector('#setting-back')

  onPlay = () => {
    isMobile && this.joystick.init()
    this.menu?.classList.add('hidden')
    this.menu?.classList.remove('start')
    this.play && (this.play.innerHTML = '继续游戏')
    this.crossHair.classList.remove('hidden')
    this.github && this.github.classList.add('hidden')
    this.feature?.classList.add('hidden')
  }

  onPause = () => {
    this.menu?.classList.remove('hidden')
    this.crossHair.classList.add('hidden')
    this.save && (this.save.innerHTML = '保存并退出')
    this.github && this.github.classList.remove('hidden')
  }

  onExit = () => {
    this.menu?.classList.add('start')
    this.play && (this.play.innerHTML = '开始游戏')
    this.save && (this.save.innerHTML = '加载游戏')
    this.feature?.classList.remove('hidden')
  }

  onSave = () => {
    this.saveModal?.classList.remove('hidden')
    setTimeout(() => {
      this.saveModal?.classList.add('show')
    })
    setTimeout(() => {
      this.saveModal?.classList.remove('show')
    }, 1000)

    setTimeout(() => {
      this.saveModal?.classList.add('hidden')
    }, 1350)
  }

  onLoad = () => {
    this.loadModal?.classList.remove('hidden')
    setTimeout(() => {
      this.loadModal?.classList.add('show')
    })
    setTimeout(() => {
      this.loadModal?.classList.remove('show')
    }, 1000)

    setTimeout(() => {
      this.loadModal?.classList.add('hidden')
    }, 1350)
  }

  update = () => {
    this.fps.update()
  }
}
