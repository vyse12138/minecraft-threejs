import * as THREE from 'three'

export default class BlockHighlight {
  constructor(camera, scene, terrainGenerator) {
    this.camera = camera
    this.scene = scene
    this.terrain = terrainGenerator.terrain
    this.raycaster = new THREE.Raycaster()
    this.raycaster.far = 8
    this.material = new THREE.LineBasicMaterial({ color: 0x000000 })
    this.lastID = true
    this.border = null
    this.geometry = null
    this.instanceId = null
    this.intersects = []
    this.highLightColor = new THREE.Color(1.25, 1.25, 1.25)
    this.normalColor = new THREE.Color(1, 1, 1)
  }

  update() {
    // highlight the block at crosshair
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera)
    this.intersects = this.raycaster.intersectObjects(this.terrain)
    if (this.intersects.length) {
      this.instanceId = this.intersects[0].instanceId
      if (this.lastIntersect) {
        this.lastIntersect.object.setColorAt(this.lastID, this.normalColor)
        this.lastIntersect.object.instanceColor.needsUpdate = true
      }

      this.intersects[0].object.setColorAt(this.instanceId, this.highLightColor)
      this.intersects[0].object.instanceColor.needsUpdate = true
      this.lastID = this.instanceId
      this.lastIntersect = this.intersects[0]
    } else {
      if (this.lastIntersect) {
        this.lastIntersect.object.setColorAt(this.lastID, this.normalColor)
        this.lastIntersect.object.instanceColor.needsUpdate = true
      }
    }
  }
}
