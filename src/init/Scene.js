import * as THREE from "three";
export default function initScene() {
  let scene = new THREE.Scene();
  let backgroundColor = 0x87ceeb;
  scene.name = "SCENE";
  scene.fog = new THREE.FogExp2(backgroundColor, 0.003);

  const light1 = new THREE.PointLight( 0xffffff, 1 );
  light1.position.set( 500, 500, 500 );
  // light1.castShadow = true; 
  scene.add( light1 );
  const light2 = new THREE.PointLight( 0xffffff, 0.33 );
  light2.position.set( -500, 500, -500 );
  scene.add( light2 );
  const light3 = new THREE.PointLight( 0xffffff, 0.1 );
  light3.position.set( 500, -500, 500 );
  scene.add( light3 );
  const light4 = new THREE.PointLight( 0xffffff, 0.1 );
  light4.position.set( -500, -500, -500 );
  scene.add( light4 );

  const geometry = new THREE.SphereGeometry( 2, 32, 32 );
  const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.y = 50;
  sphere.position.x = 50;
  sphere.position.z = 50;

  scene.add( sphere );

  scene.background = new THREE.Color(backgroundColor);

  return scene;
}
