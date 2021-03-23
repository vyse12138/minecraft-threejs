import * as THREE from "three";

export default function initCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.name = "CAMERA";
  camera.position.x = 0;
  camera.position.y = 3;
  camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(10, 0, 10));

  window.addEventListener("resize", onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  return camera;
}
