import * as THREE from 'three'
import Core from './core'
import Control from './control'

import dirt from '../textures/block/dirt.png'
import UI from './ui'

import './style.css'

const core = new Core()
const camera = core.camera
const scene = core.scene
const renderer = core.renderer

const ui = new UI()
const control = new Control(camera, scene)

//random
let loader = new THREE.TextureLoader()
const dirtMaterial = loader.load(dirt)
dirtMaterial.magFilter = THREE.NearestFilter

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ map: dirtMaterial })
const cube = new THREE.Mesh(geometry, material)

cube.position.x = 35
cube.position.y = 16
cube.position.z = 31

const getRan = () => {
  return Math.round(Math.random() * 4 - 4)
}
for (let x = 0; x < 100; x++) {
  for (let z = 0; z < 100; z++) {
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(x, 15 + getRan(), z)
    scene.add(cube)
  }
}

console.log(scene)
;(function animate() {
  requestAnimationFrame(animate)
  control.update()
  ui.update()
  renderer.render(scene, camera)
})()
