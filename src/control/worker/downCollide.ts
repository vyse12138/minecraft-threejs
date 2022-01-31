//legacy

import * as THREE from 'three'
import Block from '../../terrain/mesh/block'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'

const noise = new ImprovedNoise()
const raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0),
  0,
  1.8
)

onmessage = (
  msg: MessageEvent<{
    position: THREE.Vector3
    far: number
    blocks: Block[]
    seed: number
    noiseGap: number
    noiseAmp: number
  }>
) => {
  raycaster.ray.origin = new THREE.Vector3(
    msg.data.position.x,
    msg.data.position.y,
    msg.data.position.z
  )
  raycaster.far = msg.data.far

  let index = 0
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial(),
    100
  )
  const matrix = new THREE.Matrix4()

  let x = Math.round(msg.data.position.x)
  let z = Math.round(msg.data.position.z)
  let y =
    Math.floor(
      noise.noise(x / msg.data.noiseGap, z / msg.data.noiseGap, msg.data.seed) *
        msg.data.noiseAmp
    ) + 30
  let removed = false

  for (const block of msg.data.blocks) {
    if (
      block.x === Math.round(msg.data.position.x) &&
      block.z === Math.round(msg.data.position.z)
    ) {
      if (block.placed) {
        matrix.setPosition(new THREE.Vector3(block.x, block.y, block.z))
        mesh.setMatrixAt(index++, matrix)
      } else if (block.y === y) {
        removed = true
      }
    }
  }

  if (!removed) {
    matrix.setPosition(new THREE.Vector3(x, y, z))
    mesh.setMatrixAt(index++, matrix)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (raycaster.intersectObject(mesh).length) {
    postMessage(true)
  } else {
    postMessage(false)
  }
}
