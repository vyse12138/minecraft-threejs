import "../style.css";
import initCamera from "./init/Camera.js";
import initScene from "./init/Scene.js";
import initRenderer from "./init/Renderer.js";
import initAmbientLight from "./init/Light.js";
import Control from "./init/Control.js";
import Block from "./mesh/Block.js";
import BlockMaterial from "./materials/BlockMaterial.js";
import BlockGeometry from "./geometries/BlockGeometry.js";
import * as THREE from "three";
import { BufferGeometryUtils } from "./utils/BufferGeometryUtils";

import Stats from "./utils/Stats";
let scene = initScene();

let camera = initCamera();
let lightAmbient = initAmbientLight();
scene.add(lightAmbient);

let renderer = initRenderer();

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





let stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

document.body.appendChild(renderer.domElement);

const control = new Control(camera);




(function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  control.update()
  stats.end();
  renderer.render(scene, camera);
})();
