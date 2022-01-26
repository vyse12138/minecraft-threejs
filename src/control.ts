import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode, Speed } from './player'

export default class Control {
  constructor(
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    player: Player
  ) {
    // init
    this.scene = scene
    this.player = player
    this.camera = camera
    this.control = new PointerLockControls(camera, document.body)
    this.initEventListeners()
  }

  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  control: PointerLockControls
  velocity = new THREE.Vector3(0, 0, 0)
  player: Player

  p1 = performance.now()
  p2 = performance.now()

  initEventListeners = () => {
    document.body.addEventListener('click', () => {
      this.control.lock()
    })
    document.addEventListener('mousewheel', () => {
      this.control.unlock()
    })
    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
          this.velocity.setX(this.player.speed)
          break
        case 's':
          this.velocity.setX(-this.player.speed)
          break
        case 'a':
          this.velocity.setZ(-this.player.speed)
          break
        case 'd':
          this.velocity.setZ(this.player.speed)
          break
        case ' ':
          this.velocity.setY(this.player.speed)
          break
        case 'Shift':
          this.velocity.setY(-this.player.speed)
          break
        default:
          break
      }
    })
    document.body.addEventListener('keyup', (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 's':
          this.velocity.setX(0)
          break
        case 'a':
        case 'd':
          this.velocity.setZ(0)
          break
        case ' ':
        case 'Shift':
          this.velocity.setY(0)
          break
        default:
          break
      }
    })
  }

  update = () => {
    this.p1 = performance.now()
    const delta = (this.p1 - this.p2) / 1000
    this.control.moveForward(this.velocity.x * delta)
    this.control.moveRight(this.velocity.z * delta)
    this.camera.position.y += this.velocity.y * delta
    this.p2 = this.p1
  }
}
