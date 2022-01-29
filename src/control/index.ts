import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode } from '../player'
import Terrain, { BlockType } from '../terrain'

import Block from '../terrain/mesh/block'
import Noise from '../terrain/noise'

export default class Control {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    player: Player,
    terrain: Terrain
  ) {
    this.scene = scene
    this.camera = camera
    this.player = player
    this.terrain = terrain
    this.control = new PointerLockControls(camera, document.body)

    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 8

    this.initEventListeners()
    this.initRayCaster()
  }
  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  player: Player
  terrain: Terrain
  control: PointerLockControls
  velocity = new THREE.Vector3(0, 0, 0)

  // collide and jump properties
  frontCollide = false
  backCollide = false
  leftCollide = false
  rightCollide = false
  downCollide = true
  isJumping = false

  raycasterDown = new THREE.Raycaster()
  raycasterFront = new THREE.Raycaster()
  raycasterBack = new THREE.Raycaster()
  raycasterRight = new THREE.Raycaster()
  raycasterLeft = new THREE.Raycaster()

  tempMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial(),
    100
  )
  tempMeshMatrix = new THREE.InstancedBufferAttribute(
    new Float32Array(100 * 16),
    16
  )

  // other properties
  p1 = performance.now()
  p2 = performance.now()
  raycaster: THREE.Raycaster
  far = 1.8
  holdingBlock = BlockType.grass

  initRayCaster = () => {
    this.raycasterDown.ray.direction = new THREE.Vector3(0, -1, 0)
    this.raycasterDown.far = 1.8

    this.raycasterFront.ray.direction = new THREE.Vector3(1, 0, 0)
    this.raycasterBack.ray.direction = new THREE.Vector3(-1, 0, 0)
    this.raycasterLeft.ray.direction = new THREE.Vector3(0, 0, -1)
    this.raycasterRight.ray.direction = new THREE.Vector3(0, 0, 1)

    this.raycasterFront.far = 0.6
    this.raycasterBack.far = 0.6
    this.raycasterLeft.far = 0.6
    this.raycasterRight.far = 0.6
  }

  initEventListeners = () => {
    document.body.addEventListener('click', () => {
      this.control.lock()
    })
    document.addEventListener('mousewheel', () => {
      this.control.unlock()
    })
    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.repeat) {
        return
      }
      switch (e.key) {
        case 'q':
          if (this.player.mode === Mode.walking) {
            this.player.setMode(Mode.sprintFlying)
            this.velocity.y = 0
          } else {
            this.player.setMode(Mode.walking)
          }
          break
        case 'w':
        case 'W':
          this.velocity.x += this.player.speed
          break
        case 's':
        case 'S':
          this.velocity.x -= this.player.speed
          break
        case 'a':
        case 'A':
          this.velocity.z -= this.player.speed
          break
        case 'd':
        case 'D':
          this.velocity.z += this.player.speed
          break
        case ' ':
          if (this.player.mode === Mode.walking) {
            if (!this.isJumping) {
              this.velocity.y = 8
              this.isJumping = true
              this.downCollide = false
              this.far = 0
              setTimeout(() => {
                this.far = 1.8
              }, 180)
            }
          } else {
            this.velocity.y += this.player.speed
          }
          break
        case 'Shift':
          if (this.player.mode === Mode.walking) {
          } else {
            this.velocity.y -= this.player.speed
          }
          break
        default:
          break
      }
    })
    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.repeat) {
        return
      }

      switch (e.key) {
        case 'w':
        case 'W':
          this.velocity.x -= this.player.speed
          break
        case 's':
        case 'S':
          this.velocity.x += this.player.speed
          break
        case 'a':
        case 'A':
          this.velocity.z += this.player.speed
          break
        case 'd':
        case 'D':
          this.velocity.z -= this.player.speed
          break
        case ' ':
          if (this.player.mode === Mode.walking) {
            return
          }
          this.velocity.y -= this.player.speed
          break
        case 'Shift':
          if (this.player.mode === Mode.walking) {
            return
          }
          this.velocity.y += this.player.speed
          break
        default:
          break
      }
    })
    document.addEventListener('mousedown', e => {
      e.preventDefault()
      switch (e.button) {
        case 0:
          {
            this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
            const block = this.raycaster.intersectObjects(
              this.terrain.blocks
            )[0]
            if (block && block.object instanceof THREE.InstancedMesh) {
              // calculation position
              let matrix = new THREE.Matrix4()
              block.object.getMatrixAt(block.instanceId!, matrix)
              const position = new THREE.Vector3().setFromMatrixPosition(matrix)

              //remove the block
              block.object.setMatrixAt(block.instanceId!, new THREE.Matrix4())

              // update
              block.object.instanceMatrix.needsUpdate = true

              let existed = false
              for (const customBlock of this.terrain.customBlocks) {
                if (
                  customBlock.x === position.x &&
                  customBlock.y === position.y &&
                  customBlock.z === position.z
                ) {
                  existed = true
                  customBlock.placed = false
                }
              }
              if (!existed) {
                this.terrain.customBlocks.push(
                  new Block(
                    position.x,
                    position.y,
                    position.z,
                    BlockType[block.object.name as any] as unknown as BlockType,
                    false
                  )
                )
              }
            }
          }
          break
        case 2:
          {
            this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
            const block = this.raycaster.intersectObjects(
              this.terrain.blocks
            )[0]

            if (block && block.object instanceof THREE.InstancedMesh) {
              // calculation normal and position
              const normal = block.face!.normal
              const matrix = new THREE.Matrix4()
              block.object.getMatrixAt(block.instanceId!, matrix)
              const position = new THREE.Vector3().setFromMatrixPosition(matrix)

              // return when block overlaps with player
              if (
                position.x + normal.x === Math.round(this.camera.position.x) &&
                position.z + normal.z === Math.round(this.camera.position.z) &&
                (position.y + normal.y === Math.round(this.camera.position.y) ||
                  position.y + normal.y ===
                    Math.round(this.camera.position.y - 1))
              ) {
                return
              }

              // put the block
              matrix.setPosition(
                normal.x + position.x,
                normal.y + position.y,
                normal.z + position.z
              )
              this.terrain.blocks[this.holdingBlock].setMatrixAt(
                this.terrain.getCount(this.holdingBlock),
                matrix
              )
              this.terrain.setCount(this.holdingBlock)

              // update
              this.terrain.blocks[
                this.holdingBlock
              ].instanceMatrix.needsUpdate = true

              this.terrain.customBlocks.push(
                new Block(
                  normal.x + position.x,
                  normal.y + position.y,
                  normal.z + position.z,
                  this.holdingBlock,
                  true
                )
              )
            }
          }
          break
        default:
          break
      }
    })
  }

  // move forward with direction factor
  moveX(distance: number, delta: number) {
    this.camera.position.x +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }

  // move right with direction factor
  moveZ = (distance: number, delta: number) => {
    this.camera.position.z +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }

  // collide checking
  collideCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[],
    far: number
  ) => {
    this.collideDownCheck(position, noise, customBlocks, far)
    this.collideFrontCheck(position, noise, customBlocks)
    this.collideBackCheck(position, noise, customBlocks)
    this.collideLeftCheck(position, noise, customBlocks)
    this.collideRightCheck(position, noise, customBlocks)
  }

  collideDownCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[],
    far: number
  ) => {
    this.raycasterDown.ray.origin = position
    this.raycasterDown.far = far
    let index = 0

    const matrix = new THREE.Matrix4()
    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(100 * 16),
      16
    )

    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    let x = Math.round(position.x)
    let z = Math.round(position.z)
    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.position)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          removed = true
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true
            }
          }
        }
      }
    }
    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(
          x / noise.treeGap,
          z / noise.treeGap,
          noise.treeSeed * noise.treeAmp
        )
        if (treeOffset < -0.7 && y >= 27) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    if (!removed) {
      matrix.setPosition(x, y, z)
      this.tempMesh.setMatrixAt(index++, matrix)
    }
    this.tempMesh.instanceMatrix.needsUpdate = true
    if (this.raycasterDown.intersectObject(this.tempMesh).length) {
      this.downCollide = true
    } else {
      this.downCollide = false
    }
  }

  collideFrontCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[]
  ) => {
    const matrix = new THREE.Matrix4()

    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(100 * 16),
      16
    )
    let index = 0

    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    let x = Math.round(position.x) + 1
    let z = Math.round(position.z)
    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    // custom blocks
    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.position)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          removed = true
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true
            }
          }
        }
      }
    }

    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(
          x / noise.treeGap,
          z / noise.treeGap,
          noise.treeSeed * noise.treeAmp
        )
        if (treeOffset < -0.7 && y >= 27) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    if (!removed) {
      matrix.setPosition(new THREE.Vector3(x, y, z))
      this.tempMesh.setMatrixAt(index++, matrix)
    }

    this.tempMesh.instanceMatrix.needsUpdate = true

    this.raycasterFront.ray.origin = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    )
    const c1 = this.raycasterFront.intersectObject(this.tempMesh).length
    this.raycasterFront.ray.origin = new THREE.Vector3(
      position.x,
      position.y - 1,
      position.z
    )
    const c2 = this.raycasterFront.intersectObject(this.tempMesh).length
    if (c1 || c2) {
      this.frontCollide = true
    } else {
      this.frontCollide = false
    }
  }

  collideBackCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[]
  ) => {
    const matrix = new THREE.Matrix4()

    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(100 * 16),
      16
    )
    let index = 0

    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    let x = Math.round(position.x) - 1
    let z = Math.round(position.z)
    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    // custom blocks
    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.position)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          removed = true
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true
            }
          }
        }
      }
    }

    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(
          x / noise.treeGap,
          z / noise.treeGap,
          noise.treeSeed * noise.treeAmp
        )
        if (treeOffset < -0.7 && y >= 27) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    if (!removed) {
      matrix.setPosition(new THREE.Vector3(x, y, z))
      this.tempMesh.setMatrixAt(index++, matrix)
    }

    this.tempMesh.instanceMatrix.needsUpdate = true

    this.raycasterBack.ray.origin = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    )
    const c1 = this.raycasterBack.intersectObject(this.tempMesh).length
    this.raycasterBack.ray.origin = new THREE.Vector3(
      position.x,
      position.y - 1,
      position.z
    )
    const c2 = this.raycasterBack.intersectObject(this.tempMesh).length
    if (c1 || c2) {
      this.backCollide = true
    } else {
      this.backCollide = false
    }
  }

  collideLeftCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[]
  ) => {
    const matrix = new THREE.Matrix4()

    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(100 * 16),
      16
    )
    let index = 0

    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    let x = Math.round(position.x)
    let z = Math.round(position.z) - 1
    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    // custom blocks
    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.position)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          removed = true
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true
            }
          }
        }
      }
    }

    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(
          x / noise.treeGap,
          z / noise.treeGap,
          noise.treeSeed * noise.treeAmp
        )
        if (treeOffset < -0.7 && y >= 27) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    if (!removed) {
      matrix.setPosition(new THREE.Vector3(x, y, z))
      this.tempMesh.setMatrixAt(index++, matrix)
    }

    this.tempMesh.instanceMatrix.needsUpdate = true

    this.raycasterLeft.ray.origin = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    )
    const c1 = this.raycasterLeft.intersectObject(this.tempMesh).length
    this.raycasterLeft.ray.origin = new THREE.Vector3(
      position.x,
      position.y - 1,
      position.z
    )
    const c2 = this.raycasterLeft.intersectObject(this.tempMesh).length
    if (c1 || c2) {
      this.leftCollide = true
    } else {
      this.leftCollide = false
    }
  }

  collideRightCheck = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[]
  ) => {
    const matrix = new THREE.Matrix4()

    this.tempMesh.instanceMatrix = this.tempMeshMatrix
    let index = 0

    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    let x = Math.round(position.x)
    let z = Math.round(position.z) + 1
    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    // custom blocks
    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          matrix.setPosition(block.position)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          removed = true
        } else {
          for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
            if (block.y === y + i) {
              treeRemoved[i] = true
            }
          }
        }
      }
    }

    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset = noise.get(
          x / noise.treeGap,
          z / noise.treeGap,
          noise.treeSeed * noise.treeAmp
        )
        if (treeOffset < -0.7 && y >= 27) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    if (!removed) {
      matrix.setPosition(new THREE.Vector3(x, y, z))
      this.tempMesh.setMatrixAt(index++, matrix)
    }

    this.tempMesh.instanceMatrix.needsUpdate = true

    this.raycasterRight.ray.origin = new THREE.Vector3(
      position.x,
      position.y,
      position.z
    )
    const c1 = this.raycasterRight.intersectObject(this.tempMesh).length
    this.raycasterRight.ray.origin = new THREE.Vector3(
      position.x,
      position.y - 1,
      position.z
    )
    const c2 = this.raycasterRight.intersectObject(this.tempMesh).length
    if (c1 || c2) {
      this.rightCollide = true
    } else {
      this.rightCollide = false
    }
  }

  update = () => {
    this.p1 = performance.now()
    const delta = (this.p1 - this.p2) / 1000
    if (
      // flying mode
      this.player.mode === Mode.flying ||
      this.player.mode === Mode.sprintFlying
    ) {
      this.control.moveForward(this.velocity.x * delta)
      this.control.moveRight(this.velocity.z * delta)
      this.camera.position.y += this.velocity.y * delta
    } else {
      // non-flying mode

      // gravity
      if (Math.abs(this.velocity.y) < this.player.falling) {
        this.velocity.y -= 25 * delta
      }

      this.collideCheck(
        this.camera.position,
        this.terrain.noise,
        this.terrain.customBlocks,
        this.far
      )

      // down collide and jump
      if (this.downCollide && !this.isJumping) {
        this.velocity.y = 0
      } else if (this.downCollide && this.isJumping) {
        this.isJumping = false
      }

      // side collide
      let vector = new THREE.Vector3(0, 0, -1).applyQuaternion(
        this.camera.quaternion
      )
      let direction = Math.atan2(vector.x, vector.z)
      if (
        this.frontCollide ||
        this.backCollide ||
        this.leftCollide ||
        this.rightCollide
      ) {
        // collide front (positive x)
        if (this.frontCollide) {
          // camera front
          if (direction < Math.PI && direction > 0 && this.velocity.x > 0) {
            if (
              (!this.leftCollide && direction > Math.PI / 2) ||
              (!this.rightCollide && direction < Math.PI / 2)
            ) {
              this.moveZ(Math.PI / 2 - direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera back
          if (direction < 0 && direction > -Math.PI && this.velocity.x < 0) {
            if (
              (!this.leftCollide && direction > -Math.PI / 2) ||
              (!this.rightCollide && direction < -Math.PI / 2)
            ) {
              this.moveZ(-Math.PI / 2 - direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera left
          if (
            direction < Math.PI / 2 &&
            direction > -Math.PI / 2 &&
            this.velocity.z < 0
          ) {
            if (
              (!this.rightCollide && direction < 0) ||
              (!this.leftCollide && direction > 0)
            ) {
              this.moveZ(-direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }

          // camera right
          if (
            (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
            this.velocity.z > 0
          ) {
            if (!this.rightCollide && direction > 0) {
              this.moveZ(Math.PI - direction, delta)
            }
            if (!this.leftCollide && direction < 0) {
              this.moveZ(-Math.PI - direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }

        // collide back (negative x)
        if (this.backCollide) {
          // camera front
          if (direction < 0 && direction > -Math.PI && this.velocity.x > 0) {
            if (
              (!this.leftCollide && direction < -Math.PI / 2) ||
              (!this.rightCollide && direction > -Math.PI / 2)
            ) {
              this.moveZ(Math.PI / 2 + direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera back
          if (direction < Math.PI && direction > 0 && this.velocity.x < 0) {
            if (
              (!this.leftCollide && direction < Math.PI / 2) ||
              (!this.rightCollide && direction > Math.PI / 2)
            ) {
              this.moveZ(direction - Math.PI / 2, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera left
          if (
            (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
            this.velocity.z < 0
          ) {
            if (!this.leftCollide && direction > 0) {
              this.moveZ(-Math.PI + direction, delta)
            }
            if (!this.rightCollide && direction < 0) {
              this.moveZ(Math.PI + direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }

          // camera right
          if (
            direction < Math.PI / 2 &&
            direction > -Math.PI / 2 &&
            this.velocity.z > 0
          ) {
            if (
              (!this.leftCollide && direction < 0) ||
              (!this.rightCollide && direction > 0)
            ) {
              this.moveZ(direction, delta)
            }
          } else if (
            !this.leftCollide &&
            !this.rightCollide &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }

        // collide left (negative z)
        if (this.leftCollide) {
          // camera front
          if (
            (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
            this.velocity.x > 0
          ) {
            if (!this.frontCollide && direction > 0) {
              this.moveX(Math.PI - direction, delta)
            }
            if (!this.backCollide && direction < 0) {
              this.moveX(-Math.PI - direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.frontCollide &&
            direction < 0 &&
            direction > -Math.PI / 2 &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.backCollide &&
            direction < Math.PI / 2 &&
            direction > 0 &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera back
          if (
            direction < Math.PI / 2 &&
            direction > -Math.PI / 2 &&
            this.velocity.x < 0
          ) {
            if (
              (!this.frontCollide && direction < 0) ||
              (!this.backCollide && direction > 0)
            ) {
              this.moveX(-direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.frontCollide &&
            direction < Math.PI &&
            direction > Math.PI / 2 &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.backCollide &&
            direction > -Math.PI &&
            direction < -Math.PI / 2 &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera left
          if (direction > 0 && direction < Math.PI && this.velocity.z < 0) {
            if (
              (!this.backCollide && direction > Math.PI / 2) ||
              (!this.frontCollide && direction < Math.PI / 2)
            ) {
              this.moveX(Math.PI / 2 - direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.frontCollide &&
            direction > -Math.PI &&
            direction < -Math.PI / 2 &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.backCollide &&
            direction > -Math.PI / 2 &&
            direction < 0 &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }

          // camera right
          if (direction < 0 && direction > -Math.PI && this.velocity.z > 0) {
            if (
              (!this.backCollide && direction > -Math.PI / 2) ||
              (!this.frontCollide && direction < -Math.PI / 2)
            ) {
              this.moveX(-Math.PI / 2 - direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.frontCollide &&
            direction < Math.PI / 2 &&
            direction > 0 &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.backCollide &&
            direction < Math.PI &&
            direction > Math.PI / 2 &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }

        // collide right (positive z)
        if (this.rightCollide) {
          // camera front
          if (
            direction < Math.PI / 2 &&
            direction > -Math.PI / 2 &&
            this.velocity.x > 0
          ) {
            if (
              (!this.backCollide && direction < 0) ||
              (!this.frontCollide && direction > 0)
            ) {
              this.moveX(direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.frontCollide &&
            direction < -Math.PI / 2 &&
            direction > -Math.PI &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.backCollide &&
            direction < Math.PI &&
            direction > Math.PI / 2 &&
            this.velocity.x > 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera back
          if (
            (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
            this.velocity.x < 0
          ) {
            if (!this.backCollide && direction > 0) {
              this.moveX(-Math.PI + direction, delta)
            }
            if (!this.frontCollide && direction < 0) {
              this.moveX(Math.PI + direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.frontCollide &&
            direction < Math.PI / 2 &&
            direction > 0 &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          } else if (
            this.backCollide &&
            direction < 0 &&
            direction > -Math.PI / 2 &&
            this.velocity.x < 0
          ) {
            this.control.moveForward(this.velocity.x * delta)
          }

          // camera left
          if (direction < 0 && direction > -Math.PI && this.velocity.z < 0) {
            if (
              (!this.frontCollide && direction > -Math.PI / 2) ||
              (!this.backCollide && direction < -Math.PI / 2)
            ) {
              this.moveX(Math.PI / 2 + direction, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.frontCollide &&
            direction > Math.PI / 2 &&
            direction < Math.PI &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.backCollide &&
            direction > 0 &&
            direction < Math.PI / 2 &&
            this.velocity.z < 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }

          // camera right
          if (direction > 0 && direction < Math.PI && this.velocity.z > 0) {
            if (
              (!this.frontCollide && direction > Math.PI / 2) ||
              (!this.backCollide && direction < Math.PI / 2)
            ) {
              this.moveX(direction - Math.PI / 2, delta)
            }
          } else if (
            !this.frontCollide &&
            !this.backCollide &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.frontCollide &&
            direction > -Math.PI / 2 &&
            direction < 0 &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          } else if (
            this.backCollide &&
            direction > -Math.PI &&
            direction < -Math.PI / 2 &&
            this.velocity.z > 0
          ) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }
      } else {
        // no collide
        this.control.moveForward(this.velocity.x * delta)
        this.control.moveRight(this.velocity.z * delta)
      }

      this.camera.position.y += this.velocity.y * delta

      // catching net
      if (this.camera.position.y < -100) {
        this.camera.position.y = 100
      }
    }
    this.p2 = this.p1
  }
}
