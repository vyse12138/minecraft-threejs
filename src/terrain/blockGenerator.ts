import * as THREE from 'three'
import BlockMaterial from './material.js'

export default class TerrainGenerator {
  grassMaterial: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
  constructor() {
    // init

    // set up materials
    this.grassMaterial = BlockMaterial('grass')
  }
}
