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
  coal = 6,
  wood = 7
}
export default class Terrain {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    distance: number,
    chunkSize: number
  ) {
    this.scene = scene
    this.camera = camera
    this.distance = distance
    this.chunkSize = chunkSize
    this.maxCount = (distance * chunkSize * 2 + chunkSize) ** 2 + 500
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
  chunkSize = 32

  // terrain properties
  maxCount: number
  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  noise = new Noise()

  // other properties
  blocks: THREE.InstancedMesh[] = []
  blocksCount: number[] = []
  blocksFactor = [1, 0.2, 0.1, 0.7, 0.1, 0.2, 0.1, 0.1]

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
      MaterialType.coal,
      MaterialType.wood
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
      customBlocks: this.customBlocks,
      chunkSize: this.chunkSize
    })
  }

  // generate adjacent blocks after removing a block (vertical infinity world)
  generateAdjacentBlocks = (position: THREE.Vector3) => {
    const { x, y, z } = position
    const noise = this.noise
    const yOffset = Math.floor(
      noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
    )

    if (y > 30 + yOffset) {
      return
    }

    const stoneOffset =
      noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) *
      noise.stoneAmp

    let type: BlockType

    if (stoneOffset > noise.stoneThreshold || y < 23) {
      type = BlockType.stone
    } else {
      if (yOffset < -3) {
        type = BlockType.sand
      } else {
        type = BlockType.dirt
      }
    }

    this.buildBlock(new THREE.Vector3(x, y - 1, z), type)
    this.buildBlock(new THREE.Vector3(x, y + 1, z), type)
    this.buildBlock(new THREE.Vector3(x - 1, y, z), type)
    this.buildBlock(new THREE.Vector3(x + 1, y, z), type)
    this.buildBlock(new THREE.Vector3(x, y, z - 1), type)
    this.buildBlock(new THREE.Vector3(x, y, z + 1), type)

    this.blocks[type].instanceMatrix.needsUpdate = true
  }

  buildBlock = (position: THREE.Vector3, type: BlockType) => {
    const noise = this.noise

    // check if it's natural terrain
    const yOffset = Math.floor(
      noise.get(position.x / noise.gap, position.z / noise.gap, noise.seed) *
        noise.amp
    )
    if (position.y >= 30 + yOffset) {
      return
    }

    // check custom blocks
    for (const block of this.customBlocks) {
      if (
        block.position.x === position.x &&
        block.position.y === position.y &&
        block.position.z === position.z
      ) {
        return
      }
    }

    // build block
    this.customBlocks.push(
      new Block(position.x, position.y, position.z, type, true)
    )

    const matrix = new THREE.Matrix4()
    matrix.setPosition(position)
    this.blocks[type].setMatrixAt(this.getCount(type), matrix)
    this.setCount(type)
  }

  update = () => {
    this.chunk.set(
      Math.floor(this.camera.position.x / this.chunkSize),
      Math.floor(this.camera.position.z / this.chunkSize)
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
