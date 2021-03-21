import * as THREE from "three";
import stoneTexture from '../assets/blocks/stone.png'
import coalTexture from '../assets/blocks/coal_ore.png'
import ironTexture from '../assets/blocks/iron_ore.png'

const stone = new THREE.TextureLoader().load(stoneTexture);
stone.magFilter = THREE.NearestFilter;
const stoneMaterial = new THREE.MeshBasicMaterial({ map: stone });

const coal = new THREE.TextureLoader().load(coalTexture);
coal.magFilter = THREE.NearestFilter;
const coalMaterial = new THREE.MeshBasicMaterial({ map: coal });

const iron = new THREE.TextureLoader().load(ironTexture);
iron.magFilter = THREE.NearestFilter;
const ironMaterial = new THREE.MeshBasicMaterial({ map: iron });

export default function BlockMaterial(count) {
  let materials = [];
  while (count--) {
    if (Math.random() > 0.97) {
      materials.push(coalMaterial);
    } else if (Math.random() > 0.97) {
      materials.push(ironMaterial);

    }else{
      materials.push(stoneMaterial);
    }
  }
  return materials;
}
