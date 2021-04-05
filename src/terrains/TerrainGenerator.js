import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";
import { simplex } from "../utils/simplex-noise";

export default class TerrainGenerator {
  constructor(scene) {
    // init
    this.scene = scene;
    this.terrain = [];
    this.noise = new simplex.SimplexNoise();

    // set up materials
    this.grassMaterial = new BlockMaterial("grass");
    this.dirtMaterial = new BlockMaterial("dirt");
    this.stoneMaterial = new BlockMaterial("stone");
    this.sandMaterial = new BlockMaterial("sand");
    this.treeMaterial = new BlockMaterial("tree");
    this.leafMaterial = new BlockMaterial("leaf");

    // some global variables
    this.terrainSet = new Set();
    this.leafSet = new Set();
    this.treeCount = 0;
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.dirtBlockCount = 0;
    this.stoneBlockCount = 0;
    this.sandBlockCount = 0;
    this.vector3 = new THREE.Vector3();
  }
  build() {
    // arranges memory for instanced meshes
    const grass = new THREE.InstancedMesh(
      this.geometry,
      this.grassMaterial,
      8500
    );
    const sand = new THREE.InstancedMesh(
      this.geometry,
      this.sandMaterial,
      2200
    );
    const tree = new THREE.InstancedMesh(this.geometry, this.treeMaterial, 50);
    const leaf = new THREE.InstancedMesh(
      this.geometry,
      this.leafMaterial,
      1000
    );
    const dirt = new THREE.InstancedMesh(this.geometry, this.dirtMaterial, 500);
    const stone = new THREE.InstancedMesh(
      this.geometry,
      this.stoneMaterial,
      500
    );

    grass.name = "grass";
    sand.name = "sand";
    tree.name = "tree";
    leaf.name = "leaf";
    dirt.name = "dirt";
    stone.name = "stone";
    let grassBlockCount = 0,
      treeBlockCount = 0,
      leafBlockCount = 0;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    dirt.setColorAt(0, color);
    stone.setColorAt(0, color);

    for (let x = 0; x < 96; x++) {
      for (let y = 0; y < 1; y++) {
        for (let z = 0; z < 96; z++) {
          let noise = Math.round(this.noise.noise2D(x / 36, z / 36) * 3);
          matrix.setPosition(x, y + noise, z);

          //
          if (noise < -1) {
            // generates sand
            sand.setMatrixAt(this.sandBlockCount, matrix);
            sand.setColorAt(this.sandBlockCount++, color);
            this.terrainSet.add(
              Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
            );
          } else {
            // generates grasses
            grass.setMatrixAt(grassBlockCount, matrix);
            grass.setColorAt(grassBlockCount++, color);
            this.terrainSet.add(
              Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
            );
          }

          // generates trees
          if (Math.random() > 0.999 && noise >= -1 && this.treeCount < 10) {
            let height = 5;
            this.treeCount += 1;
            for (let i = 0; i < height; i++) {
              matrix.setPosition(x, y + noise + 1 + i, z);
              this.leafSet.add(matrix.elements.join());
              this.terrainSet.add(
                Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
              );

              tree.setMatrixAt(treeBlockCount, matrix);
              tree.setColorAt(treeBlockCount++, color);
            }
            // generates leaves
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
                    this.terrainSet.add(
                      Object.values(
                        this.vector3.setFromMatrixPosition(matrix)
                      ).join()
                    );

                    leaf.setMatrixAt(leafBlockCount, matrix);
                    leaf.setColorAt(leafBlockCount++, color);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(
      grassBlockCount,
      treeBlockCount,
      leafBlockCount,
      this.sandBlockCount
    );

    this.scene.add(grass, tree, leaf, sand, dirt, stone);
    this.terrain = [grass, tree, leaf, sand, dirt, stone];
  }

  hasLeafAt(matrix) {
    if (this.leafSet.has(matrix.elements.join())) {
      return true;
    } else {
      this.leafSet.add(matrix.elements.join());
      return false;
    }
  }

  isFaceVisible(face) {
    return true;
  }

  reBuild() {}

  // build adjacent blocks
  buildAB(matrix) {
    let position = new THREE.Vector3().setFromMatrixPosition(matrix);
    let noise = Math.round(
      this.noise.noise2D(position.x / 36, position.z / 36) * 3
    );
    let tempPosition;
    let material;
    let noise2;
    let materialBlockCount;
    const color = new THREE.Color();
    if (position.y < noise + 1) {
      if (position.y < -4) {
        //stone
        material = this.terrain[5];
        materialBlockCount = this.stoneBlockCount;
      } else if (noise < -1) {
        //sand
        material = this.terrain[3];
        materialBlockCount = this.sandBlockCount;
      } else {
        // dirt

        material = this.terrain[4];
        materialBlockCount = this.dirtBlockCount;
      }

      tempPosition = position.clone();
      tempPosition.y--;
      if (!this.terrainSet.has(Object.values(tempPosition).join())) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.y--;
      tempPosition.x--;
      if (!this.terrainSet.has(Object.values(tempPosition).join())) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.y--;
      tempPosition.x++;
      if (!this.terrainSet.has(Object.values(tempPosition).join())) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.y--;
      tempPosition.z--;
      if (!this.terrainSet.has(Object.values(tempPosition).join())) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.y--;
      tempPosition.z++;
      if (!this.terrainSet.has(Object.values(tempPosition).join())) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.x--;
      noise2 =
        position.y === noise
          ? Math.round(
              this.noise.noise2D(tempPosition.x / 36, tempPosition.z / 36) * 3
            )
          : noise;
      if (
        noise <= noise2 &&
        !this.terrainSet.has(Object.values(tempPosition).join())
      ) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.x++;
      noise2 =
        position.y === noise
          ? Math.round(
              this.noise.noise2D(tempPosition.x / 36, tempPosition.z / 36) * 3
            )
          : noise;
      if (
        noise <= noise2 &&
        !this.terrainSet.has(Object.values(tempPosition).join())
      ) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.z--;
      noise2 =
        position.y === noise
          ? Math.round(
              this.noise.noise2D(tempPosition.x / 36, tempPosition.z / 36) * 3
            )
          : noise;
      if (
        noise <= noise2 &&
        !this.terrainSet.has(Object.values(tempPosition).join())
      ) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      tempPosition = position.clone();
      tempPosition.z++;
      noise2 =
        position.y === noise
          ? Math.round(
              this.noise.noise2D(tempPosition.x / 36, tempPosition.z / 36) * 3
            )
          : noise;
      if (
        noise <= noise2 &&
        !this.terrainSet.has(Object.values(tempPosition).join())
      ) {
        matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
        material.setMatrixAt(materialBlockCount, matrix);
        material.setColorAt(materialBlockCount++, color);
        this.terrainSet.add(
          Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
        );
      }

      if (position.y < noise) {
        tempPosition = position.clone();
        tempPosition.y++;
        if (!this.terrainSet.has(Object.values(tempPosition).join())) {
          matrix.setPosition(tempPosition.x, tempPosition.y, tempPosition.z);
          material.setMatrixAt(materialBlockCount, matrix);
          material.setColorAt(materialBlockCount++, color);
          this.terrainSet.add(
            Object.values(this.vector3.setFromMatrixPosition(matrix)).join()
          );
        }
      }

      if (position.y < -4) {
        //stone
        this.stoneBlockCount = materialBlockCount;
      } else if (noise < -1) {
        //sand
        material = this.terrain[3];
        this.sandBlockCount = materialBlockCount;
      } else {
        // dirt
        material = this.terrain[4];
        this.dirtBlockCount = materialBlockCount;
      }

      material.instanceMatrix.needsUpdate = true;
      material.instanceColor.needsUpdate = true;
    }
  }
}
