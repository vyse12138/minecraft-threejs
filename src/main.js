import * as THREE from "three";
import "../style.css";

import initCamera from "./init/Camera.js";
import initScene from "./init/Scene.js";
import initRenderer from "./init/Renderer.js";
import initStats from "./init/Stats.js";

import Control from "./init/Control.js";
import Block from "./mesh/Block.js";
import BlockMaterial from "./materials/BlockMaterial.js";
import BlockGeometry from "./geometries/BlockGeometry.js";
import BufferGeometryUtils  from "./utils/BufferGeometryUtils";

let scene = initScene();
let camera = initCamera();
let renderer = initRenderer();
let stats = initStats();
const control = new Control(camera);



let block = BlockGeometry();
let gs = [];
for (let i = 0; i < 100; i++) {
  for (let j = 0; j < 100; j++) {
    block = new THREE.BoxGeometry();
    block.translate(i, 0, j);
    gs.push(block);
  }
}
let bs = BufferGeometryUtils.mergeBufferGeometries(gs, true);
const mesh = new THREE.Mesh(bs, new BlockMaterial(100 * 100));
scene.add(mesh);











(function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  control.update()
  stats.end();
  renderer.render(scene, camera);
})();
