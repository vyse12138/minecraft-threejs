import Core from './core'
import Control from './control'
import Player from './player'
import Terrain from './terrain'
import UI from './ui'
import Audio from './audio'

import './style.css'

const renderDistance = 3
const chunkSize = 24

const core = new Core()
const camera = core.camera
const scene = core.scene
const renderer = core.renderer
const ui = new UI()

const player = new Player()

const terrain = new Terrain(scene, camera, renderDistance, chunkSize)
const control = new Control(scene, camera, player, terrain)

const audio = new Audio(camera)

// animation
;(function animate() {
  // let p1 = performance.now()
  requestAnimationFrame(animate)

  control.update()
  terrain.update()
  ui.update()
  audio.update()
  renderer.render(scene, camera)
  // console.log(performance.now() - p1)
})()
