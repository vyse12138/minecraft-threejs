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
let block, mesh;

let noise = new simplex.SimplexNoise();
let v;

for (let i = 0; i < 25; i++) {
  for (let j = 0; j < 25; j++) {
    v = Math.round(noise.noise2D(i / 16, j / 16) * 3);
    block = new THREE.BoxGeometry();
    mesh = new THREE.Mesh(block, new BlockMaterial("grass"));
    mesh.position.x = i;
    mesh.position.y = v;
    mesh.position.z = j;

    scene.add(mesh);
  }
}

(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  blockBorder.update();

  renderer.render(scene, camera);
})();
