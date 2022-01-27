import * as THREE from 'three'

export default class Block {
  constructor(x: number, y: number, z: number, placed: boolean) {
    this.position = new THREE.Vector3(x, y, z)
    this.placed = placed
  }
  position: THREE.Vector3
  placed: boolean
}
