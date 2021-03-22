import * as THREE from "three";
import stoneTexture from '../assets/blocks/stone.png'
import coalTexture from '../assets/blocks/coal_ore.png'
import ironTexture from '../assets/blocks/iron_ore.png'
import grass_side from '../assets/blocks/grass_side.png'
import grass_top_green from '../assets/blocks/grass_top_green.png'
import dirt from '../assets/blocks/dirt.png'



const grass = new THREE.TextureLoader().load(grass_top_green);
grass.magFilter = THREE.NearestFilter;


const stone = new THREE.TextureLoader().load(stoneTexture);
stone.magFilter = THREE.NearestFilter;

const coal = new THREE.TextureLoader().load(coalTexture);
coal.magFilter = THREE.NearestFilter;

const iron = new THREE.TextureLoader().load(ironTexture);
iron.magFilter = THREE.NearestFilter;

export default function BlockMaterial(name) {
  // let materials = [];
  // while (count--) {
  //   if (Math.random() > 0.97) {
  //     materials.push(coalMaterial);
  //   } else if (Math.random() > 0.97) {
  //     materials.push(ironMaterial);

  //   }else{
  //     materials.push(stoneMaterial);
  //   }
  // }
  // return materials;
  let material;
if (name === 'grass'){
  material = new THREE.MeshBasicMaterial({ map: grass });

} else  {
  material = new THREE.MeshBasicMaterial({ map: stone });

}
  return    material 
}
