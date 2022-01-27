import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import Player, { Mode, Speed } from '../player'

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
      if (e.repeat) {
        return
      }
      switch (e.key) {
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
    this.control.moveForward(this.velocity.x * delta)
    this.control.moveRight(this.velocity.z * delta)
    this.camera.position.y += this.velocity.y * delta
    this.p2 = this.p1
  }
}
