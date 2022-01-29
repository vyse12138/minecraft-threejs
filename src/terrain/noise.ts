import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise'
// import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default class Noise {
  noise = new ImprovedNoise()
  seed = Math.random()
  gap = 22
  amp = 8

  get = (x: number, y: number, z: number) => {
    return this.noise.noise(x, y, z)
  }
}
