import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode } from '../player'
import Terrain, { BlockType } from '../terrain'
import DownCollideWorker from './worker/downCollide?worker'
import FrontCollideWorker from './worker/frontCollide?worker'
import BackCollideWorker from './worker/backCollide?worker'
import LeftCollideWorker from './worker/leftCollide?worker'
import RightCollideWorker from './worker/rightCollide?worker'
import Block from '../terrain/mesh/block'

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
    this.initWorker()
  }
  // core properties
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  player: Player
  terrain: Terrain
  control: PointerLockControls
  velocity = new THREE.Vector3(0, 0, 0)

  // collide and jump properties
  downCollideWorker: Worker = new DownCollideWorker()
  frontCollideWorker: Worker = new FrontCollideWorker()
  backCollideWorker: Worker = new BackCollideWorker()
  leftCollideWorker: Worker = new LeftCollideWorker()
  rightCollideWorker: Worker = new RightCollideWorker()

  downCollide = false
  frontCollide = false
  backCollide = false
  leftCollide = false
  rightCollide = false

  isJumping = false
  isJumpingFrame = false

  // other properties
  p1 = performance.now()
  p2 = performance.now()
  raycaster: THREE.Raycaster

  // constants
  far = 1.8

  initWorker = () => {
    this.downCollideWorker.onmessage = (msg: MessageEvent<boolean>) => {
      if (this.isJumpingFrame) {
        this.isJumpingFrame = false
        return
      }
      this.downCollide = msg.data
    }
    this.frontCollideWorker.onmessage = (msg: MessageEvent<boolean>) => {
      this.frontCollide = msg.data
    }
    this.backCollideWorker.onmessage = (msg: MessageEvent<boolean>) => {
      this.backCollide = msg.data
    }
    this.leftCollideWorker.onmessage = (msg: MessageEvent<boolean>) => {
      this.leftCollide = msg.data
    }
    this.rightCollideWorker.onmessage = (msg: MessageEvent<boolean>) => {
      this.rightCollide = msg.data
    }
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
              this.isJumpingFrame = true
              this.downCollide = false
              this.far = 0
              setTimeout(() => {
                this.far = 1.8
              }, 300)
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
              for (const block of this.terrain.customBlocks) {
                if (
                  block.x === position.x &&
                  block.y === position.y &&
                  block.z === position.z
                ) {
                  existed = true
                  block.placed = false
                }
              }
              if (!existed) {
                this.terrain.customBlocks.push(
                  new Block(
                    position.x,
                    position.y,
                    position.z,
                    BlockType.grass,
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
              block.object.setMatrixAt(
                this.terrain.getCount(BlockType.grass),
                matrix
              )
              block.object.setColorAt(
                this.terrain.getCount(BlockType.grass),
                new THREE.Color()
              )
              this.terrain.setCount(BlockType.grass)

              // update
              block.object.instanceColor!.needsUpdate = true
              block.object.instanceMatrix.needsUpdate = true

              let existed = false
              for (const block of this.terrain.customBlocks) {
                if (
                  block.x === normal.x + position.x &&
                  block.y === normal.y + position.y &&
                  block.z === normal.z + position.z
                ) {
                  existed = true
                  block.placed = true
                }
              }
              if (!existed) {
                this.terrain.customBlocks.push(
                  new Block(
                    normal.x + position.x,
                    normal.y + position.y,
                    normal.z + position.z,
                    BlockType.grass,
                    true
                  )
                )
              }
            }
          }
          break
        default:
          break
      }
    })
  }

  i = 0
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

      // post calculation to worker

      this.downCollideWorker.postMessage({
        position: this.camera.position,
        far: this.far - this.velocity.y * delta,
        blocks: this.terrain.customBlocks,
        seed: this.terrain.seed,
        noiseAmp: this.terrain.noiseAmp,
        noiseGap: this.terrain.noiseGap
      })

      if (this.i++ === 60) {
        this.i = 0
      }

      this.frontCollideWorker.postMessage({
        position: this.camera.position,
        matrices: this.terrain.blocks.map(block => block.instanceMatrix),
        count: this.terrain.maxCount
      })
      this.backCollideWorker.postMessage({
        position: this.camera.position,
        matrices: this.terrain.blocks.map(block => block.instanceMatrix),
        count: this.terrain.maxCount
      })
      this.leftCollideWorker.postMessage({
        position: this.camera.position,
        matrices: this.terrain.blocks.map(block => block.instanceMatrix),
        count: this.terrain.maxCount
      })
      this.rightCollideWorker.postMessage({
        position: this.camera.position,
        matrices: this.terrain.blocks.map(block => block.instanceMatrix),
        count: this.terrain.maxCount
      })

      // gravity
      if (Math.abs(this.velocity.y) < this.player.falling) {
        this.velocity.y -= 25 * delta
      }

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
        // collide front
        if (this.frontCollide) {
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
          } else if (!this.backCollide && this.velocity.z < 0) {
            this.control.moveRight(this.velocity.z * delta)
          }

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
          } else if (!this.backCollide && this.velocity.z > 0) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }

        // collide back
        if (this.backCollide) {
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
          } else if (!this.frontCollide && this.velocity.z < 0) {
            this.control.moveRight(this.velocity.z * delta)
          }
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
          } else if (!this.frontCollide && this.velocity.z > 0) {
            this.control.moveRight(this.velocity.z * delta)
          }
        }

        // collide left
        if (this.leftCollide) {
          if (
            direction < -Math.PI / 2 ||
            (direction > Math.PI / 2 && this.velocity.x > 0)
          ) {
            if (!this.frontCollide && direction > 0) {
              this.moveX(Math.PI - direction, delta)
            }
            if (!this.backCollide && direction < 0) {
              this.moveX(-Math.PI - direction, delta)
            }
          } else if (!this.rightCollide && this.velocity.x > 0) {
            this.control.moveForward(this.velocity.x * delta)
          }
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
          } else if (!this.rightCollide && this.velocity.x < 0) {
            this.control.moveForward(this.velocity.x * delta)
          }
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
          }
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
          }
        }

        // collide right
        if (this.rightCollide) {
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
          } else if (!this.leftCollide && this.velocity.x > 0) {
            this.control.moveForward(this.velocity.x * delta)
          }
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
          } else if (!this.leftCollide && this.velocity.x < 0) {
            this.control.moveForward(this.velocity.x * delta)
          }
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
          }
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
          }
        }
      } else {
        this.control.moveForward(this.velocity.x * delta)
        this.control.moveRight(this.velocity.z * delta)
      }

      this.camera.position.y += this.velocity.y * delta

      // update camera

      // catching net
      if (this.camera.position.y < -100) {
        this.camera.position.y = 100
      }
    }
    this.p2 = this.p1
  }
  moveZ = (distance: number, delta: number) => {
    this.camera.position.z +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }
  moveX(distance: number, delta: number) {
    this.camera.position.x +=
      distance * (this.player.speed / Math.PI) * 2 * delta
  }
}
