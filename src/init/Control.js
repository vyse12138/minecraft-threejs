import * as THREE from "three";

export default class Control {
  constructor(camera) {
    this.camera = camera;
    this.godMode = false;
    this.movingForward = false;
    this.movingBackward = false;
    this.movingLeftwa = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.velocity = 0;
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.vec = new THREE.Vector3();

    this.initEventListeners();
  }

  initEventListeners() {
    // click to lock
    document.addEventListener("click", () => {
      document.body.requestPointerLock();
    });
    // when lock/unlock, trigger corresponding callback
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement) {
        this.onLock();
      } else {
        this.onUnlock();
      }
    });
  }

  // when locked, add control eventListeners
  onLock() {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  }
  // when unlocked, remove control eventListeners
  onUnlock() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
  }

  onMouseMove = e => {
    let movementX = e.movementX;
    let movementY = e.movementY;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    // make sure that -pi/2 <= eulerX <= pi/2
    this.euler.x < -Math.PI / 2
      ? -Math.PI / 2
      : this.euler.x > Math.PI / 2
      ? Math.PI / 2
      : this.euler.x;
    this.camera.quaternion.setFromEuler(this.euler);
  };

  onKeyDown = e => {
    switch (e.code) {
      case "KeyW":
        this.movingForward = true;
        break;
      case "KeyS":
        this.movingBackward = true;
        break;
      case "KeyA":
        this.movingLeft = true;
        break;
      case "KeyD":
        this.movingRight = true;
        break;
      case "Space":
        if (this.godMode) {
          this.movingUp = true;
        } else {
          this.velocity = 0.15;
        }
        break;
      case "ControlLeft":
        if (this.godMode) {
          this.movingDown = true;
        }
        break;
      case "KeyQ":
        this.godMode = !this.godMode;
        break;
    }
  };
  onKeyUp = e => {
    switch (e.code) {
      case "KeyW":
        this.movingForward = false;
        break;
      case "KeyS":
        this.movingBackward = false;
        break;
      case "KeyA":
        this.movingLeft = false;
        break;
      case "KeyD":
        this.movingRight = false;
        break;
      case "Space":
        this.movingUp = false;
        break;
      case "ControlLeft":
        this.movingDown = false;
        break;
    }
  };

  moveForward(distance) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.vec.crossVectors(this.camera.up, this.vec);
    this.camera.position.addScaledVector(this.vec, distance);
  }
  moveRight(distance) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vec, distance);
  }

  update() {
    if (this.godMode) {
      // god mode on
      if (this.movingForward) {
        this.moveForward(0.25);
      }
      if (this.movingBackward) {
        this.moveForward(-0.25);
      }
      if (this.movingLeft) {
        this.moveRight(-0.25);
      }
      if (this.movingRight) {
        this.moveRight(0.25);
      }
      if (this.movingUp) {
        this.camera.position.y += 0.25;
      }
      if (this.movingDown) {
        this.camera.position.y -= 0.25;
      }
    } else {
      // god mode off
      if (this.movingForward) {
        this.moveForward(0.1);
      }
      if (this.movingBackward) {
        this.moveForward(-0.1);
      }
      if (this.movingLeft) {
        this.moveRight(-0.1);
      }
      if (this.movingRight) {
        this.moveRight(0.1);
      }
      this.velocity -= 0.0075;
      this.camera.position.y += this.velocity;
      console.log(this.camera.position.y);
      if (this.camera.position.y < 2) {
        this.velocity = 0;
        this.camera.position.y = 2;
      }
    }
  }
}
