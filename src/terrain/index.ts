import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'
import Blocks from './mesh/blocks'
import Materials, { MaterialTypes } from './mesh/materials'
import Block from './block'
import Highlight from './highlight'

export default class Terrain {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    distance: number
  ) {
    this.scene = scene
    this.camera = camera
    this.distance = distance
    const materials = new Materials()
    this.grass = new Blocks(
      materials.get(MaterialTypes.grass),
      (distance * 16 * 2 + 16) ** 2
    )
    this.scene.add(this.grass.mesh)
    this.generate(new THREE.Vector2(0, 0))
    this.highlight = new Highlight(scene, camera, [this.grass.mesh])
  }
  distance: number
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  blocks: Block[] = []
  position = new THREE.Vector3()
  grass: Blocks
  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  seed = Math.random()
  noise = new ImprovedNoise()
  highlight: Highlight

  generate = (chunk: THREE.Vector2) => {
    const matrix = new THREE.Matrix4()
    let i = 0
    for (
      let x = -16 * this.distance + 16 * chunk.x;
      x < 16 * this.distance + 16 + 16 * chunk.x;
      x++
    ) {
      for (let y = 30; y < 31; y++) {
        for (
          let z = -16 * this.distance + 16 * chunk.y;
          z < 16 * this.distance + 16 + 16 * chunk.y;
          z++
        ) {
          let noise = Math.floor(
            this.noise.noise(x / 22, z / 22, this.seed) * 9
          )

          matrix.setPosition(x, y + noise, z)
          this.grass.mesh.setColorAt(i, new THREE.Color(1, 1, 1))
          this.grass.mesh.setMatrixAt(i++, matrix)
        }
      }
    }
    this.grass.mesh.instanceMatrix.needsUpdate = true
  }

  i = 0
  update = () => {
    this.chunk.set(
      Math.floor(this.camera.position.x / 16),
      Math.floor(this.camera.position.z / 16)
    )
    if (
      this.chunk.x !== this.previousChunk.x ||
      this.chunk.y !== this.previousChunk.y
    ) {
      this.generate(this.chunk)
    }

    if (this.i++ === 60) {
      this.i = 0
    }

    this.previousChunk.copy(this.chunk)
    this.highlight.update()
  }
}
