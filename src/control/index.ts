import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode } from '../player'
import Terrain, { BlockType } from '../terrain'

import Block from '../terrain/mesh/block'
import Noise from '../terrain/noise'
import Audio from '../audio'
import { isMobile } from '../utils'
enum Side {
  front,
  back,
  left,
  right,
  down,
  up
}

export default class Control {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    player: Player,
    terrain: Terrain,
    audio: Audio
  ) {
    this.scene = scene
    this.camera = camera
    this.player = player
    this.terrain = terrain
    this.control = new PointerLockControls(camera, document.body)
    this.audio = audio

    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 8
    this.far = this.player.body.height

    this.initRayCaster()
    this.initEventListeners()
  }

  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  player: Player
  terrain: Terrain
  control: PointerLockControls
  audio: Audio
  velocity = new THREE.Vector3(0, 0, 0)

  // collide and jump properties
  frontCollide = false
  backCollide = false
  leftCollide = false
  rightCollide = false
  downCollide = true
  upCollide = false
  isJumping = false

  raycasterDown = new THREE.Raycaster()
  raycasterUp = new THREE.Raycaster()
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
  far: number

  holdingBlock = BlockType.grass
  holdingBlocks = [
    BlockType.grass,
    BlockType.stone,
    BlockType.tree,
    BlockType.wood,
    BlockType.diamond,
    BlockType.quartz,
    BlockType.glass,
    BlockType.grass,
    BlockType.grass,
    BlockType.grass
  ]
  holdingIndex = 0
  wheelGap = false
  clickInterval?: ReturnType<typeof setInterval>
  jumpInterval?: ReturnType<typeof setInterval>
  mouseHolding = false
  spaceHolding = false

  initRayCaster = () => {
    this.raycasterUp.ray.direction = new THREE.Vector3(0, 1, 0)
    this.raycasterDown.ray.direction = new THREE.Vector3(0, -1, 0)
    this.raycasterFront.ray.direction = new THREE.Vector3(1, 0, 0)
    this.raycasterBack.ray.direction = new THREE.Vector3(-1, 0, 0)
    this.raycasterLeft.ray.direction = new THREE.Vector3(0, 0, -1)
    this.raycasterRight.ray.direction = new THREE.Vector3(0, 0, 1)

    this.raycasterUp.far = 1.2
    this.raycasterDown.far = this.player.body.height
    this.raycasterFront.far = this.player.body.width
    this.raycasterBack.far = this.player.body.width
    this.raycasterLeft.far = this.player.body.width
    this.raycasterRight.far = this.player.body.width
  }

  downKeys = {
    a: false,
    d: false,
    w: false,
    s: false
  }
  setMovementHandler = (e: KeyboardEvent) => {
    if (e.repeat) {
      return
    }

    switch (e.key) {
      case 'q':
        if (this.player.mode === Mode.walking) {
          this.player.setMode(Mode.flying)
        } else {
          this.player.setMode(Mode.walking)
        }
        this.velocity.y = 0
        this.velocity.x = 0
        this.velocity.z = 0
        break
      case 'w':
      case 'W':
        this.downKeys.w = true
        this.velocity.x = this.player.speed
        break
      case 's':
      case 'S':
        this.downKeys.s = true
        this.velocity.x = -this.player.speed
        break
      case 'a':
      case 'A':
        this.downKeys.a = true
        this.velocity.z = -this.player.speed
        break
      case 'd':
      case 'D':
        this.downKeys.d = true
        this.velocity.z = this.player.speed
        break
      case ' ':
        if (this.player.mode === Mode.sneaking && !this.isJumping) {
          return
        }
        if (this.player.mode === Mode.walking) {
          // jump
          if (!this.isJumping) {
            this.velocity.y = 8
            this.isJumping = true
            this.downCollide = false
            this.far = 0
            setTimeout(() => {
              this.far = this.player.body.height
            }, 300)
          }
        } else {
          this.velocity.y += this.player.speed
        }
        if (this.player.mode === Mode.walking && !this.spaceHolding) {
          this.spaceHolding = true
          this.jumpInterval = setInterval(() => {
            this.setMovementHandler(e)
          }, 10)
        }
        break
      case 'Shift':
        if (this.player.mode === Mode.walking) {
          if (!this.isJumping) {
            this.player.setMode(Mode.sneaking)
            if (this.downKeys.w) {
              this.velocity.x = this.player.speed
            }
            if (this.downKeys.s) {
              this.velocity.x = -this.player.speed
            }
            if (this.downKeys.a) {
              this.velocity.z = -this.player.speed
            }
            if (this.downKeys.d) {
              this.velocity.z = this.player.speed
            }
            this.camera.position.setY(this.camera.position.y - 0.2)
          }
        } else {
          this.velocity.y -= this.player.speed
        }
        break
      default:
        break
    }
  }

  resetMovementHandler = (e: KeyboardEvent) => {
    if (e.repeat) {
      return
    }

    switch (e.key) {
      case 'w':
      case 'W':
        this.downKeys.w = false
        this.velocity.x = 0
        break
      case 's':
      case 'S':
        this.downKeys.s = false
        this.velocity.x = 0
        break
      case 'a':
      case 'A':
        this.downKeys.a = false
        this.velocity.z = 0
        break
      case 'd':
      case 'D':
        this.downKeys.d = false
        this.velocity.z = 0
        break
      case ' ':
        if (this.player.mode === Mode.sneaking && !this.isJumping) {
          return
        }
        this.jumpInterval && clearInterval(this.jumpInterval)
        this.spaceHolding = false
        if (this.player.mode === Mode.walking) {
          return
        }
        this.velocity.y = 0
        break
      case 'Shift':
        if (this.player.mode === Mode.sneaking) {
          if (!this.isJumping) {
            this.player.setMode(Mode.walking)
            if (this.downKeys.w) {
              this.velocity.x = this.player.speed
            }
            if (this.downKeys.s) {
              this.velocity.x = -this.player.speed
            }
            if (this.downKeys.a) {
              this.velocity.z = -this.player.speed
            }
            if (this.downKeys.d) {
              this.velocity.z = this.player.speed
            }
            this.camera.position.setY(this.camera.position.y + 0.2)
          }
        }
        if (this.player.mode === Mode.walking) {
          return
        }
        this.velocity.y = 0
        break
      default:
        break
    }
  }

  mousedownHandler = (e: MouseEvent) => {
    e.preventDefault()
    // let p1 = performance.now()
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
    const block = this.raycaster.intersectObjects(this.terrain.blocks)[0]
    const matrix = new THREE.Matrix4()

    switch (e.button) {
      // left click to remove block
      case 0:
        {
          if (block && block.object instanceof THREE.InstancedMesh) {
            // calculate position
            block.object.getMatrixAt(block.instanceId!, matrix)
            const position = new THREE.Vector3().setFromMatrixPosition(matrix)

            // don't remove bedrock
            if (
              (BlockType[block.object.name as any] as unknown as BlockType) ===
              BlockType.bedrock
            ) {
              this.terrain.generateAdjacentBlocks(position)
              return
            }

            // remove the block
            block.object.setMatrixAt(
              block.instanceId!,
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

            // block and sound effect
            this.audio.playSound(
              BlockType[block.object.name as any] as unknown as BlockType
            )

            const mesh = new THREE.Mesh(
              new THREE.BoxGeometry(1, 1, 1),
              this.terrain.materials.get(
                this.terrain.materialType[
                  parseInt(BlockType[block.object.name as any])
                ]
              )
            )
            mesh.position.set(position.x, position.y, position.z)
            this.scene.add(mesh)
            const time = performance.now()
            let raf = 0
            const animate = () => {
              if (performance.now() - time > 250) {
                this.scene.remove(mesh)
                cancelAnimationFrame(raf)
                return
              }
              raf = requestAnimationFrame(animate)
              mesh.geometry.scale(0.85, 0.85, 0.85)
            }
            animate()

            // update
            block.object.instanceMatrix.needsUpdate = true

            // check existence
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

            // add to custom blocks when it's not existed
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

            // generate adjacent blocks
            this.terrain.generateAdjacentBlocks(position)
          }
        }
        break

      // right click to put block
      case 2:
        {
          if (block && block.object instanceof THREE.InstancedMesh) {
            // calculate normal and position
            const normal = block.face!.normal
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

            //sound effect
            this.audio.playSound(this.holdingBlock)

            // update
            this.terrain.blocks[this.holdingBlock].instanceMatrix.needsUpdate =
              true

            // add to custom blocks
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

    if (!isMobile && !this.mouseHolding) {
      this.mouseHolding = true
      this.clickInterval = setInterval(() => {
        this.mousedownHandler(e)
      }, 333)
    }

    // console.log(performance.now() - p1)
  }
  mouseupHandler = () => {
    this.clickInterval && clearInterval(this.clickInterval)
    this.mouseHolding = false
  }

  changeHoldingBlockHandler = (e: KeyboardEvent) => {
    if (isNaN(parseInt(e.key)) || e.key === '0') {
      return
    }
    this.holdingIndex = parseInt(e.key) - 1

    this.holdingBlock = this.holdingBlocks[this.holdingIndex] ?? BlockType.grass
  }

  wheelHandler = (e: WheelEvent) => {
    if (!this.wheelGap) {
      this.wheelGap = true
      setTimeout(() => {
        this.wheelGap = false
      }, 100)
      if (e.deltaY > 0) {
        this.holdingIndex++
        this.holdingIndex > 9 && (this.holdingIndex = 0)
      } else if (e.deltaY < 0) {
        this.holdingIndex--
        this.holdingIndex < 0 && (this.holdingIndex = 9)
      }
      this.holdingBlock =
        this.holdingBlocks[this.holdingIndex] ?? BlockType.grass
    }
  }

  initEventListeners = () => {
    // add / remove handler when pointer lock / unlock
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        document.body.addEventListener(
          'keydown',
          this.changeHoldingBlockHandler
        )
        document.body.addEventListener('wheel', this.wheelHandler)
        document.body.addEventListener('keydown', this.setMovementHandler)
        document.body.addEventListener('keyup', this.resetMovementHandler)
        document.body.addEventListener('mousedown', this.mousedownHandler)
        document.body.addEventListener('mouseup', this.mouseupHandler)
      } else {
        document.body.removeEventListener(
          'keydown',
          this.changeHoldingBlockHandler
        )
        document.body.removeEventListener('wheel', this.wheelHandler)
        document.body.removeEventListener('keydown', this.setMovementHandler)
        document.body.removeEventListener('keyup', this.resetMovementHandler)
        document.body.removeEventListener('mousedown', this.mousedownHandler)
        document.body.removeEventListener('mouseup', this.mouseupHandler)
        this.velocity = new THREE.Vector3(0, 0, 0)
      }
    })
  }

  // move along X with direction factor
  moveX(distance: number, delta: number) {
    this.camera.position.x +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }

  // move along Z with direction factor
  moveZ = (distance: number, delta: number) => {
    this.camera.position.z +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }

  // collide checking
  collideCheckAll = (
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[],
    far: number
  ) => {
    this.collideCheck(Side.down, position, noise, customBlocks, far)
    this.collideCheck(Side.front, position, noise, customBlocks)
    this.collideCheck(Side.back, position, noise, customBlocks)
    this.collideCheck(Side.left, position, noise, customBlocks)
    this.collideCheck(Side.right, position, noise, customBlocks)
    this.collideCheck(Side.up, position, noise, customBlocks)
  }

  collideCheck = (
    side: Side,
    position: THREE.Vector3,
    noise: Noise,
    customBlocks: Block[],
    far: number = this.player.body.width
  ) => {
    const matrix = new THREE.Matrix4()

    //reset simulation blocks
    let index = 0
    this.tempMesh.instanceMatrix = new THREE.InstancedBufferAttribute(
      new Float32Array(100 * 16),
      16
    )

    // block to remove
    let removed = false
    let treeRemoved = new Array<boolean>(
      this.terrain.noise.treeHeight + 1
    ).fill(false)

    // get block position
    let x = Math.round(position.x)
    let z = Math.round(position.z)

    switch (side) {
      case Side.front:
        x++
        this.raycasterFront.ray.origin = position
        break
      case Side.back:
        x--
        this.raycasterBack.ray.origin = position
        break
      case Side.left:
        z--
        this.raycasterLeft.ray.origin = position
        break
      case Side.right:
        z++
        this.raycasterRight.ray.origin = position
        break
      case Side.down:
        this.raycasterDown.ray.origin = position
        this.raycasterDown.far = far
        break
      case Side.up:
        this.raycasterUp.ray.origin = new THREE.Vector3().copy(position)
        this.raycasterUp.ray.origin.y--
        break
    }

    let y =
      Math.floor(
        noise.get(x / noise.gap, z / noise.gap, noise.seed) * noise.amp
      ) + 30

    // check custom blocks
    for (const block of customBlocks) {
      if (block.x === x && block.z === z) {
        if (block.placed) {
          // placed blocks
          matrix.setPosition(block.x, block.y, block.z)
          this.tempMesh.setMatrixAt(index++, matrix)
        } else if (block.y === y) {
          // removed blocks
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

    // update simulation blocks (ignore removed blocks)
    if (!removed) {
      matrix.setPosition(x, y, z)
      this.tempMesh.setMatrixAt(index++, matrix)
    }
    for (let i = 1; i <= this.terrain.noise.treeHeight; i++) {
      if (!treeRemoved[i]) {
        let treeOffset =
          noise.get(x / noise.treeGap, z / noise.treeGap, noise.treeSeed) *
          noise.treeAmp

        let stoneOffset =
          noise.get(x / noise.stoneGap, z / noise.stoneGap, noise.stoneSeed) *
          noise.stoneAmp

        if (
          treeOffset > noise.treeThreshold &&
          y >= 27 &&
          stoneOffset < noise.stoneThreshold
        ) {
          matrix.setPosition(x, y + i, z)
          this.tempMesh.setMatrixAt(index++, matrix)
        }
      }
    }

    // sneaking check
    if (
      this.player.mode === Mode.sneaking &&
      y < Math.floor(this.camera.position.y - 2) &&
      side !== Side.down &&
      side !== Side.up
    ) {
      matrix.setPosition(x, Math.floor(this.camera.position.y - 1), z)
      this.tempMesh.setMatrixAt(index++, matrix)
    }
    this.tempMesh.instanceMatrix.needsUpdate = true

    // update collide
    const origin = new THREE.Vector3(position.x, position.y - 1, position.z)
    switch (side) {
      case Side.front: {
        const c1 = this.raycasterFront.intersectObject(this.tempMesh).length
        this.raycasterFront.ray.origin = origin
        const c2 = this.raycasterFront.intersectObject(this.tempMesh).length
        c1 || c2 ? (this.frontCollide = true) : (this.frontCollide = false)

        break
      }
      case Side.back: {
        const c1 = this.raycasterBack.intersectObject(this.tempMesh).length
        this.raycasterBack.ray.origin = origin
        const c2 = this.raycasterBack.intersectObject(this.tempMesh).length
        c1 || c2 ? (this.backCollide = true) : (this.backCollide = false)
        break
      }
      case Side.left: {
        const c1 = this.raycasterLeft.intersectObject(this.tempMesh).length
        this.raycasterLeft.ray.origin = origin
        const c2 = this.raycasterLeft.intersectObject(this.tempMesh).length
        c1 || c2 ? (this.leftCollide = true) : (this.leftCollide = false)
        break
      }
      case Side.right: {
        const c1 = this.raycasterRight.intersectObject(this.tempMesh).length
        this.raycasterRight.ray.origin = origin
        const c2 = this.raycasterRight.intersectObject(this.tempMesh).length
        c1 || c2 ? (this.rightCollide = true) : (this.rightCollide = false)
        break
      }
      case Side.down: {
        const c1 = this.raycasterDown.intersectObject(this.tempMesh).length
        c1 ? (this.downCollide = true) : (this.downCollide = false)
        break
      }
      case Side.up: {
        const c1 = this.raycasterUp.intersectObject(this.tempMesh).length
        c1 ? (this.upCollide = true) : (this.upCollide = false)
        break
      }
    }
  }

  update = () => {
    this.p1 = performance.now()
    const delta = (this.p1 - this.p2) / 1000
    if (
      // dev mode
      this.player.mode === Mode.flying
    ) {
      this.control.moveForward(this.velocity.x * delta)
      this.control.moveRight(this.velocity.z * delta)
      this.camera.position.y += this.velocity.y * delta
    } else {
      // normal mode
      this.collideCheckAll(
        this.camera.position,
        this.terrain.noise,
        this.terrain.customBlocks,
        this.far - this.velocity.y * delta
      )

      // gravity
      if (Math.abs(this.velocity.y) < this.player.falling) {
        this.velocity.y -= 25 * delta
      }

      // up collide handler
      if (this.upCollide) {
        this.velocity.y = -225 * delta
        this.far = this.player.body.height
      }

      // down collide and jump handler
      if (this.downCollide && !this.isJumping) {
        this.velocity.y = 0
      } else if (this.downCollide && this.isJumping) {
        this.isJumping = false
      }

      // side collide handler
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
        this.camera.position.y = 60
      }
    }
    this.p2 = this.p1
  }
}
