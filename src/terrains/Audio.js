import * as THREE from "three";

import bgm from "../assets/audios/musics/hal3.ogg";

import grass1 from "../assets/audios/blocks/grass1.ogg";
import grass2 from "../assets/audios/blocks/grass2.ogg";
import grass3 from "../assets/audios/blocks/grass3.ogg";
import grass4 from "../assets/audios/blocks/grass4.ogg";

import sand1 from "../assets/audios/blocks/sand1.ogg";
import sand2 from "../assets/audios/blocks/sand2.ogg";
import sand3 from "../assets/audios/blocks/sand3.ogg";
import sand4 from "../assets/audios/blocks/sand4.ogg";

import tree1 from "../assets/audios/blocks/tree1.ogg";
import tree2 from "../assets/audios/blocks/tree2.ogg";
import tree3 from "../assets/audios/blocks/tree3.ogg";
import tree4 from "../assets/audios/blocks/tree4.ogg";

import leaf1 from "../assets/audios/blocks/leaf1.ogg";
import leaf2 from "../assets/audios/blocks/leaf2.ogg";
import leaf3 from "../assets/audios/blocks/leaf3.ogg";
import leaf4 from "../assets/audios/blocks/leaf4.ogg";

export default class Audio {
  constructor(camera) {
    // init
    this.enable = true;
    this.camera = camera;
    this.listener = new THREE.AudioListener();
    this.camera.add(this.listener);
    this.audioLoader = new THREE.AudioLoader();

    // background music
    this.bgm = new THREE.Audio(this.listener);
    this.audioLoader.load(bgm, buffer => {
      this.bgm.setBuffer(buffer);
      this.bgm.setVolume(0.5);
      this.bgm.setLoop(true);
      this.bgm.play();
    });

    this.grassFlag = 1;
    this.sandFlag = 1;
    this.treeFlag = 1;
    this.leafFlag = 1;

    this.grassSound1 = new THREE.Audio(this.listener);
    this.grassSound2 = new THREE.Audio(this.listener);
    this.grassSound3 = new THREE.Audio(this.listener);
    this.grassSound4 = new THREE.Audio(this.listener);

    this.sandSound1 = new THREE.Audio(this.listener);
    this.sandSound2 = new THREE.Audio(this.listener);
    this.sandSound3 = new THREE.Audio(this.listener);
    this.sandSound4 = new THREE.Audio(this.listener);

    this.treeSound1 = new THREE.Audio(this.listener);
    this.treeSound2 = new THREE.Audio(this.listener);
    this.treeSound3 = new THREE.Audio(this.listener);
    this.treeSound4 = new THREE.Audio(this.listener);

    this.leafSound1 = new THREE.Audio(this.listener);
    this.leafSound2 = new THREE.Audio(this.listener);
    this.leafSound3 = new THREE.Audio(this.listener);
    this.leafSound4 = new THREE.Audio(this.listener);

    this.audioLoader.load(grass1, buffer => {
      this.grassSound1.setBuffer(buffer);
      this.grassSound1.setVolume(0.5);
    });
    this.audioLoader.load(grass2, buffer => {
      this.grassSound2.setBuffer(buffer);
      this.grassSound2.setVolume(0.5);
    });
    this.audioLoader.load(grass3, buffer => {
      this.grassSound3.setBuffer(buffer);
      this.grassSound3.setVolume(0.5);
    });
    this.audioLoader.load(grass4, buffer => {
      this.grassSound4.setBuffer(buffer);
      this.grassSound4.setVolume(0.5);
    });

    this.audioLoader.load(sand1, buffer => {
      this.sandSound1.setBuffer(buffer);
      this.sandSound1.setVolume(0.5);
    });
    this.audioLoader.load(sand2, buffer => {
      this.sandSound2.setBuffer(buffer);
      this.sandSound2.setVolume(0.5);
    });
    this.audioLoader.load(sand3, buffer => {
      this.sandSound3.setBuffer(buffer);
      this.sandSound3.setVolume(0.5);
    });
    this.audioLoader.load(sand4, buffer => {
      this.sandSound4.setBuffer(buffer);
      this.sandSound4.setVolume(0.5);
    });

    this.audioLoader.load(tree1, buffer => {
      this.treeSound1.setBuffer(buffer);
      this.treeSound1.setVolume(0.5);
    });
    this.audioLoader.load(tree2, buffer => {
      this.treeSound2.setBuffer(buffer);
      this.treeSound2.setVolume(0.5);
    });
    this.audioLoader.load(tree3, buffer => {
      this.treeSound3.setBuffer(buffer);
      this.treeSound3.setVolume(0.5);
    });
    this.audioLoader.load(tree4, buffer => {
      this.treeSound4.setBuffer(buffer);
      this.treeSound4.setVolume(0.5);
    });

    this.audioLoader.load(leaf1, buffer => {
      this.leafSound1.setBuffer(buffer);
      this.leafSound1.setVolume(0.5);
    });
    this.audioLoader.load(leaf2, buffer => {
      this.leafSound2.setBuffer(buffer);
      this.leafSound2.setVolume(0.5);
    });
    this.audioLoader.load(leaf3, buffer => {
      this.leafSound3.setBuffer(buffer);
      this.leafSound3.setVolume(0.5);
    });
    this.audioLoader.load(leaf4, buffer => {
      this.leafSound4.setBuffer(buffer);
      this.leafSound4.setVolume(0.5);
    });
  }
  
  playSound(material) {
    switch (material) {
      case "grass":
        switch (this.grassFlag) {
          case 1:
            this.grassSound1.play();
            this.grassFlag = 2;
            break;
          case 2:
            this.grassSound2.play();
            this.grassFlag = 3;
            break;
          case 3:
            this.grassSound3.play();
            this.grassFlag = 4;
            break;
          case 4:
            this.grassSound4.play();
            this.grassFlag = 1;
            break;
        }
        break;
      case "sand":
        switch (this.sandFlag) {
          case 1:
            this.sandSound1.play();
            this.sandFlag = 2;
            break;
          case 2:
            this.sandSound2.play();
            this.sandFlag = 3;
            break;
          case 3:
            this.sandSound3.play();
            this.sandFlag = 4;
            break;
          case 4:
            this.sandSound4.play();
            this.sandFlag = 1;
            break;
        }
        break;
      case "tree":
        switch (this.treeFlag) {
          case 1:
            this.treeSound1.play();
            this.treeFlag = 2;
            break;
          case 2:
            this.treeSound2.play();
            this.treeFlag = 3;
            break;
          case 3:
            this.treeSound3.play();
            this.treeFlag = 4;
            break;
          case 4:
            this.treeSound4.play();
            this.treeFlag = 1;
            break;
        }
        break;
      case "leaf":
        switch (this.leafFlag) {
          case 1:
            this.leafSound1.play();
            this.leafFlag = 2;
            break;
          case 2:
            this.leafSound2.play();
            this.leafFlag = 3;
            break;
          case 3:
            this.leafSound3.play();
            this.leafFlag = 4;
            break;
          case 4:
            this.leafSound4.play();
            this.leafFlag = 1;
            break;
        }
        break;
    }
  }
}
