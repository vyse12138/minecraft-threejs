import * as THREE from 'three'
import Materials, { MaterialType } from './mesh/materials'
import Block from './mesh/block'
import Highlight from './highlight'
import Noise from './noise'

import Generate from './worker/generate?worker'

export enum BlockType {
  grass = 0,
  sand = 1,
  tree = 2,
  leaf = 3,
  dirt = 4,
  stone = 5,
  coal = 6
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
    this.maxCount = (distance * 16 * 2 + 16) ** 2 + 500
    this.highlight = new Highlight(scene, camera, this)

    this.initBlocks()
    this.generate()

    // generate worker callback handler
    this.generateWorker.onmessage = (
      msg: MessageEvent<{
        idMap: Map<string, number>
        arrays: ArrayLike<number>[]
        blocksCount: number[]
      }>
    ) => {
      this.resetBlocks()
      this.idMap = msg.data.idMap
      this.blocksCount = msg.data.blocksCount

      for (let i = 0; i < msg.data.arrays.length; i++) {
        this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
          (this.blocks[i].instanceMatrix.array = msg.data.arrays[i]),
          16
        )
      }

      for (const block of this.blocks) {
        block.instanceMatrix.needsUpdate = true
      }
    }
  }
  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  distance: number

  // terrain properties
  maxCount: number
  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  noise = new Noise()

  // other properties
  blocks: THREE.InstancedMesh[] = []
  blocksCount: number[] = []
  blocksFactor = [1, 0.5, 0.2, 1, 0.5, 0.5, 1]

  customBlocks: Block[] = []
  highlight: Highlight

  idMap = new Map<string, number>()

  generateWorker = new Generate()

  getCount = (type: BlockType) => {
    return this.blocksCount[type]
  }

  setCount = (type: BlockType) => {
    this.blocksCount[type] = this.blocksCount[type] + 1
  }

  initBlocks = () => {
    // create instance meshes
    const materials = new Materials()
    const geometry = new THREE.BoxGeometry()

    const materialType = [
      MaterialType.grass,
      MaterialType.sand,
      MaterialType.tree,
      MaterialType.leaf,
      MaterialType.dirt,
      MaterialType.stone,
      MaterialType.coal
    ]

    for (let i = 0; i < materialType.length; i++) {
      let block = new THREE.InstancedMesh(
        geometry,
        materials.get(materialType[i]),
        this.maxCount * this.blocksFactor[i]
      )
      block.name = BlockType[i]
      this.blocks.push(block)
      this.scene.add(block)
    }

    this.blocksCount = new Array(materialType.length).fill(0)
  }

  resetBlocks = () => {
    // reest count and instance matrix
    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
        new Float32Array(this.maxCount * this.blocksFactor[i] * 16),
        16
      )
    }
  }

  generate = () => {
    this.blocksCount = new Array(this.blocks.length).fill(0)
    // post work to generate worker
    this.generateWorker.postMessage({
      distance: this.distance,
      chunk: this.chunk,
      noiseSeed: this.noise.seed,
      treeSeed: this.noise.treeSeed,
      stoneSeed: this.noise.stoneSeed,
      coalSeed: this.noise.coalSeed,
      idMap: new Map<string, number>(),
      blocksFactor: this.blocksFactor,
      blocksCount: this.blocksCount,
      customBlocks: this.customBlocks
    })
  }

  update = () => {
    this.chunk.set(
      Math.floor(this.camera.position.x / 16),
      Math.floor(this.camera.position.z / 16)
    )

    //generate terrain when getting into new chunk
    if (
      this.chunk.x !== this.previousChunk.x ||
      this.chunk.y !== this.previousChunk.y
    ) {
      this.generate()
    }

    this.previousChunk.copy(this.chunk)

    this.highlight.update()
  }
}
