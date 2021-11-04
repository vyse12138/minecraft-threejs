import * as THREE from 'three'
export default function initScene() {
  let scene = new THREE.Scene()
  let backgroundColor = 0x87ceeb
  scene.fog = new THREE.FogExp2(backgroundColor, 0.01)
  scene.background = new THREE.Color(backgroundColor)

  const sunLight = new THREE.PointLight(0xffffff, 0.5)
  sunLight.position.set(500, 500, 500)
  scene.add(sunLight)

  const sunLight2 = new THREE.PointLight(0xffffff, 0.2)
  sunLight2.position.set(-500, 500, -500)
  scene.add(sunLight2)

  const reflectionLight = new THREE.AmbientLight(0x404040)
  scene.add(reflectionLight)

  const sunGeometry = new THREE.SphereGeometry(5, 32, 32)
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const sun = new THREE.Mesh(sunGeometry, sunMaterial)
  sun.position.y = 100
  sun.position.x = 200
  sun.position.z = 150
  scene.add(sun)

  return scene
}
