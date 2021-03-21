import * as THREE from "three";

export default function BlockGeometry(start = 0, count = Infinity) {
  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

  blockGeometry.setDrawRange(start, count);

  return blockGeometry;
}
