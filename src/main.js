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

const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const stats = initStats();
const control = new Control(camera, scene);
const blockBorder = new BlockBorder(camera, scene);
let block, mesh;

for (let i = 0; i < 16; i++) {
  for (let j = 0; j < 16; j++) {
    for (let k = 0; k < 2; k++) {
      block = new THREE.BoxGeometry();

      block.translate(i, k - 1, j);
      if (k === 0) {
        mesh = new THREE.Mesh(block, new BlockMaterial("dirt"));
      } else {
        mesh = new THREE.Mesh(block, new BlockMaterial("grass"));
      }
      scene.add(mesh);
    }
  }
}

(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  blockBorder.update();

  renderer.render(scene, camera);
})();
