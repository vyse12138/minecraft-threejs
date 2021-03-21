import * as THREE from "three";
export default function initScene() {
  let scene =  new THREE.Scene() ;
  let backgroundColor = 0x87ceeb;
  scene.name = "SCENE";
  scene.fog = new THREE.FogExp2(backgroundColor, 0.003);
  let light = new THREE.AmbientLight();//环境光
  light.color = new THREE.Color().setHex(0xffffff);
scene.add(light);

  scene.background =  new THREE.Color(backgroundColor);

  return scene;
}
