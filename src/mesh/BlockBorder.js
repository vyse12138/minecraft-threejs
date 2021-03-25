import * as THREE from "three";

export default class BlockBorder {
  constructor(camera, scene, terrains) {
    this.camera = camera;
    this.scene = scene;
    this.terrains = terrains;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 8;
    this.material = new THREE.LineBasicMaterial({ color: 0x000000 });
    this.lastID = true;
    this.border = null;
    this.geometry = null;
    this.instanceId = null;
    this.intersects = [];
    this.highLightColor = new THREE.Color(1.2, 1.2, 1.2);
    this.normalColor = new THREE.Color(1, 1, 1);
  }

  update() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    this.intersects = this.raycaster.intersectObject(this.terrains);
    if (this.intersects.length) {
      this.instanceId = this.intersects[0].instanceId;
      this.terrains.setColorAt(this.lastID, this.normalColor);
      this.terrains.setColorAt(this.instanceId, this.highLightColor);
      this.terrains.instanceColor.needsUpdate = true;
      this.lastID = this.instanceId;
    } else {
      if (this.lastID) {
        this.terrains.setColorAt(this.lastID, this.normalColor);
        this.terrains.instanceColor.needsUpdate = true;
      }
    }
  }
}
