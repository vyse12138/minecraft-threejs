import * as THREE from 'three'
import stone from '../textures/blocks/stone.png'
import coal_ore from '../textures/blocks/coal_ore.png'
import iron_ore from '../textures/blocks/iron_ore.png'
import grass_side from '../textures/blocks/grass_side.png'
import grass_top_green from '../textures/blocks/grass_top_green.png'
import dirt from '../textures/blocks/dirt.png'
import oak_log from '../textures/blocks/oak_log.png'
import oak_log_top from '../textures/blocks/oak_log_top.png'
import oak_leaves from '../textures/blocks/oak_leaves.png'
import sand from '../textures/blocks/sand.png'

export enum MaterialTypes {
  grass = 'grass',
  dirt = 'dirt',
  tree = 'tree',
  leaf = 'leaf'
}

let loader = new THREE.TextureLoader()

// load texture
const grassTopMaterial = loader.load(grass_top_green)
const grassMaterial = loader.load(grass_side)
const treeMaterial = loader.load(oak_log)
const treeTopMaterial = loader.load(oak_log_top)
const dirtMaterial = loader.load(dirt)
const stoneMaterial = loader.load(stone)
const coalMaterial = loader.load(coal_ore)
const ironMaterial = loader.load(iron_ore)
const leafMaterial = loader.load(oak_leaves)
const sandMaterial = loader.load(sand)

// pixelize texture
grassTopMaterial.magFilter = THREE.NearestFilter
grassMaterial.magFilter = THREE.NearestFilter
treeMaterial.magFilter = THREE.NearestFilter
treeTopMaterial.magFilter = THREE.NearestFilter
dirtMaterial.magFilter = THREE.NearestFilter
stoneMaterial.magFilter = THREE.NearestFilter
coalMaterial.magFilter = THREE.NearestFilter
ironMaterial.magFilter = THREE.NearestFilter
leafMaterial.magFilter = THREE.NearestFilter
sandMaterial.magFilter = THREE.NearestFilter

export default function material(name: string) {
  let material: THREE.MeshStandardMaterial[]
  switch (name) {
    case 'grass':
      material = [
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassTopMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial })
      ]
      break
    case 'dirt':
      material = [
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial })
      ]

      break
    case 'tree':
      material = [
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial })
      ]
      break
    case 'leaf':
      material = [
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        }),
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        }),
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        }),
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        }),
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        }),
        new THREE.MeshStandardMaterial({
          map: leafMaterial,
          color: new THREE.Color(0, 1, 0),
          transparent: true
        })
      ]
      break

    default:
      material = [
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassTopMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial })
      ]
      break
  }
  return material
}
