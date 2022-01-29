//legacy

import * as THREE from 'three'

onmessage = (
  msg: MessageEvent<{
    count: number
    matrices: THREE.InstancedBufferAttribute[]
    position: THREE.Vector3
  }>
) => {
  let meshes = []

  let raycaster = new THREE.Raycaster(
    new THREE.Vector3(
      msg.data.position.x,
      msg.data.position.y - 1,
      msg.data.position.z
    ),
    new THREE.Vector3(1, 0, 0),
    0,
    0.6
  )

  for (let matrix of msg.data.matrices) {
    let mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
      msg.data.count
    )
    mesh.instanceMatrix = matrix
    meshes.push(mesh)
  }
  if (raycaster.intersectObjects(meshes).length) {
    postMessage(true)
  } else {
    postMessage(false)
  }
}
