import * as THREE from 'three'
import Block from '../mesh/block'
import Noise from '../noise'

enum BlockType {
  grass = 0,
  sand = 1,
  tree = 2,
  leaf = 3,
  dirt = 4,
  stone = 5,
  coal = 6,
  wood = 7,
  diamond = 8,
  quartz = 9,
  glass = 10,
  bedrock = 11
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
    stoneSeed: number
    coalSeed: number
    idMap: Map<string, number>
    blocksFactor: number[]
    blocksCount: number[]
    customBlocks: Block[]
    chunkSize: number
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
    stoneSeed,
    coalSeed,
    customBlocks,
    blocksCount,
    chunkSize
  } = msg.data

  const maxCount = (distance * chunkSize * 2 + chunkSize) ** 2 + 500

  if (isFirstRun) {
    for (let i = 0; i < blocksCount.length; i++) {
      let block = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial(),
        maxCount * blocksFactor[i]
      )
      blocks.push(block)
    }

    isFirstRun = false
  }

  noise.seed = noiseSeed
  noise.treeSeed = treeSeed
  noise.stoneSeed = stoneSeed
  noise.coalSeed = coalSeed

  for (let i = 0; i < blocks.length; i++) {
    blocks[i].instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(maxCount * blocksFactor[i] * 16),
      16
    )
  }

  for (
    let x = -chunkSize * distance + chunkSize * chunk.x;
    x < chunkSize * distance + chunkSize + chunkSize * chunk.x;
    x++
  ) {
    for (
      let z = -chunkSize * distance + chunkSize * chunk.y;
      z < chunkSize * distance + chunkSize + chunkSize * chunk.y;
      z++
    ) {
      const y = 30
      const yOffset = Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      )

      matrix.setPosition(x, y + yOffset, z)

      const stoneOffset =
        noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) *
        noise.stoneAmp

      const coalOffset =
        noise.get(x / noise.coalGap, z / noise.coalGap, noise.coalSeed) *
        noise.coalAmp

      if (stoneOffset > noise.stoneThreshold) {
        if (coalOffset > noise.coalThreshold) {
          // coal
          idMap.set(`${x}_${y + yOffset}_${z}`, blocksCount[BlockType.coal])
          blocks[BlockType.coal].setMatrixAt(
            blocksCount[BlockType.coal]++,
            matrix
          )
        } else {
          // stone
          idMap.set(`${x}_${y + yOffset}_${z}`, blocksCount[BlockType.stone])
          blocks[BlockType.stone].setMatrixAt(
            blocksCount[BlockType.stone]++,
            matrix
          )
        }
      } else {
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
      }

      // tree
      const treeOffset =
        noise.get(x / noise.treeGap, z / noise.treeGap, noise.treeSeed) *
        noise.treeAmp

      if (
        treeOffset > noise.treeThreshold &&
        yOffset >= -3 &&
        stoneOffset < noise.stoneThreshold
      ) {
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
              if (i === 0 && k === 0) {
                continue
              }
              const leafOffset =
                noise.get(
                  (x + i + j) / noise.leafGap,
                  (z + k) / noise.leafGap,
                  noise.leafSeed
                ) * noise.leafAmp
              if (leafOffset > noise.leafThreshold) {
                idMap.set(
                  `${x + i}_${y + yOffset + noise.treeHeight + j}_${z + k}`,
                  blocksCount[BlockType.leaf]
                )
                matrix.setPosition(
                  x + i,
                  y + yOffset + noise.treeHeight + j,
                  z + k
                )
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
      block.x > -chunkSize * distance + chunkSize * chunk.x &&
      block.x < chunkSize * distance + chunkSize + chunkSize * chunk.x &&
      block.z > -chunkSize * distance + chunkSize * chunk.y &&
      block.z < chunkSize * distance + chunkSize + chunkSize * chunk.y
    ) {
      if (block.placed) {
        // placed blocks
        matrix.setPosition(block.x, block.y, block.z)
        blocks[block.type].setMatrixAt(blocksCount[block.type]++, matrix)
      } else {
        // removed blocks
        const id = idMap.get(`${block.x}_${block.y}_${block.z}`)

        blocks[block.type].setMatrixAt(
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

  const arrays = blocks.map(block => block.instanceMatrix.array)
  postMessage({ idMap, arrays, blocksCount })
  // console.log(performance.now() - p1)
}
