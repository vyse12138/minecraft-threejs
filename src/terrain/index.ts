import * as THREE from 'three'
import Materials, { MaterialType } from './mesh/materials'
import Block from './mesh/block'
import Highlight from './highlight'

import Noise from './noise'

export enum BlockType {
  grass = 0,
  sand = 1,
  tree = 2,
  leaf = 3,
  dirt = 4
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
    this.maxCount = (distance * 16 * 2 + 16) ** 2 + this.customBlocks.length
    this.initBlocks()
    this.generate(new THREE.Vector2(0, 0))
    this.highlight = new Highlight(scene, camera, this)
  }
  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera

  // terrain properties
  distance: number
  maxCount: number
  chunk = new THREE.Vector2(0, 0)
  previousChunk = new THREE.Vector2(0, 0)
  blocksCount = [0, 0, 0, 0]
  blocksFactor = [1, 1, 0.2, 2]
  // noise properties

  noise = new Noise()

  // other properties
  blocks: THREE.InstancedMesh[] = []
  customBlocks: Block[] = []
  highlight: Highlight

  idMap = new Map<string, number>()

  getCount = (type: BlockType) => {
    return this.blocksCount[type]
  }
  setCount = (type: BlockType) => {
    this.blocksCount[type] = this.blocksCount[type] + 1
  }

  initBlocks = () => {
    const materials = new Materials()
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    const materialType = [
      MaterialType.grass,
      MaterialType.sand,
      MaterialType.tree,
      MaterialType.leaf
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
  }

  resetBlocks = () => {
    this.blocksCount = [0, 0, 0, 0]
    for (let i = 0; i < this.blocks.length; i++) {
      this.blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
        new Float32Array(this.maxCount * this.blocksFactor[i] * 16),
        16
      )
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
          let yOffset = Math.floor(
            this.noise.get(
              x / this.noise.gap,
              z / this.noise.gap,
              this.noise.seed
            ) * this.noise.amp
          )

          // terrain
          matrix.setPosition(x, y + yOffset, z)
          if (yOffset < -3) {
            // sand
            this.idMap.set(
              `${x}_${y + yOffset}_${z}`,
              this.blocksCount[BlockType.sand]
            )

            this.blocks[BlockType.sand].setMatrixAt(
              this.blocksCount[BlockType.sand]++,
              matrix
            )
          } else {
            // grass
            this.idMap.set(
              `${x}_${y + yOffset}_${z}`,
              this.blocksCount[BlockType.grass]
            )

            this.blocks[BlockType.grass].setMatrixAt(
              this.blocksCount[BlockType.grass]++,
              matrix
            )
          }

          // tree
          let treeOffset = this.noise.get(
            x / this.noise.treeGap,
            z / this.noise.treeGap,
            this.noise.treeSeed * this.noise.treeAmp
          )
          if (treeOffset < -0.7 && yOffset >= -3) {
            for (let i = 1; i <= this.noise.treeHeight; i++) {
              this.idMap.set(
                `${x}_${y + yOffset + i}_${z}`,
                this.blocksCount[BlockType.tree]
              )

              matrix.setPosition(x, y + yOffset + i, z)

              this.blocks[BlockType.tree].setMatrixAt(
                this.blocksCount[BlockType.tree]++,
                matrix
              )
            }
            for (let i = -3; i < 3; i++) {
              for (let j = -3; j < 3; j++) {
                for (let k = -3; k < 3; k++) {
                  if (Math.random() > 0.6) {
                    matrix.setPosition(x + i, y + yOffset + 10 + j, z + k)

                    this.blocks[BlockType.leaf].setMatrixAt(
                      this.blocksCount[BlockType.leaf]++,
                      matrix
                    )
                  }
                }
              }
            }

            // leaf
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
          matrix.setPosition(block.position)

          this.blocks[block.type].setMatrixAt(
            this.blocksCount[block.type]++,
            matrix
          )
        } else {
          const id = this.idMap.get(`${block.x}_${block.y}_${block.z}`)
          this.blocks[block.type].setMatrixAt(id!, new THREE.Matrix4())
        }
      }
    }
    this.blocks[BlockType.grass].instanceMatrix.needsUpdate = true
    this.blocks[BlockType.sand].instanceMatrix.needsUpdate = true
    this.blocks[BlockType.tree].instanceMatrix.needsUpdate = true
    this.blocks[BlockType.leaf].instanceMatrix.needsUpdate = true
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
