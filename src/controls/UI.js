import * as THREE from "three";

export default class UI {
  constructor(){
    this.paused = true;
    this.ui = document.getElementById('ui');
    this.crosshair = document.getElementById('cross-hair');
  }

  update(paused) {
    if (paused) {
      this.ui.classList.remove('hidden')
      this.crosshair.classList.add('hidden')
    } else {
      this.ui.classList.add('hidden')
      this.crosshair.classList.remove('hidden')
    }

  }
}