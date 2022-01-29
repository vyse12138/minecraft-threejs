import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default class Noise {
  noise = new ImprovedNoise()
  seed = Math.random()
  gap = 22
  amp = 8

  treeSeed = Math.random()
  treeGap = 2
  treeAmp = 6
  treeHeight = 10
  get = (x: number, y: number, z: number) => {
    return this.noise.noise(x, y, z)
  }
}
