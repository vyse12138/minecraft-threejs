import * as THREE from "three";

export default function initCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.001,
    500
  );
  camera.position.x = 30;
  camera.position.y = 17;
  camera.position.z = 30;
  camera.lookAt(new THREE.Vector3(31, 17, 30));

  window.addEventListener("resize", onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  return camera;
}
