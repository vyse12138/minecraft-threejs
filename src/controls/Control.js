import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";

export default class Control {
  constructor(camera, scene) {
    this.scene = scene;
    this.camera = camera;
    this.flyingMode = false;
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
    document.addEventListener("mousewheel", () => {
      document.exitPointerLock();
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
    document.addEventListener("mousedown", this.onClick);
  }
  // when unlocked, remove control eventListeners
  onUnlock() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("mousedown", this.onClick);
  }

  onClick = e => {
    switch (e.button) {
      case 0: {
        const raycaster = new THREE.Raycaster();
        raycaster.far = 8;
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
          const object = this.scene.getObjectById(intersects[0].object.id);
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              material.dispose();
            });
          } else {
            object.material.dispose();
          }
          this.scene.remove(object);
        }
        break;
      }
      case 2: {
        let raycaster = new THREE.Raycaster();
        raycaster.far = 8;
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        let intersects = raycaster.intersectObjects(this.scene.children);
        if (intersects.length > 0) {
          const object = this.scene.getObjectById(intersects[0].object.id);
          console.log(object.geometry)
          const normal = intersects[0].face.normal
          let block = new THREE.BoxGeometry();
          let mesh = new THREE.Mesh(block, new BlockMaterial("grass"));
          mesh.position.x = normal.x + object.position.x
          mesh.position.y = normal.y + object.position.y
          mesh.position.z = normal.z + object.position.z
          this.scene.add(mesh);
        }
        break;
      }
    }
  };
  onMouseMove = e => {
    let movementX = e.movementX;
    let movementY = e.movementY;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    // make sure that -pi/2 <= eulerX <= pi/2
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
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
        if (this.flyingMode) {
          this.movingUp = true;
        } else {
          this.velocity = 0.15;
        }
        break;
      case "ShiftLeft":
        if (this.flyingMode) {
          this.movingDown = true;
        }
        break;
      case "KeyQ":
        this.flyingMode = !this.flyingMode;
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
      case "ShiftLeft":
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
    if (this.flyingMode) {
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
      if (this.camera.position.y < 2) {
        this.velocity = 0;
        this.camera.position.y = 2;
      }
    }
  }
}
