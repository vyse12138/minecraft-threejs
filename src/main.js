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
import TerrainGenerator from "./terrains/TerrainGenerator.js";
const scene = initScene();
const camera = initCamera();
const renderer = initRenderer();

const stats = initStats();

const grassMaterial = new BlockMaterial("grass");
const dirtMaterial = new BlockMaterial("dirt");

const terrainGenerator = new TerrainGenerator(scene);
const terrain = terrainGenerator.build();

const blockBorder = new BlockBorder(camera, scene, terrain);
const control = new Control(camera, scene, terrain);




(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  blockBorder.update();

  renderer.render(scene, camera);
})();
