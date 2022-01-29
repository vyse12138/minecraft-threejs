import * as THREE from 'three'
import Terrain from '..'

export default class BlockHighlight {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    terrain: Terrain
  ) {
    this.camera = camera
    this.scene = scene
    this.terrain = terrain
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 8
  }
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  terrain: Terrain
  raycaster: THREE.Raycaster
  block: THREE.Intersection | null = null

  geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01)
  material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.25
  })
  mesh = new THREE.Mesh(new THREE.BoxGeometry(), this.material)

  instanceMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
    1000
  )
  update() {
    // remove last highlight
    this.scene.remove(this.mesh)
    this.instanceMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(1000 * 16),
      16
    )
    this.index = 0

    const matrix = new THREE.Matrix4()
    const position = this.camera.position
    const idMap = new Map<string, number>()
    let x = Math.round(position.x)
    let z = Math.round(position.z)

    for (let i = -8; i < 8; i++) {
      for (let j = -8; j < 8; j++) {
        let xPos = x + i
        let zPos = z + j
        let yPos =
          Math.floor(
            this.terrain.noise.get(
              xPos / this.terrain.noise.gap,
              zPos / this.terrain.noise.gap,
              this.terrain.noise.seed
            ) * this.terrain.noise.amp
          ) + 30
        idMap.set(`${xPos}_${yPos}_${zPos}`, this.index)
        matrix.setPosition(xPos, yPos, zPos)
        this.instanceMesh.setMatrixAt(this.index++, matrix)

        let treeOffset = this.terrain.noise.get(
          xPos / this.terrain.noise.treeGap,
          zPos / this.terrain.noise.treeGap,
          this.terrain.noise.treeSeed * this.terrain.noise.treeAmp
        )

        if (treeOffset < -0.7 && yPos >= 27) {
          for (let t = 1; t <= this.terrain.noise.treeHeight; t++) {
            idMap.set(`${xPos}_${yPos + t}_${zPos}`, this.index)
            matrix.setPosition(xPos, yPos + t, zPos)
            this.instanceMesh.setMatrixAt(this.index++, matrix)
          }
        }
      }
    }
    // custom blocks
    for (const block of this.terrain.customBlocks) {
      if (block.placed) {
        matrix.setPosition(block.position)
        this.instanceMesh.setMatrixAt(this.index++, matrix)
      } else {
        if (idMap.has(`${block.x}_${block.y}_${block.z}`)) {
          let id = idMap.get(`${block.x}_${block.y}_${block.z}`)
          this.instanceMesh.setMatrixAt(id!, new THREE.Matrix4())
        }
      }
    }

    // highlight new block
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
    this.block = this.raycaster.intersectObject(this.instanceMesh)[0]
    if (
      this.block &&
      this.block.object instanceof THREE.InstancedMesh &&
      typeof this.block.instanceId === 'number'
    ) {
      this.mesh = new THREE.Mesh(this.geometry, this.material)
      let matrix = new THREE.Matrix4()
      this.block.object.getMatrixAt(this.block.instanceId, matrix)
      const position = new THREE.Vector3().setFromMatrixPosition(matrix)

      this.mesh.position.set(position.x, position.y, position.z)
      this.scene.add(this.mesh)
    }
  }

  index = 0
}
