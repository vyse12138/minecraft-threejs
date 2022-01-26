import * as THREE from 'three'
import Core from './core'
import Control from './control'
import Player from './player'

import dirt from '../textures/block/dirt.png'
import UI from './ui'

import './style.css'

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

const core = new Core()
const camera = core.camera
const scene = core.scene
const renderer = core.renderer
const player = new Player()

const ui = new UI()
const control = new Control(camera, scene, player)

//random
let seed = Math.random() * 100
let perlin = new ImprovedNoise()
let perlin2 = new SimplexNoise(Math)
let loader = new THREE.TextureLoader()

const dirtMaterial = loader.load(dirt)
dirtMaterial.magFilter = THREE.NearestFilter
const material = new THREE.MeshStandardMaterial({ map: dirtMaterial })
const geometry = new THREE.BoxGeometry()
const color = new THREE.Color()

const mesh = new THREE.InstancedMesh(geometry, material, 500000)
const matrix = new THREE.Matrix4()
let i = 0
for (let x = 1; x < 100; x++) {
  for (let y = 1; y < 30; y++) {
    for (let z = 1; z < 100; z++) {
      let no2 = perlin.noise(x, z, seed)
      if (no2 > 0) {
        matrix.setPosition(x, y, z)
        mesh.setColorAt(i, color)
        mesh.setMatrixAt(i++, matrix)
      }
    }
  }
}
scene.add(mesh)
// an

console.log(scene)
;(function animate() {
  requestAnimationFrame(animate)
  control.update()
  ui.update()
  renderer.render(scene, camera)
})()
