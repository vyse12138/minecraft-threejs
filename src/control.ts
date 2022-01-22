import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
export default class Control {
  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    // init
    this.scene = scene
    this.camera = camera

    // some global variables
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
    this.control = new PointerLockControls(camera, document.body)

    document.body.addEventListener('click', () => {
      this.control.lock()
    })
    document.addEventListener('mousewheel', () => {
      this.control.unlock()
    })
  }

  euler: THREE.Euler
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  control: PointerLockControls
  p1 = performance.now()
  p2 = performance.now()

  update() {
    this.p1 = performance.now()

    const delta = this.p1 - this.p2 / 1000
    this.p2 = this.p1
  }
}
