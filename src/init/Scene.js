import * as THREE from "three";
export default function initScene() {
  let scene = new THREE.Scene();
  let backgroundColor = 0x87ceeb;
  scene.name = "SCENE";
  scene.fog = new THREE.FogExp2(backgroundColor, 0.003);

  const light1 = new THREE.PointLight(0xffffff, 0.5);
  light1.position.set(500, 500, 500);
  // light1.castShadow = true;
  scene.add(light1);

  const light = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(light);

  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(geometry, material);
  sun.position.y = 100;
  sun.position.x = 200;
  sun.position.z = 150;

  scene.add(sun);

  scene.background = new THREE.Color(backgroundColor);

  return scene;
}
