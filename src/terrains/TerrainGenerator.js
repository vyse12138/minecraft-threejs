import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";
import { simplex } from "../utils/simplex-noise";

export default class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.grassMaterial = new BlockMaterial("grass");
    this.dirtMaterial = new BlockMaterial("dirt");
    this.noise = new simplex.SimplexNoise();
  }
  build() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    let mesh = new THREE.InstancedMesh(geometry, this.grassMaterial, 32768);

    let i = 0;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let x = 0; x < 150; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 150; z++) {
          let v = Math.round(this.noise.noise2D(x / 128, z / 128) * 12);
          matrix.setPosition(x, y + v, z);
          mesh.setMatrixAt(i, matrix);
          mesh.setColorAt(i++, color);
        }
      }
    }
    this.scene.add(mesh);
    mesh.geometry.computeBoundingBox();
let bb = mesh.geometry.boundingBox
console.log(bb);
    return [mesh];
  }
}
