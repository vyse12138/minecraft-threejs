import * as THREE from "three";
import stone from "../assets/blocks/stone.png";
import coal_ore from "../assets/blocks/coal_ore.png";
import iron_ore from "../assets/blocks/iron_ore.png";
import grass_side from "../assets/blocks/grass_side.png";
import grass_top_green from "../assets/blocks/grass_top_green.png";
import dirt from "../assets/blocks/dirt.png";
import oak_log from "../assets/blocks/oak_log.png";
import oak_log_top from "../assets/blocks/oak_log_top.png";
import oak_leaves from "../assets/blocks/oak_leaves.png";
import sand from "../assets/blocks/sand.png";

let loader = new THREE.TextureLoader();

const grassTopMaterial = loader.load(grass_top_green);
const grassMaterial = loader.load(grass_side);
const treeMaterial = loader.load(oak_log);
const treeTopMaterial = loader.load(oak_log_top);
const dirtMaterial = loader.load(dirt);
const stoneMaterial = loader.load(stone);
const coalMaterial = loader.load(coal_ore);
const ironMaterial = loader.load(iron_ore);
const leafMaterial = loader.load(oak_leaves);
const sandMaterial = loader.load(sand);

grassTopMaterial.magFilter = THREE.NearestFilter;
grassMaterial.magFilter = THREE.NearestFilter;
treeMaterial.magFilter = THREE.NearestFilter;
treeTopMaterial.magFilter = THREE.NearestFilter;
dirtMaterial.magFilter = THREE.NearestFilter;
stoneMaterial.magFilter = THREE.NearestFilter;
coalMaterial.magFilter = THREE.NearestFilter;
ironMaterial.magFilter = THREE.NearestFilter;
leafMaterial.magFilter = THREE.NearestFilter;
sandMaterial.magFilter = THREE.NearestFilter;

export default function BlockMaterial(name) {
  let material;
  switch (name) {
    case "grass":
      material = [
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassTopMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial })
      ];
      break;
    case "dirt":
      material = new THREE.MeshStandardMaterial({ map: dirtMaterial });
      break;
    case "tree":
      material = [
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeTopMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial }),
        new THREE.MeshStandardMaterial({ map: treeMaterial })
      ];
      break;
    case "leaf":
      material = new THREE.MeshStandardMaterial({ map: leafMaterial });
      material.color = new THREE.Color(0, 1, 0);
      material.transparent = true;
      break;
    case "stone":
      material = new THREE.MeshStandardMaterial({ map: stoneMaterial });
      break;
    case "iron":
      material = new THREE.MeshStandardMaterial({ map: ironMaterial });
      break;
    case "coal":
      material = new THREE.MeshStandardMaterial({ map: coalMaterial });
      break;
    case "sand":
      material = new THREE.MeshStandardMaterial({
        map: sandMaterial
      });
      break;
    default:
      material = [
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassTopMaterial }),
        new THREE.MeshStandardMaterial({ map: dirtMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial }),
        new THREE.MeshStandardMaterial({ map: grassMaterial })
      ];
      break;
  }
  return material;
}
