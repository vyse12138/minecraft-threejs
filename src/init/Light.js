import * as THREE from "three";


export default function initAmbientLight() {
    let light = new THREE.AmbientLight();//环境光
    light.color = new THREE.Color().setHex(0xffffff);
    return light;
}

