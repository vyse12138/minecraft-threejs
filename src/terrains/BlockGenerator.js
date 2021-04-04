import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";

export default class TerrainGenerator {
  constructor() {
    // init

    // set up materials
    this.grassMaterial = new BlockMaterial("grass");
    this.dirtMaterial = new BlockMaterial("dirt");
    this.stoneMaterial = new BlockMaterial("stone");
    this.sandMaterial = new BlockMaterial("sand");
    this.treeMaterial = new BlockMaterial("tree");
    this.leafMaterial = new BlockMaterial("leaf");

  }
  build(position) {
    const grass = new THREE.InstancedMesh(this.geometry, this.grassMaterial, 8500);
    
  }
}
