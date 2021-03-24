import * as THREE from "three";

export default function BlockGeometry(start = 0, count = Infinity) {
  const pxGeometry = new THREE.PlaneGeometry(1, 1);
  pxGeometry.rotateY(Math.PI / 2);
  pxGeometry.translate(0.5, 0, 0);

  const nxGeometry = new THREE.PlaneGeometry(1, 1);
  nxGeometry.rotateY(-Math.PI / 2);
  nxGeometry.translate(-0.5, 0, 0);

  const pyGeometry = new THREE.PlaneGeometry(1, 1);
  pyGeometry.rotateX(-Math.PI / 2);
  pyGeometry.translate(0, 0.5, 0);

  const nyGeometry = new THREE.PlaneGeometry(1, 1);
  nyGeometry.rotateX(Math.PI / 2);
  nyGeometry.translate(0, -0.5, 0);

  const pzGeometry = new THREE.PlaneGeometry(1, 1);
  pzGeometry.translate(0, 0, 0.5);

  const nzGeometry = new THREE.PlaneGeometry(1, 1);
  nzGeometry.rotateY(Math.PI);
  nzGeometry.translate(0, 0, -0.5);

  let block = [
    pxGeometry,
    nxGeometry,
    pyGeometry,
    nyGeometry,
    pzGeometry,
    nzGeometry
  ];

  return block;
}
