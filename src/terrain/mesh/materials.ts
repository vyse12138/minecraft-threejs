import * as THREE from 'three'
import stone from '../../static/textures/block/stone.png'
import coal_ore from '../../static/textures/block/coal_ore.png'
import iron_ore from '../../static/textures/block/iron_ore.png'
import grass_side from '../../static/textures/block/grass_block_side.png'
import grass_top_green from '../../static/textures/block/grass_top_green.png'
import dirt from '../../static/textures/block/dirt.png'
import oak_log from '../../static/textures/block/oak_log.png'
import oak_log_top from '../../static/textures/block/oak_log_top.png'
import oak_leaves from '../../static/textures/block/oak_leaves.png'
import sand from '../../static/textures/block/sand.png'
// import water from '../../static/textures/block/water.png'
import oak_wood from '../../static/textures/block/oak_planks.png'
import diamond from '../../static/textures/block/diamond_block.png'
import quartz from '../../static/textures/block/quartz_block_side.png'
import glass from '../../static/textures/block/glass.png'
import bedrock from '../../static/textures/block/bedrock.png'

export enum MaterialType {
  grass = 'grass',
  dirt = 'dirt',
  tree = 'tree',
  leaf = 'leaf',
  sand = 'sand',
  // water = 'water',
  stone = 'stone',
  coal = 'coal',
  wood = 'wood',
  diamond = 'diamond',
  quartz = 'quartz',
  glass = 'glass',
  bedrock = 'bedrock'
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
// const waterMaterial = loader.load(water)
const woodMaterial = loader.load(oak_wood)
const diamondMaterial = loader.load(diamond)
const quartzMaterial = loader.load(quartz)
const glassMaterial = loader.load(glass)
const bedrockMaterial = loader.load(bedrock)

// pixelate texture
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
// waterMaterial.magFilter = THREE.NearestFilter
woodMaterial.magFilter = THREE.NearestFilter
diamondMaterial.magFilter = THREE.NearestFilter
quartzMaterial.magFilter = THREE.NearestFilter
glassMaterial.magFilter = THREE.NearestFilter
bedrockMaterial.magFilter = THREE.NearestFilter

export default class Materials {
  materials = {
    grass: [
      new THREE.MeshStandardMaterial({ map: grassMaterial }),
      new THREE.MeshStandardMaterial({ map: grassMaterial }),
      new THREE.MeshStandardMaterial({
        map: grassTopMaterial
      }),
      new THREE.MeshStandardMaterial({ map: dirtMaterial }),
      new THREE.MeshStandardMaterial({ map: grassMaterial }),
      new THREE.MeshStandardMaterial({ map: grassMaterial })
    ],
    dirt: new THREE.MeshStandardMaterial({ map: dirtMaterial }),
    sand: new THREE.MeshStandardMaterial({ map: sandMaterial }),
    tree: [
      new THREE.MeshStandardMaterial({ map: treeMaterial }),
      new THREE.MeshStandardMaterial({ map: treeMaterial }),
      new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
      new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
      new THREE.MeshStandardMaterial({ map: treeMaterial }),
      new THREE.MeshStandardMaterial({ map: treeMaterial })
    ],
    leaf: new THREE.MeshStandardMaterial({
      map: leafMaterial,
      color: new THREE.Color(0, 1, 0),
      transparent: true
    }),
    // water: new THREE.MeshStandardMaterial({
    //   map: waterMaterial,
    //   transparent: true,
    //   opacity: 0.7
    // }),
    stone: new THREE.MeshStandardMaterial({ map: stoneMaterial }),
    coal: new THREE.MeshStandardMaterial({ map: coalMaterial }),
    wood: new THREE.MeshStandardMaterial({ map: woodMaterial }),
    diamond: new THREE.MeshStandardMaterial({ map: diamondMaterial }),
    quartz: new THREE.MeshStandardMaterial({ map: quartzMaterial }),
    glass: new THREE.MeshStandardMaterial({
      map: glassMaterial,
      transparent: true
    }),
    bedrock: new THREE.MeshStandardMaterial({ map: bedrockMaterial })
  }

  get = (
    type: MaterialType
  ): THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] => {
    return this.materials[type]
  }
}
