import * as THREE from 'three'
import bgm from './musics/hal3.ogg'

export default class Audio {
  constructor(camera: THREE.PerspectiveCamera) {
    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()
    camera.add(this.listener)

    this.bgm = new THREE.Audio(this.listener)
    this.bgm.autoplay = false
    this.audioLoader.load(bgm, buffer => {
      this.bgm.setBuffer(buffer)
      this.bgm.setVolume(0.1)
      this.bgm.setLoop(true)
      if (this.bgm.isPlaying) {
        this.bgm.pause()
        this.bgm.play()
      }
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
