import Core from './core'
import Control from './control'
import Player from './player'
import Terrain from './terrain'
import UI from './ui'

import './style.css'

const renderDistance = 3
const chunkSize = 32

const core = new Core()
const camera = core.camera
const scene = core.scene
const renderer = core.renderer

const player = new Player()
const ui = new UI()

const terrain = new Terrain(scene, camera, renderDistance, chunkSize)
const control = new Control(scene, camera, player, terrain)

// animation
;(function animate() {
  // let p1 = performance.now()
  requestAnimationFrame(animate)

  control.update()
  terrain.update()
  ui.update()

  renderer.render(scene, camera)
  // console.log(performance.now() - p1)
})()
