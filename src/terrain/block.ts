import * as THREE from 'three'
import material, { MaterialTypes } from './material'

export default class Block {
  constructor(position: THREE.Vector3, placed: boolean, type: MaterialTypes) {
    this.position = position
    this.placed = placed
    this.type = type
    this.material = material(type)
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, 8000)
  }
  position: THREE.Vector3
  placed: boolean
  type: string
  geometry = new THREE.BoxGeometry(1, 1, 1)
  material: THREE.MeshStandardMaterial[]
  mesh: THREE.InstancedMesh
}
