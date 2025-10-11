import * as THREE from 'three'
import hal3 from './musics/hal3.ogg'
import { BlockType } from '../terrain'
import { isMobile } from '../utils'

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

const uniqueSoundSources = {
  grass1, grass2, grass3, grass4,
  sand1, sand2, sand3, sand4,
  stone1, stone2, stone3, stone4,
  dirt1, dirt2, dirt3, dirt4,
  tree1, tree2, tree3, tree4,
  leaf1, leaf2, leaf3, leaf4
} as const;

const soundMapKeys = [
  ['grass1', 'grass2', 'grass3', 'grass4'],
  ['sand1', 'sand2', 'sand3', 'sand4'],
  ['tree1', 'tree2', 'tree3', 'tree4'],
  ['leaf1', 'leaf2', 'leaf3', 'leaf4'],
  ['dirt1', 'dirt2', 'dirt3', 'dirt4'],
  ['stone1', 'stone2', 'stone3', 'stone4'],
  ['stone1', 'stone2', 'stone3', 'stone4'],
  ['tree1', 'tree2', 'tree3', 'tree4'],
  ['stone1', 'stone2', 'stone3', 'stone4'],
  ['stone1', 'stone2', 'stone3', 'stone4'],
  ['stone1', 'stone2', 'stone3', 'stone4']
] as const;

type SoundKey = keyof typeof uniqueSoundSources;

export default class Audio {
  constructor(camera: THREE.PerspectiveCamera) {
    if (isMobile) return
    camera.add(this.listener)

    this.loadBGM()
    this.loadSoundEffects()

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement && !this.bgm.isPlaying && !this.disabled) {
        this.bgm.play()
      } else {
        this.bgm.pause()
      }
    })
  }

  disabled = false
  
  private listener: THREE.AudioListener = new THREE.AudioListener();
  private audioLoader: THREE.AudioLoader = new THREE.AudioLoader();
  bgm!: THREE.Audio;
  
  private uniqueBuffers: Record<SoundKey, AudioBuffer> = {} as Record<SoundKey, AudioBuffer>;

  private soundMap: THREE.Audio[][] = [];

  private loadBGM() {
    this.bgm = new THREE.Audio(this.listener)
    this.bgm.autoplay = false
    this.audioLoader.load(hal3, buffer => {
      this.bgm.setBuffer(buffer)
      this.bgm.setVolume(0.1)
      this.bgm.setLoop(true)
      if (this.bgm.isPlaying) {
        this.bgm.pause()
        this.bgm.play()
      }
    })
  }
  
  private loadSoundEffects() {
    const keys = Object.keys(uniqueSoundSources) as SoundKey[];
    let loadedCount = 0;
    const totalCount = keys.length;
    for (const key of keys) {
      this.audioLoader.load(uniqueSoundSources[key], buffer => {
        this.uniqueBuffers[key] = buffer;
        loadedCount++;
        if (loadedCount === totalCount) {
          this.createSoundObjects();
        }
      });
    }
  }

  private createSoundObjects() {
    for (const typeKeys of soundMapKeys) {
      const audioSet: THREE.Audio[] = [];
      for (const key of typeKeys) {
        const audio = new THREE.Audio(this.listener);
        audio.setBuffer(this.uniqueBuffers[key as SoundKey]);
        audio.setVolume(0.15);
        audioSet.push(audio);
      }
      this.soundMap.push(audioSet);
    }
  }
  index = 0
  playSound(type: BlockType, volume = 0.15, index = -1) {
    if (!this.disabled && !isMobile) {
      // this.index++ === 3 && (this.index = 0)
      const randomIndex = Math.floor(Math.random() * 3);
      if(randomIndex !== this.index) {
        this.index = randomIndex
      } else {
        this.index = 3
      }
      index < 0 && (index = this.index);
      this.soundMap[type]?.[index]?.setVolume(volume)
      this.soundMap[type]?.[index]?.play()
    }
  }
}
