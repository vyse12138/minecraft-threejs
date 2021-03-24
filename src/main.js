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

let block = new BlockGeometry();
console.log(block);
const meshes = {
  positions: [],
  uvs: [],
  normals: [],
  indices: [],
  groups: []

};
let k = 0;
for (let i = 0; i < 6; ++i) {
  meshes.positions.push(...block[i].attributes.position.array);
  meshes.uvs.push(...block[i].attributes.uv.array);
  meshes.normals.push(...block[i].attributes.normal.array);

  const localIndices = [...block[i].index.array];
  for (let j = 0; j < localIndices.length; ++j) {
    localIndices[j] += k;
  }
  k += 4;
  meshes.indices.push(...localIndices);
  meshes.groups.push(6*i);

}

const positionsArray = new Float32Array(meshes.positions);

const normalsArray = new Float32Array(meshes.normals);
const uvsArray = new Float32Array(meshes.uvs);

let a = new THREE.BoxGeometry();
console.log(a);

let geo = new THREE.BufferGeometry();

geo.setAttribute("position", new THREE.BufferAttribute(positionsArray, 3));
geo.setAttribute("normal", new THREE.BufferAttribute(normalsArray, 3));
geo.setAttribute("uv", new THREE.BufferAttribute(uvsArray, 2));
for (let i of meshes.groups) {
  geo.addGroup(i, 6, i/6)
}
geo.setIndex(meshes.indices);

console.log(geo);

const mesh = new THREE.Mesh(geo, grassMaterial);
scene.add(mesh);











(function animate() {
  requestAnimationFrame(animate);
  control.update();
  stats.update();
  // blockBorder.update();

  renderer.render(scene, camera);
})();
