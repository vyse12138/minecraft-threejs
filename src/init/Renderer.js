import * as THREE from "three";

export default function initRenderer() {
  let renderer = new THREE.WebGLRenderer();
  renderer.name = "RENDERER";

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return renderer;
}
