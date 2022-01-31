import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default class Noise {
  noise = new ImprovedNoise()
  seed = Math.random()
  gap = 22
  amp = 8

  stoneSeed = Math.random()
  stoneGap = 12
  stoneAmp = 8
  stoneThreshold = 3.5

  coalSeed = Math.random()
  coalGap = 3
  coalAmp = 8
  coalThreshold = 3

  treeSeed = Math.random()
  treeGap = 2
  treeAmp = 6
  treeHeight = 10
  treeThreshold = 4

  leafSeed = Math.random()
  leafGap = 2
  leafAmp = 5
  leafThreshold = -0.03

  get = (x: number, y: number, z: number) => {
    return this.noise.noise(x, y, z)
  }
}
