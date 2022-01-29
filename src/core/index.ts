import * as THREE from 'three'

export default class Core {
  constructor() {
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer()
    this.scene = new THREE.Scene()
    this.initScene()
    this.initRenderer()
    this.initCamera()
  }

  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  renderer: THREE.Renderer

  initCamera = () => {
    this.camera.fov = 50
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.near = 0.1
    this.camera.far = 500
    this.camera.updateProjectionMatrix()
    this.camera.position.set(8, 40, 8)

    this.camera.lookAt(100, 30, 100)

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
    })
  }

  initScene = () => {
    this.scene = new THREE.Scene()
    const backgroundColor = 0x87ceeb

    this.scene.fog = new THREE.FogExp2(backgroundColor, 0.01)
    this.scene.background = new THREE.Color(backgroundColor)

    const sunLight = new THREE.PointLight(0xffffff, 0.5)
    sunLight.position.set(500, 500, 500)
    this.scene.add(sunLight)

    const sunLight2 = new THREE.PointLight(0xffffff, 0.2)
    sunLight2.position.set(-500, 500, -500)
    this.scene.add(sunLight2)

    const reflectionLight = new THREE.AmbientLight(0x404040)
    this.scene.add(reflectionLight)

    const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const sun = new THREE.Mesh(sunGeometry, sunMaterial)
    sun.position.y = 100
    sun.position.x = 100
    sun.position.z = 8
    this.scene.add(sun)
  }

  initRenderer = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })
  }
}
