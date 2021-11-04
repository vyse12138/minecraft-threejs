import * as THREE from 'three'
import initCamera from './init/Camera.js'
import initScene from './init/Scene.js'
import initRenderer from './init/Renderer.js'
import initStats from './init/Stats.js'

import Control from './controls/Control.js'
import BlockHighlight from './mesh/BlockHighlight.js'

import TerrainGenerator from './terrains/TerrainGenerator.js'

const scene = initScene()
const camera = initCamera()
const renderer = initRenderer()
const stats = initStats()

const terrainGenerator = new TerrainGenerator(scene)
terrainGenerator.build()

const blockHighlight = new BlockHighlight(camera, scene, terrainGenerator)
const control = new Control(camera, scene, terrainGenerator)

;(function animate() {
  requestAnimationFrame(animate)

  control.update()
  stats.update()
  blockHighlight.update()

  renderer.render(scene, camera)
})()
