import * as THREE from "three";
import initCamera from "./init/Camera.js";
import initScene from "./init/Scene.js";
import initRenderer from "./init/Renderer.js";
import initStats from "./init/Stats.js";

import Control from "./controls/Control.js";
import BlockBorder from "./mesh/BlockBorder.js";

import TerrainGenerator from "./terrains/TerrainGenerator.js";

const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();
const stats = initStats();

const terrainGenerator = new TerrainGenerator(scene);
terrainGenerator.build();
const terrain = terrainGenerator.terrain;





const blockBorder = new BlockBorder(camera, scene, terrain);
const control = new Control(camera, scene, terrain);

// const geometry = new THREE.BoxGeometry(5, 5, 5);
// const material = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
//   transparent: true
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
// mesh.position.y = 20;
// const scaleKF = new THREE.VectorKeyframeTrack(
//   ".scale",
//   [0, 1, 2],
//   [1, 1, 1, 2, 2, 2, 1, 1, 1]
// );
// const clip = new THREE.AnimationClip( 'Action', 3, [ scaleKF] );

// let mixer = new THREE.AnimationMixer( mesh );

// const clipAction = mixer.clipAction( clip );
// 				clipAction.play();

//         mixer.update( 0.02 );





(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  blockBorder.update();





  renderer.render(scene, camera);
})();
