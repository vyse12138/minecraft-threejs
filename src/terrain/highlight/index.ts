import * as THREE from 'three'
import { InstancedMesh } from 'three'

export default class BlockHighlight {
  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    terrain: THREE.InstancedMesh[]
  ) {
    this.camera = camera
    this.scene = scene
    this.terrain = terrain
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 8

    // document.body.addEventListener('mousedown', () => {
    //   console.log(this.block)
    // })
  }
  camera
  scene
  terrain
  raycaster
  highlight = new THREE.Color(1.25, 1.25, 1.25)
  normal = new THREE.Color(1, 1, 1)

  block: THREE.Intersection | null = null

  update() {
    // disable last block highlight
    if (this.block) {
      const mesh = this.block.object as InstancedMesh
      const id = this.block.instanceId as number
      mesh.setColorAt(id, this.normal)
      mesh.instanceColor!.needsUpdate = true
    }

    // highlight the new block
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
    this.block = this.raycaster.intersectObjects(this.terrain)[0]
    if (this.block) {
      const mesh = this.block.object as InstancedMesh
      const id = this.block.instanceId as number
      mesh.setColorAt(id, this.highlight)
      mesh.instanceColor!.needsUpdate = true
    }
  }
}
