import Core from './core'
import Control from './control'
import Player from './player'

import Terrain from './terrain'

import UI from './ui'

import './style.css'

const renderDistance = 3

const core = new Core()
const camera = core.camera
const scene = core.scene
const renderer = core.renderer
const player = new Player()

const ui = new UI()

const terrain = new Terrain(scene, camera, renderDistance)
const control = new Control(scene, camera, player, terrain)

// an
console.log(scene)
;(function animate() {
  requestAnimationFrame(animate)
  control.update()
  terrain.update()
  ui.update()
  renderer.render(scene, camera)
})()
