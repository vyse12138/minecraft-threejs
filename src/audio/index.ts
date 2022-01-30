import * as THREE from 'three'
import Control from '../control'
import UI from '../ui'
import bgm from './musics/hal3.ogg'

export default class Audio {
  constructor(camera: THREE.PerspectiveCamera, ui: UI, control: Control) {
    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()
    camera.add(this.listener)

    this.bgm = new THREE.Audio(this.listener)
    this.audioLoader.load(bgm, buffer => {
      this.bgm.setBuffer(buffer)
      this.bgm.setVolume(0.05)
      this.bgm.setLoop(true)

      ui.onLoad()
      control.initEventListeners()
    })

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement && !this.bgm.isPlaying) {
        this.bgm.play()
      } else {
        this.bgm.pause()
      }
    })
  }
  listener: THREE.AudioListener
  bgm: THREE.Audio
  audioLoader: THREE.AudioLoader

  update() {}
}
