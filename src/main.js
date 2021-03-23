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

const grassMaterial = new BlockMaterial("grass")
const dirtMaterial =  new BlockMaterial("dirt");
let block, mesh;

for (let i = 0; i < 16; i++) {
  for (let j = 0; j < 16; j++) {
    for (let k = 0; k < 2; k++) {
      block = new THREE.BoxGeometry();
      if (k === 0) {
        mesh = new THREE.Mesh(block, dirtMaterial);
      } else {
        mesh = new THREE.Mesh(block, grassMaterial);
      }
      mesh.position.x = i;
      mesh.position.y = k;
      mesh.position.z = j;
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
      mesh.updateMatrix();
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
