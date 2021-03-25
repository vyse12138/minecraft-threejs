import * as THREE from "three";

import initCamera from "./init/Camera.js";
import initScene from "./init/Scene.js";
import initRenderer from "./init/Renderer.js";
import initStats from "./init/Stats.js";

import Control from "./controls/Control.js";
import BlockBorder from "./mesh/BlockBorder.js";

import Block from "./mesh/Block.js";
import BlockMaterial from "./materials/BlockMaterial.js";
import BlockGeometry from "./geometries/BlockGeometry.js";
import BufferGeometryUtils from "./utils/BufferGeometryUtils";
import { simplex } from "./utils/simplex-noise";

const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const stats = initStats();
const control = new Control(camera, scene);
const blockBorder = new BlockBorder(camera, scene);

const grassMaterial = new BlockMaterial("grass");
const dirtMaterial = new BlockMaterial("dirt");

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = dirtMaterial;
let mesh = new THREE.InstancedMesh(geometry, material, 55 * 55 * 20);

let i = 0;
const offset = (5 - 1) / 2;

const matrix = new THREE.Matrix4();

for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    for (let z = 0; z < 55; z++) {
      matrix.setPosition(x,y, z);
      console.log(matrix);
      mesh.setMatrixAt(i, matrix);

      i++;
    }
  }
}


scene.add(mesh);















(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  // blockBorder.update();

  renderer.render(scene, camera);
})();
