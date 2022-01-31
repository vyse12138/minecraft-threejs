import * as THREE from 'three'
import Terrain from '..'

/**
 * Highlight block on crosshair
 */
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

  // highlight block mesh
  geometry = new THREE.BoxGeometry(1.01, 1.01, 1.01)
  material = new THREE.MeshStandardMaterial({
    transparent: true,
    opacity: 0.25
    // depthWrite: false
  })
  mesh = new THREE.Mesh(new THREE.BoxGeometry(), this.material)

  // block simulation
  index = 0
  instanceMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
    1000
  )

  update() {
    // remove last highlight and reset block simulation
    this.scene.remove(this.mesh)
    this.index = 0
    this.instanceMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(1000 * 16),
      16
    )

    const position = this.camera.position
    const matrix = new THREE.Matrix4()
    const idMap = new Map<string, number>()
    const noise = this.terrain.noise

    let xPos = Math.round(position.x)
    let zPos = Math.round(position.z)

    for (let i = -8; i < 8; i++) {
      for (let j = -8; j < 8; j++) {
        // check terrain
        let x = xPos + i
        let z = zPos + j
        let y =
          Math.floor(
            noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
          ) + 30

        idMap.set(`${x}_${y}_${z}`, this.index)
        matrix.setPosition(x, y, z)
        this.instanceMesh.setMatrixAt(this.index++, matrix)

        let stoneOffset =
          noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) *
          noise.stoneAmp

        let treeOffset =
          noise.get(x / noise.treeGap, z / noise.treeGap, noise.treeSeed) *
          noise.treeAmp

        // check tree
        if (
          treeOffset > noise.treeThreshold &&
          y - 30 >= -3 &&
          stoneOffset < noise.stoneThreshold
        ) {
          for (let t = 1; t <= noise.treeHeight; t++) {
            idMap.set(`${x}_${y + t}_${z}`, this.index)
            matrix.setPosition(x, y + t, z)
            this.instanceMesh.setMatrixAt(this.index++, matrix)
          }

          // leaf
          // for (let i = -3; i < 3; i++) {
          //   for (let j = -3; j < 3; j++) {
          //     for (let k = -3; k < 3; k++) {
          //       if (i === 0 && k === 0) {
          //         continue
          //       }
          //     let leafOffset =
          //       noise.get(
          //         (x + i + j) / noise.leafGap,
          //         (z + k) / noise.leafGap,
          //         noise.leafSeed
          //       ) * noise.leafAmp

          //       if (leafOffset > noise.leafThreshold) {
          //         idMap.set(
          //           `${x + i}_${y + noise.treeHeight + j}_${z + k}`,
          //           this.index
          //         )
          //         matrix.setPosition(x + i, y + noise.treeHeight + j, z + k)
          //         this.instanceMesh.setMatrixAt(this.index++, matrix)
          //       }
          //     }
          //   }
          // }
        }
      }
    }

    // check custom blocks
    for (const block of this.terrain.customBlocks) {
      if (block.placed) {
        matrix.setPosition(block.x, block.y, block.z)
        this.instanceMesh.setMatrixAt(this.index++, matrix)
      } else {
        if (idMap.has(`${block.x}_${block.y}_${block.z}`)) {
          let id = idMap.get(`${block.x}_${block.y}_${block.z}`)
          this.instanceMesh.setMatrixAt(
            id!,
            new THREE.Matrix4().set(
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              0
            )
          )
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
}
