import * as THREE from "three";
import BlockGeometry from "../geometries/BlockGeometry"

export default function Block(start, count) {

    const geometry = new THREE.BoxGeometry(start, count);

    const grassTop = new THREE.TextureLoader().load(
      "src/assets/blocks/grass_top_green.png"
    );
    grassTop.magFilter = THREE.NearestFilter;
    const materialTop = new THREE.MeshBasicMaterial({ map: grassTop });

    const grassSide = new THREE.TextureLoader().load(
      "src/assets/blocks/grass_side.png"
    );
    grassSide.magFilter = THREE.NearestFilter;
    const materialSide = new THREE.MeshBasicMaterial({ map: grassSide });

    const grassBot = new THREE.TextureLoader().load(
      "src/assets/blocks/dirt.png"
    );
    grassBot.magFilter = THREE.NearestFilter;
    const materialBot = new THREE.MeshBasicMaterial({ map: grassBot });


    const material = [
      materialSide,
      materialSide,
      materialTop,
      materialBot,
      materialSide,
      materialSide
    ];
    const block = new THREE.Mesh(geometry, material);


    return block;
}
