import * as THREE from 'three'
import Block from '../mesh/block'
import Noise from '../noise'
enum BlockType {
  grass = 0,
  sand = 1,
  tree = 2,
  leaf = 3,
  dirt = 4
}
const matrix = new THREE.Matrix4()
const noise = new Noise()
const blocks: THREE.InstancedMesh[] = []

const geometry = new THREE.BoxGeometry()

let isFirstRun = true

onmessage = (
  msg: MessageEvent<{
    distance: number
    chunk: THREE.Vector2
    noiseSeed: number
    treeSeed: number
    idMap: Map<string, number>
    blocksFactor: number[]
    customBlocks: Block[]
  }>
) => {
  // let p1 = performance.now()
  const {
    distance,
    chunk,
    noiseSeed,
    idMap,
    blocksFactor,
    treeSeed,
    customBlocks
  } = msg.data
  let blocksCount = [0, 0, 0, 0]

  if (isFirstRun) {
    for (let i = 0; i < blocksCount.length; i++) {
      let block = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial(),
        ((distance * 16 * 2 + 16) ** 2 + 500) * blocksFactor[i]
      )
      blocks.push(block)
    }
    noise.seed = noiseSeed
    noise.treeSeed = treeSeed
    isFirstRun = false
    console.log('init')
  }

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(
        ((distance * 16 * 2 + 16) ** 2 + 500) * blocksFactor[i] * 16
      ),
      16
    )
  }

  for (
    let x = -16 * distance + 16 * chunk.x;
    x < 16 * distance + 16 + 16 * chunk.x;
    x++
  ) {
    for (
      let z = -16 * distance + 16 * chunk.y;
      z < 16 * distance + 16 + 16 * chunk.y;
      z++
    ) {
      let y = 30
      let yOffset = Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      )

      matrix.setPosition(x, y + yOffset, z)
      if (yOffset < -3) {
        // sand
        idMap.set(`${x}_${y + yOffset}_${z}`, blocksCount[BlockType.sand])
        blocks[BlockType.sand].setMatrixAt(
          blocksCount[BlockType.sand]++,
          matrix
        )
      } else {
        // grass
        idMap.set(`${x}_${y + yOffset}_${z}`, blocksCount[BlockType.grass])
        blocks[BlockType.grass].setMatrixAt(
          blocksCount[BlockType.grass]++,
          matrix
        )
      }

      // tree
      let treeOffset = noise.get(
        x / noise.treeGap,
        z / noise.treeGap,
        noise.treeSeed * noise.treeAmp
      )
      if (treeOffset < -0.7 && yOffset >= -3) {
        for (let i = 1; i <= noise.treeHeight; i++) {
          idMap.set(`${x}_${y + yOffset + i}_${z}`, blocksCount[BlockType.tree])

          matrix.setPosition(x, y + yOffset + i, z)

          blocks[BlockType.tree].setMatrixAt(
            blocksCount[BlockType.tree]++,
            matrix
          )
        }

        // leaf
        for (let i = -3; i < 3; i++) {
          for (let j = -3; j < 3; j++) {
            for (let k = -3; k < 3; k++) {
              let leafOffset = noise.get(
                (x + i) / noise.leafGap,
                (y + yOffset + 10 + j) / noise.leafGap,
                (z + k) / noise.leafGap
              )

              if (leafOffset > -0.02) {
                matrix.setPosition(x + i, y + yOffset + 10 + j, z + k)

                blocks[BlockType.leaf].setMatrixAt(
                  blocksCount[BlockType.leaf]++,
                  matrix
                )
              }
            }
          }
        }
      }
    }
  }

  for (const block of customBlocks) {
    if (
      block.x > -16 * distance + 16 * chunk.x &&
      block.x < 16 * distance + 16 + 16 * chunk.x &&
      block.z > -16 * distance + 16 * chunk.y &&
      block.z < 16 * distance + 16 + 16 * chunk.y
    ) {
      if (block.placed) {
        // placed blocks
        matrix.setPosition(block.position.x, block.position.y, block.position.z)
        blocks[block.type].setMatrixAt(blocksCount[block.type]++, matrix)
      } else {
        // removed blocks
        const id = idMap.get(`${block.x}_${block.y}_${block.z}`)
        blocks[block.type].setMatrixAt(id!, new THREE.Matrix4())
      }
    }
  }

  const arrays = blocks.map(block => block.instanceMatrix.array)
  postMessage({ idMap, arrays, blocksCount })
  // console.log(performance.now() - p1)
}
