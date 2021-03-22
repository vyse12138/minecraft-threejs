import * as THREE from "three";

import initCamera from "./init/Camera.js";
import initScene from "./init/Scene.js";
import initRenderer from "./init/Renderer.js";
import initStats from "./init/Stats.js";

import Control from "./init/Control.js";
import Block from "./mesh/Block.js";
import BlockMaterial from "./materials/BlockMaterial.js";
import BlockGeometry from "./geometries/BlockGeometry.js";
import BufferGeometryUtils  from "./utils/BufferGeometryUtils";

const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const stats = initStats();
const control = new Control(camera);



let block = BlockGeometry();
let gs = [];
let s ;
let mesh = 1;



for (let i = 0; i < 16; i++) {
  for (let j = 0; j < 16; j++) {
    for (let k = 0; k < 2; k++){
      block = new THREE.BoxGeometry();

      block.translate(i, k-1, j);
      if (k ===0) {
        mesh = new THREE.Mesh(block, new BlockMaterial('stone'));
      }else{
        mesh = new THREE.Mesh(block, new BlockMaterial('grass'));
      }
      scene.add(mesh);

    }

  }
}



let raycaster = new THREE.Raycaster();
let last;

(function animate() {
  requestAnimationFrame(animate);
  control.update()
  stats.update();


  raycaster.setFromCamera({x:0, y:0}, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
      if (last) {
        last.object.material.wireframe =false
      }
      intersects[0].object.material.wireframe =true
      last = intersects[0];
  } 








  renderer.render(scene, camera);
})();
