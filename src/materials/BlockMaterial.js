import * as THREE from "three";
const stone = new THREE.TextureLoader().load("./src/assets/blocks/stone.png");
stone.magFilter = THREE.NearestFilter;
const stoneMaterial = new THREE.MeshBasicMaterial({ map: stone });

const coal = new THREE.TextureLoader().load("./src/assets/blocks/coal_ore.png");
coal.magFilter = THREE.NearestFilter;
const coalMaterial = new THREE.MeshBasicMaterial({ map: coal });

const iron = new THREE.TextureLoader().load("./src/assets/blocks/iron_ore.png");
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
