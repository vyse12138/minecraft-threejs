import * as THREE from "three";

export default class Control {
  constructor(camera, scene, terrain) {
    this.scene = scene;
    this.camera = camera;
    this.terrain = terrain;
    this.flyingMode = false;
    this.movingForward = false;
    this.movingBackward = false;
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.velocity = 0;
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.vec = new THREE.Vector3();
    this.initEventListeners();
    this.i = 16384;
    this.raycaster = new THREE.Raycaster(
      this.camera.position,
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
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
    this.movingForward = false;
    this.movingBackward = false;
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("mousedown", this.onClick);
  }

  onClick = e => {
    e.preventDefault();
    switch (e.button) {
      case 0: {
        const raycaster = new THREE.Raycaster();
        raycaster.far = 8;
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = raycaster.intersectObjects(this.terrain);
        if (intersects.length > 0) {
          let instanceId = intersects[0].instanceId;
          intersects[0].object.setMatrixAt(instanceId, new THREE.Matrix4());
          intersects[0].object.instanceMatrix.needsUpdate = true;
        }
        break;
      }
      case 2: {
        const raycaster = new THREE.Raycaster();
        raycaster.far = 8;
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = raycaster.intersectObjects(this.terrain);

        if (intersects.length > 0) {
          let instanceId = intersects[0].instanceId;
          let matrix = new THREE.Matrix4();
          intersects[0].object.getMatrixAt(instanceId, matrix);
          let position = new THREE.Vector3().setFromMatrixPosition(matrix);

          const normal = intersects[0].face.normal;

          const matrix2 = new THREE.Matrix4();
          matrix2.setPosition(
            normal.x + position.x,
            normal.y + position.y,
            normal.z + position.z
          );
          intersects[0].object.setMatrixAt(this.i++, matrix2);
          intersects[0].object.instanceMatrix.needsUpdate = true;
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
      // flying mode on
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
      // flying mode off
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
      this.velocity = Math.max(this.velocity, -0.5)
      this.camera.position.y += this.velocity;

      const intersects = this.raycaster.intersectObjects(this.terrain);
      if (intersects.length > 0) {
        let instanceId = intersects[0].instanceId;
        let matrix = new THREE.Matrix4();
        intersects[0].object.getMatrixAt(instanceId, matrix);
        let position = new THREE.Vector3().setFromMatrixPosition(matrix);
        if (this.camera.position.y < position.y + 2) {
          this.camera.position.y = position.y + 2;
          this.velocity = 0;
        }
      }
      if (this.camera.position.y < -100) {
        this.camera.position.y = 100
      }
    }
  }
}
