import * as THREE from 'three'

export default class Blocks {
  constructor(
    material: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[],
    count: number
  ) {
    this.material = material
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count)
  }
  geometry = new THREE.BoxGeometry(1, 1, 1)
  material: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
  mesh: THREE.InstancedMesh
  count = 0
}
