import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'
import Materials, { MaterialType } from './mesh/materials'
import Block from './mesh/block'
import Highlight from './highlight'

export enum BlockType {
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
    this.maxCount = (distance * 16 * 2 + 16) ** 2
    this.initBlocks()
    this.generate(new THREE.Vector2(0, 0))
    this.highlight = new Highlight(scene, camera, this.blocks)
  }
  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera

  // terrain properties
  distance: number
  maxCount: number
  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  counts = [0, 0, 0, 0]

  // noise properties
  seed = Math.random()
  noiseGap = 22
  noiseAmp = 8
  noise = new ImprovedNoise()

  // other properties
  blocks: THREE.InstancedMesh[] = []
  customBlocks: Block[] = []
  highlight: Highlight

  idMap = new Map<string, number>()

  getCount = (type: BlockType) => {
    return this.counts[type]
  }
  setCount = (type: BlockType) => {
    this.counts[type] = this.counts[type] + 1
  }

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
        this.maxCount * factor[i]
      )
      this.blocks.push(block)
      this.scene.add(block)
    }
  }

  resetBlocks = () => {
    this.counts = [0, 0, 0, 0]
    const factor = [1, 1, 0, 0]

    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
        new Float32Array(this.maxCount * factor[i] * 16),
        16
      )
      this.blocks[i].instanceColor = null
    }
  }

  generate = (chunk: THREE.Vector2) => {
    this.resetBlocks()

    const matrix = new THREE.Matrix4()

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
            this.noise.noise(x / this.noiseGap, z / this.noiseGap, this.seed) *
              this.noiseAmp
          )
          matrix.setPosition(x, y + noise, z)
          if (noise < -3) {
            this.idMap.set(
              `${x}_${y + noise}_${z}`,
              this.counts[BlockType.sand]
            )

            this.blocks[BlockType.sand].setColorAt(
              this.counts[BlockType.sand],
              new THREE.Color(1, 1, 1)
            )
            this.blocks[BlockType.sand].setMatrixAt(
              this.counts[BlockType.sand]++,
              matrix
            )
          } else {
            this.idMap.set(
              `${x}_${y + noise}_${z}`,
              this.counts[BlockType.grass]
            )

            this.blocks[BlockType.grass].setColorAt(
              this.counts[BlockType.grass],
              new THREE.Color(1, 1, 1)
            )
            this.blocks[BlockType.grass].setMatrixAt(
              this.counts[BlockType.grass]++,
              matrix
            )
          }
        }
      }
    }

    // custom blocks
    for (const block of this.customBlocks) {
      if (
        block.x > -16 * this.distance + 16 * chunk.x &&
        block.x < 16 * this.distance + 16 + 16 * chunk.x &&
        block.z > -16 * this.distance + 16 * chunk.y &&
        block.z < 16 * this.distance + 16 + 16 * chunk.y
      ) {
        if (block.placed) {
          this.idMap.set(
            `${block.x}_${block.y}_${block.z}`,
            this.counts[block.type]
          )

          matrix.setPosition(block.position)
          this.blocks[block.type].setColorAt(
            this.counts[block.type],
            new THREE.Color(1, 1, 1)
          )

          this.blocks[block.type].setMatrixAt(this.counts[block.type]++, matrix)
        } else {
          const id = this.idMap.get(`${block.x}_${block.y}_${block.z}`)
          this.blocks[block.type].setMatrixAt(id!, new THREE.Matrix4())
        }
      }
    }
    this.blocks[BlockType.grass].instanceMatrix.needsUpdate = true
    this.blocks[BlockType.sand].instanceMatrix.needsUpdate = true
  }

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

    this.previousChunk.copy(this.chunk)
    this.highlight.update()
  }
}
