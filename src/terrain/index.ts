import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'
import Materials, { MaterialType } from './mesh/materials'
import Block from './mesh/block'
import Highlight from './highlight'

enum BlockType {
  grass = 0,
  sand = 1,
  dirt = 2,
  water = 3
}

export default class Terrain {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    distance: number
  ) {
    this.scene = scene
    this.camera = camera
    this.distance = distance
    this.count = (distance * 16 * 2 + 16) ** 2
    this.initBlocks()
    this.generate(new THREE.Vector2(0, 0))
    this.highlight = new Highlight(scene, camera, this.blocks)
  }
  distance: number
  count: number
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  position = new THREE.Vector3()

  blocks: THREE.InstancedMesh[] = []

  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  seed = Math.random()
  noise = new ImprovedNoise()
  highlight: Highlight

  initBlocks = () => {
    const materials = new Materials()
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    const materialType = [
      MaterialType.grass,
      MaterialType.sand,
      MaterialType.dirt,
      MaterialType.water
    ]
    const factor = [1, 1, 0, 0]
    for (let i = 0; i < materialType.length; i++) {
      let block = new THREE.InstancedMesh(
        geometry,
        materials.get(materialType[i]),
        this.count * factor[i]
      )
      this.blocks.push(block)
      this.scene.add(block)
    }
  }

  resetBlocks = () => {
    const factor = [1, 1, 0, 0]

    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
        new Float32Array(this.count * factor[i] * 16),
        16
      )
      this.blocks[i].instanceColor = null
    }
  }

  generate = (chunk: THREE.Vector2) => {
    this.resetBlocks()

    const matrix = new THREE.Matrix4()
    let grassCount = 0,
      sandCount = 0
    for (
      let x = -16 * this.distance + 16 * chunk.x;
      x < 16 * this.distance + 16 + 16 * chunk.x;
      x++
    ) {
      for (let y = 30; y > 29; y--) {
        for (
          let z = -16 * this.distance + 16 * chunk.y;
          z < 16 * this.distance + 16 + 16 * chunk.y;
          z++
        ) {
          let noise = Math.floor(
            this.noise.noise(x / 22, z / 22, this.seed) * 10
          )
          matrix.setPosition(x, y + noise, z)
          if (noise < -3) {
            this.blocks[BlockType.sand].setColorAt(
              sandCount,
              new THREE.Color(1, 1, 1)
            )
            this.blocks[BlockType.sand].setMatrixAt(sandCount++, matrix)
          } else {
            this.blocks[BlockType.grass].setColorAt(
              grassCount,
              new THREE.Color(1, 1, 1)
            )
            this.blocks[BlockType.grass].setMatrixAt(grassCount++, matrix)
          }
        }
      }
    }
    this.blocks[BlockType.grass].instanceMatrix.needsUpdate = true
    this.blocks[BlockType.sand].instanceMatrix.needsUpdate = true
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
