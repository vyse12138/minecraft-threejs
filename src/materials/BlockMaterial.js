import * as THREE from "three";
import stoneTexture from "../assets/blocks/stone.png";
import coalTexture from "../assets/blocks/coal_ore.png";
import ironTexture from "../assets/blocks/iron_ore.png";
import grass_side from "../assets/blocks/grass_side.png";
import grass_top_green from "../assets/blocks/grass_top_green.png";
import dirt from "../assets/blocks/dirt.png";


let loader = new THREE.TextureLoader();

const grassTop = loader.load(grass_top_green);
grassTop.magFilter = THREE.NearestFilter;

const grassSide = loader.load(grass_side);
grassSide.magFilter = THREE.NearestFilter;

const dirtT = loader.load(dirt);
dirtT.magFilter = THREE.NearestFilter;

const stone = loader.load(stoneTexture);
stone.magFilter = THREE.NearestFilter;

const coal = loader.load(coalTexture);
coal.magFilter = THREE.NearestFilter;

const iron = loader.load(ironTexture);
iron.magFilter = THREE.NearestFilter;




export default function BlockMaterial(name) {
  let material;
  if (name === "grass") {
    material = [
      new THREE.MeshStandardMaterial( { map: grassSide }),
      new THREE.MeshStandardMaterial( { map: grassSide }),
        new THREE.MeshStandardMaterial( { map: grassTop }),
        new THREE.MeshStandardMaterial( { map: dirtT }),
        new THREE.MeshStandardMaterial( { map: grassSide }),
        new THREE.MeshStandardMaterial( { map: grassSide })
    ];
  } else {
    material = new THREE.MeshStandardMaterial({ map: dirtT });
  }
  return material;
}
