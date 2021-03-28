import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";
import { simplex } from "../utils/simplex-noise";

export default class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.grassMaterial = new BlockMaterial("grass");
    this.dirtMaterial = new BlockMaterial("dirt");
    this.treeMaterial = new BlockMaterial("tree");
    this.leafMaterial = new BlockMaterial("leaf");
    this.leafMap = new Set();
    this.noise = new simplex.SimplexNoise();
    this.terrain = [];
  }
  build() {
    const grassGeometry = new THREE.BoxGeometry(1, 1, 1);
    const grass = new THREE.InstancedMesh(
      grassGeometry,
      this.grassMaterial,
      20000
    );
    const treeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const tree = new THREE.InstancedMesh(treeGeometry, this.treeMaterial, 3000);
    const leafGeometry = new THREE.BoxGeometry(1, 1, 1);
    const leaf = new THREE.InstancedMesh(leafGeometry, this.leafMaterial, 8000);
    let grassCount = 0,
      treeCount = 0,
      leafCount = 0;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    for (let x = 0; x < 128; x++) {
      for (let y = 0; y < 1; y++) {
        for (let z = 0; z < 128; z++) {
          let noise = Math.round(this.noise.noise2D(x / 160, z / 160) * 15);
          matrix.setPosition(x, y + noise, z);
          grass.setMatrixAt(grassCount, matrix);
          grass.setColorAt(grassCount++, color);
          if (Math.random() > 0.999) {
            let height = 5;
            while (height--) {

              matrix.setPosition(x, y + noise + 1 + height, z);
              this.leafMap.add(matrix.elements.join());

              tree.setMatrixAt(treeCount, matrix);
              tree.setColorAt(treeCount++, color);
            }
            height = 5;
            for (let x2 = 0; x2 < 8; x2++) {
              for (let y2 = 0; y2 < 3; y2++) {
                for (let z2 = 0; z2 < 8; z2++) {
                  let noiseX = Math.round(
                    this.noise.noise3D(y2, z2, Math.random()) * 3
                  );
                  let noiseY = Math.round(
                    this.noise.noise3D(x2, z2, Math.random()) * 2
                  );
                  let noiseZ = Math.round(
                    this.noise.noise3D(x2, y2, Math.random()) * 3
                  );

                  matrix.setPosition(
                    x + noiseX,
                    y + noise + noiseY + height,
                    z + noiseZ
                  );
                  if (!this.hasLeafAt(matrix)) {
                    leaf.setMatrixAt(leafCount, matrix);
                    leaf.setColorAt(leafCount++, color);
                  }
                }
              }
            }
          }
        }
      }
    }
    this.scene.add(grass);
    this.scene.add(tree);
    this.scene.add(leaf);
    console.log(grass);
    console.log(leaf);
    this.terrain = [grass, tree, leaf];
    return this.terrain;
  }

  hasLeafAt(matrix) {
    if (this.leafMap.has(matrix.elements.join())) {
      return true;
    } else {
      this.leafMap.add(matrix.elements.join());
      return false;
    }
  }

  isFaceVisible(face) {
    return true;
  }
}
