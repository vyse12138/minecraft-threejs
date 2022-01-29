import * as THREE from 'three'
import { BlockType } from '../index'

/**
 * Custom block
 */
export default class Block {
  object: any
  constructor(
    x: number,
    y: number,
    z: number,
    type: BlockType,
    placed: boolean
  ) {
    this.x = x
    this.y = y
    this.z = z
    this.type = type
    this.position = new THREE.Vector3(x, y, z)
    this.placed = placed
  }
  x: number
  y: number
  z: number
  type: BlockType
  position: THREE.Vector3
  placed: boolean
}
