import * as THREE from 'three'
import bgm from './musics/hal3.ogg'
import { BlockType } from '../terrain'

import grass1 from './blocks/grass1.ogg'
import grass2 from './blocks/grass2.ogg'
import grass3 from './blocks/grass3.ogg'
import grass4 from './blocks/grass4.ogg'

import sand1 from './blocks/sand1.ogg'
import sand2 from './blocks/sand2.ogg'
import sand3 from './blocks/sand3.ogg'
import sand4 from './blocks/sand4.ogg'

import stone1 from './blocks/stone1.ogg'
import stone2 from './blocks/stone2.ogg'
import stone3 from './blocks/stone3.ogg'
import stone4 from './blocks/stone4.ogg'

import dirt1 from './blocks/dirt1.ogg'
import dirt2 from './blocks/dirt2.ogg'
import dirt3 from './blocks/dirt3.ogg'
import dirt4 from './blocks/dirt4.ogg'

import tree1 from './blocks/tree1.ogg'
import tree2 from './blocks/tree2.ogg'
import tree3 from './blocks/tree3.ogg'
import tree4 from './blocks/tree4.ogg'

import leaf1 from './blocks/leaf1.ogg'
import leaf2 from './blocks/leaf2.ogg'
import leaf3 from './blocks/leaf3.ogg'
import leaf4 from './blocks/leaf4.ogg'

export default class Audio {
  constructor(camera: THREE.PerspectiveCamera) {
    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()
    camera.add(this.listener)

    // load bgm
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

    // play / pause bgm
    document.addEventListener('pointerlockchange', () => {
      if (
        document.pointerLockElement &&
        !this.bgm.isPlaying &&
        !this.disabled
      ) {
        this.bgm.play()
      } else {
        this.bgm.pause()
      }
    })

    // load sound effect
    for (const types of this.sourceSet) {
      const audios: THREE.Audio[] = []
      for (const type of types) {
        this.audioLoader.load(type, buffer => {
          const audio = new THREE.Audio(this.listener)
          audio.setBuffer(buffer)
          audio.setVolume(0.15)
          audios.push(audio)
        })
      }
      this.soundSet.push(audios)
    }
  }

  listener: THREE.AudioListener
  bgm: THREE.Audio
  audioLoader: THREE.AudioLoader
  disabled = false

  sourceSet = [
    [grass1, grass2, grass3, grass4],
    [sand1, sand2, sand3, sand4],
    [tree1, tree2, tree3, tree4],
    [leaf1, leaf2, leaf3, leaf4],
    [dirt1, dirt2, dirt3, dirt4],
    [stone1, stone2, stone3, stone4],
    [stone1, stone2, stone3, stone4],
    [tree1, tree2, tree3, tree4],
    [stone1, stone2, stone3, stone4],
    [stone1, stone2, stone3, stone4],
    [stone1, stone2, stone3, stone4]
  ]

  soundSet: THREE.Audio[][] = []

  index = 0

  playSound(type: BlockType) {
    if (!this.disabled) {
      this.index++ === 3 && (this.index = 0)
      this.soundSet[type]?.[this.index]?.play()
    }
  }
}
