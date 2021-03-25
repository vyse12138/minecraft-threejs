import * as THREE from "three";
import BufferGeometryUtils from "../utils/BufferGeometryUtils";
import { simplex } from "../utils/simplex-noise";

export default class BlockGeometry {
  constructor() {
    this.noise = new simplex.SimplexNoise();
    this._cells = {};
    this._blockDimensions = new THREE.Vector3(16,16,16)
    this._blockOffset = new THREE.Vector3(1, 0, 1)
    for (let x = 0; x < this._blockDimensions.x; x++) {
      for (let z = 0; z < this._blockDimensions.z; z++) {
        const xPos = x + this._blockOffset.x;
        const zPos = z + this._blockOffset.z;
        const yPos = Math.round(this.noise.noise2D(x / 16, z / 16) * 5);

        this._cells[xPos + "." + yPos + "." + zPos] = {
          position: [xPos, yPos, zPos],
          visible: true
        };
      }
    }
    this.createBlock()
    this.build(this._cells)

    console.log(this._cells)
    this.block = new THREE.InstancedBufferGeometry();
    this.block.setAttribute(
      'position', new THREE.Float32BufferAttribute(
          [...this.geometries.attributes.position.array], 3));
    this.block.setAttribute(
        'uv', new THREE.Float32BufferAttribute(
            [...this.geometries.attributes.uv.array], 2));
    this.block.setAttribute(
        'normal', new THREE.Float32BufferAttribute(
            [...this.geometries.attributes.normal.array], 3));
    this.block.setIndex(
        new THREE.BufferAttribute(
            new Uint32Array([...this.geometries.index.array]), 1));

    console.log(this.block)
  }

  createBlock() {
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

    this.geometries = BufferGeometryUtils.mergeBufferGeometries([
      pxGeometry,
      nxGeometry,
      pyGeometry,
      nyGeometry,
      pzGeometry,
      nzGeometry
    ]);
  }

  build(cells) {

    for (let c in cells) {
      const curCell = cells[c];

    }
  }
}
