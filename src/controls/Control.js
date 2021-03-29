import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";

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
    this.canJump = true;
    this.velocity = 0;
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.vec = new THREE.Vector3();
    this.initEventListeners();
    this.i = 4096;
    this.mixer = null;
    this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.canHold = true;
    this.color = new THREE.Color();
    this.mouseHold = {};
    this.centerRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      8
    );
    this.downRay = new THREE.Raycaster(
      this.camera.position,
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
    this.forwardRay = new THREE.Raycaster(
      new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      ),
      new THREE.Vector3(1, 0, 0),
      0,
      0.2
    );
    this.backwardRay = new THREE.Raycaster(
      new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      ),
      new THREE.Vector3(-1, 0, 0),
      0,
      0.2
    );
    this.leftRay = new THREE.Raycaster(
      new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      ),
      new THREE.Vector3(0, 0, -1),
      0,
      0.2
    );
    this.rightRay = new THREE.Raycaster(
      new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      ),
      new THREE.Vector3(0, 0, 1),
      0,
      0.2
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
    // when lock / unlock, trigger corresponding callback
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
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mouseup", this.onMouseUp);
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
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  onMouseDown = e => {
    switch (e.button) {
      case 0:
        this.mouseHold.button = 0;
        break;
      case 2:
        this.mouseHold.button = 2;
    }

    this.onMouseHold(this.mouseHold);
    this.mouseHold.callback = setTimeout(() => {
      this.mouseHold.value = true;
    }, 500);
  };

  onMouseUp = () => {
    clearTimeout(this.mouseHold.callback);
    this.mouseHold.value = false;
  };

  onMouseHold(e) {
    if (this.canHold) {
      let vector = new THREE.Vector3(0, 0, -1);
      vector.applyQuaternion(this.camera.quaternion);
      console.log(vector);
      let theta = Math.atan2(vector.x, vector.z);
      console.log(theta);
      // this.camera.getWorldDirection(vector)
      switch (e.button) {
        // left click to remove block at crosshair
        case 0: {
          this.centerRay.setFromCamera({ x: 0, y: 0 }, this.camera);
          const intersects = this.centerRay.intersectObjects(this.terrain);
          if (intersects.length) {
            const instanceId = intersects[0].instanceId;
            // remove animation
            const m = new THREE.Matrix4();
            intersects[0].object.getMatrixAt(instanceId, m);
            const p = new THREE.Vector3().setFromMatrixPosition(m);
            const material = new BlockMaterial(intersects[0].object.name);
            const mesh = new THREE.Mesh(this.blockGeometry, material);
            mesh.position.x = p.x;
            mesh.position.y = p.y;
            mesh.position.z = p.z;
            this.scene.add(mesh);

            const scaleKF = new THREE.VectorKeyframeTrack(
              ".scale",
              [0, 1],
              [1, 1, 1, 0, 0, 0]
            );
            const clip = new THREE.AnimationClip("Action", 10, [scaleKF]);
            this.mixer = new THREE.AnimationMixer(mesh);
            const clipAction = this.mixer.clipAction(clip);
            clipAction.setLoop(THREE.LoopOnce);
            clipAction.play();
            setTimeout(() => {
              this.scene.remove(mesh);
            }, 200);

            // remove the block
            intersects[0].object.setMatrixAt(instanceId, new THREE.Matrix4());
            intersects[0].object.instanceMatrix.needsUpdate = true;
          }

          break;
        }

        // right click to put block at crosshair
        case 2: {
          this.centerRay.setFromCamera({ x: 0, y: 0 }, this.camera);
          const intersects = this.centerRay.intersectObjects(this.terrain);
          if (intersects.length) {
            const instanceId = intersects[0].instanceId;
            const matrix = new THREE.Matrix4();
            intersects[0].object.getMatrixAt(instanceId, matrix);
            const position = new THREE.Vector3().setFromMatrixPosition(matrix);
            const normal = intersects[0].face.normal;

            // put animation
            const material = new BlockMaterial("grass");
            const mesh = new THREE.Mesh(this.blockGeometry, material);
            mesh.position.x = normal.x + position.x;
            mesh.position.y = normal.y + position.y;
            mesh.position.z = normal.z + position.z;
            this.scene.add(mesh);
            const scaleKF = new THREE.VectorKeyframeTrack(
              ".scale",
              [0, 1],
              [0, 0, 0, 1, 1, 1]
            );
            const clip = new THREE.AnimationClip("Action", 1, [scaleKF]);
            this.mixer = new THREE.AnimationMixer(mesh);
            const clipAction = this.mixer.clipAction(clip);
            clipAction.setLoop(THREE.LoopOnce);
            clipAction.play();
            setTimeout(() => {
              this.scene.remove(mesh);
              // put the block
              const matrix2 = new THREE.Matrix4();
              matrix2.setPosition(
                normal.x + position.x,
                normal.y + position.y,
                normal.z + position.z
              );
              this.terrain[0].setMatrixAt(this.i, matrix2);
              this.terrain[0].setColorAt(this.i++, this.color);
              this.terrain[0].instanceColor.needsUpdate = true;
              this.terrain[0].instanceMatrix.needsUpdate = true;
            }, 200);
          }
          break;
        }
      }
      this.canHold = false;
      setTimeout(() => {
        this.canHold = true;
      }, 200);
    }
  }
  onMouseMove = e => {
    const movementX = e.movementX;
    const movementY = e.movementY;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;
    // make sure that -pi/2 <= eulerX <= pi/2
    // so that when camera reaches the top / bottom,
    // it won't flip to the opposite direction
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
          if (this.canJump) {
            this.velocity = 0.15;
            this.canJump = false;
            this.downRay.far = 0;
            setTimeout(() => {
              this.downRay.far = 10;
            }, 150);
          }
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
  moveUp(distance) {
    this.camera.position.y += distance;
  }

  update() {
    if (this.mouseHold.value) {
      this.onMouseHold(this.mouseHold);
    }
    if (this.mixer) {
      this.mixer.update(0.085);
    }
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
        this.moveUp(0.25);
      }
      if (this.movingDown) {
        this.moveUp(-0.25);
      }
    } else {
      // forward block check
      let origin = new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      );
      let vector = new THREE.Vector3(0, 0, -1);
      vector.applyQuaternion(this.camera.quaternion);
      vector = this.camera.getWorldDirection(vector);
      let direction = Math.atan2(vector.x, vector.z);
      this.forwardRay.ray.origin = origin;
      this.backwardRay.ray.origin = origin;
      this.leftRay.ray.origin = origin;
      this.rightRay.ray.origin = origin;
      let temp = [
        this.movingForward,
        this.movingBackward,
        this.movingLeft,
        this.movingRight
      ];

      let pi = Math.PI;
      const intersectF = this.forwardRay.intersectObjects(this.terrain);
      const intersectB = this.backwardRay.intersectObjects(this.terrain);
      const intersectL = this.leftRay.intersectObjects(this.terrain);
      const intersectR = this.rightRay.intersectObjects(this.terrain);
      if (intersectF.length) {
        if ((direction < -pi / 2 || direction > pi / 2) && this.movingRight) {
          this.movingRight = false;
        }
        if (direction < pi && direction > 0 && this.movingForward) {
          this.movingForward = false;
        }
        if (direction < pi / 2 && direction > -pi / 2 && this.movingLeft) {
          this.movingLeft = false;
        }
        if (direction < 0 && direction > -pi && this.movingBackward) {
          this.movingBackward = false;
        }
      }

      if (intersectB.length) {
        if (direction < -pi / 2 || direction > pi / 2) {
          this.movingLeft = false;
        }
        if (direction < pi && direction > 0) {
          this.movingBackward = false;
        }
        if (direction < pi / 2 && direction > -pi / 2) {
          this.movingRight = false;
        }
        if (direction < 0 && direction > -pi) {
          this.movingForward = false;
        }
      }

      if (intersectL.length) {
        if (direction < -pi / 2 || direction > pi / 2) {
          this.movingForward = false;
        }
        if (direction < pi && direction > 0) {
          this.movingLeft = false;
        }
        if (direction < pi / 2 && direction > -pi / 2) {
          this.movingBackward = false;
        }
        if (direction < 0 && direction > -pi) {
          this.movingRight = false;
        }
      }

      if (intersectR.length) {
        if (direction < -pi / 2 || direction > pi / 2) {
          this.movingBackward = false;
        }
        if (direction < pi && direction > 0) {
          this.movingRight = false;
        }
        if (direction < pi / 2 && direction > -pi / 2) {
          this.movingForward = false;
        }
        if (direction < 0 && direction > -pi) {
          this.movingLeft = false;
        }
      }

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
      this.velocity = Math.max(this.velocity, -0.5);
      this.moveUp(this.velocity);
      [
        this.movingForward,
        this.movingBackward,
        this.movingLeft,
        this.movingRight
      ] = temp;
      // falling check
      const intersects = this.downRay.intersectObjects(this.terrain);
      if (intersects.length) {
        const instanceId = intersects[0].instanceId;
        const matrix = new THREE.Matrix4();
        intersects[0].object.getMatrixAt(instanceId, matrix);
        const position = new THREE.Vector3().setFromMatrixPosition(matrix);
        if (this.camera.position.y < position.y + 2) {
          this.canJump = true;
          this.camera.position.y = position.y + 2;
          this.velocity = 0;
        }
      }
      // catching net
      if (this.camera.position.y < -100) {
        this.camera.position.y = 100;
      }
    }
  }
}
