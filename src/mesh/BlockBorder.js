import * as THREE from "three";

export default class BlockBorder {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 8;
    this.material = new THREE.LineBasicMaterial({ color: 0x000000 });
    this.lastMesh = null;
    this.border = null;
    this.geometry = null;
    this.intersects = [];
  }

  update() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    this.intersects = this.raycaster.intersectObjects(this.scene.children);
    if (this.intersects.length > 0) {
      if (this.lastMesh) {
        this.lastMesh.remove(this.border);
        this.lastMesh.material.forEach(m => {
          m.color = new THREE.Color(1,1,1)
        })
        this.geometry = new THREE.EdgesGeometry(
          this.intersects[0].object.geometry
        );
        this.border = new THREE.LineSegments(this.geometry, this.material);
        this.intersects[0].object.add(this.border);

        this.intersects[0].object.material.forEach(m => {
          m.color = new THREE.Color(1.25,1.25,1.25)
        })
      }
      this.lastMesh = this.intersects[0].object;
    } else {
      if (this.lastMesh) {
        this.lastMesh.remove(this.border);
        this.lastMesh.material.forEach(m => {
          m.color = new THREE.Color(1,1,1)
        })
      }
    }
  }
}
