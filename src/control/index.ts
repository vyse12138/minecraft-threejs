import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode, Speed } from '../player'
import Terrain from '../terrain'
import DownCollideWorker from './worker/downCollide?worker'

export default class Control {
  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    player: Player,
    terrain: Terrain
  ) {
    // init
    this.scene = scene
    this.camera = camera
    this.player = player
    this.terrain = terrain
    this.control = new PointerLockControls(camera, document.body)
    this.raycaster = new THREE.Raycaster(
      this.camera.position,
      this.downVector,
      0,
      player.body.height
    )
    this.initEventListeners()
    this.initWorker()
  }
  downCollideWorker: Worker = new DownCollideWorker()
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  control: PointerLockControls
  velocity = new THREE.Vector3(0, 0, 0)
  player: Player
  terrain: Terrain
  raycaster: THREE.Raycaster
  p1 = performance.now()
  p2 = performance.now()

  downVector = new THREE.Vector3(0, -1, 0)

  collideY = false

  initWorker = () => {
    this.downCollideWorker.onmessage = (
      msg: MessageEvent<{
        collideY: boolean
      }>
    ) => {
      this.collideY = msg.data.collideY
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
          this.velocity.y += this.player.speed
          break
        case 'Shift':
          this.velocity.y -= this.player.speed
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
          this.velocity.y -= this.player.speed
          break
        case 'Shift':
          this.velocity.y += this.player.speed
          break
        default:
          break
      }
    })
  }

  update = () => {
    this.p1 = performance.now()
    const delta = (this.p1 - this.p2) / 1000
    if (
      this.player.mode === Mode.flying ||
      this.player.mode === Mode.sprintFlying
    ) {
      this.control.moveForward(this.velocity.x * delta)
      this.control.moveRight(this.velocity.z * delta)
      this.camera.position.y += this.velocity.y * delta
    } else {
      this.control.moveForward(this.velocity.x * delta)
      this.control.moveRight(this.velocity.z * delta)
      if (Math.abs(this.velocity.y) < this.player.falling) {
        this.velocity.y -= 0.2
      }
      if (this.collideY) {
        this.velocity.y = 0
      }

      this.downCollideWorker.postMessage({
        position: this.camera.position,
        direction: this.downVector,
        matrices: this.terrain.blocks.map(block => block.instanceMatrix),
        count: this.terrain.count
      })

      this.camera.position.y += this.velocity.y * delta

      if (this.camera.position.y < -100) {
        this.camera.position.y = 100
      }
    }

    this.p2 = this.p1
  }
}
