import * as THREE from "three";
import BlockMaterial from "../materials/BlockMaterial.js";
import Audio from "../terrains/Audio.js";
export default class Control {
  constructor(camera, scene, terrain) {
    // init
    this.scene = scene;
    this.camera = camera;
    this.terrain = terrain;
    this.flyingMode = false;
    this.initEventListeners();
    this.audio = new Audio(this.camera);

    // flag for current movement state
    this.movingForward = false;
    this.movingBackward = false;
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.canJump = false;

    // vertical velocity
    this.velocity = 0;

    // some global variables
    this.euler = new THREE.Euler(0, 0, 0, "YXZ");
    this.vec = new THREE.Vector3();
    this.i = 8300;
    this.mixer = null;
    this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.canHold = true;
    this.color = new THREE.Color();
    this.mouseHold = {};

    // raycaster for add / remove block
    this.centerRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0,
      8
    );

    // raycaster for movement collision check
    this.downRay = new THREE.Raycaster(
      this.camera.position,
      new THREE.Vector3(0, -1, 0),
      0,
      2
    );
    this.forwardRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(1, 0, 0),
      0,
      0.4
    );
    this.backwardRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(-1, 0, 0),
      0,
      0.4
    );
    this.leftRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, -1),
      0,
      0.4
    );
    this.rightRay = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, 1),
      0,
      0.4
    );
  }

  initEventListeners() {
    // disable right click context menu for safari
    document.addEventListener("contextmenu", e => e.preventDefault());

    // click to lock
    document.addEventListener("click", () => {
      document.body.requestPointerLock();
    });
    // mousewheel to unlock (for testing)
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
  // when unlocked, remove control eventListeners and reset movement state
  onUnlock() {
    this.movingForward = false;
    this.movingBackward = false;
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.mouseHold.value = false;
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
      switch (e.button) {
        // left click to remove block at crosshair
        case 0: {
          this.centerRay.setFromCamera({ x: 0, y: 0 }, this.camera);
          const intersects = this.centerRay.intersectObjects(this.terrain);
          if (intersects.length) {
            this.audio.playSound(intersects[0].object.name);
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
            intersects[0].object.setMatrixAt(
              instanceId,
              new THREE.Matrix4().set(
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              )
            );
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

            // return when block overlaps with player
            if (
              position.x + normal.x === Math.round(this.camera.position.x) &&
              position.z + normal.z === Math.round(this.camera.position.z) &&
              (position.y + normal.y === Math.round(this.camera.position.y) ||
                position.y + normal.y ===
                  Math.round(this.camera.position.y - 1))
            ) {
              return;
            }
            this.audio.playSound("grass");

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
              // remove animation effect
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
              // update the block
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
              this.downRay.far = 2;
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

  // movements based on camera direction
  moveForward(distance) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.vec.crossVectors(this.camera.up, this.vec);
    this.camera.position.addScaledVector(this.vec, distance);
  }
  moveRight(distance) {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0);
    this.camera.position.addScaledVector(this.vec, distance);
  }

  // movements based on camera position
  moveX(distance, factor = 0.2 / Math.PI) {
    this.camera.position.x += distance * factor;
  }
  moveY(distance) {
    this.camera.position.y += distance;
  }
  moveZ(distance, factor = 0.2 / Math.PI) {
    this.camera.position.z += distance * factor;
  }

  update() {
    // check for mouse hold event
    if (this.mouseHold.value) {
      this.onMouseHold(this.mouseHold);
    }

    // check for animations
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
        this.moveY(0.25);
      }
      if (this.movingDown) {
        this.moveY(-0.25);
      }
    } else {
      // flying mode off

      // horizontal block check

      // setup horizontal raycasters based on camera position
      let origin = new THREE.Vector3(
        this.camera.position.x,
        this.camera.position.y - 1,
        this.camera.position.z
      );
      this.forwardRay.ray.origin = origin;
      this.backwardRay.ray.origin = origin;
      this.leftRay.ray.origin = origin;
      this.rightRay.ray.origin = origin;

      // calculate radian angle of camera facing direction
      // the result is: -pi < direction < pi
      let vector = new THREE.Vector3(0, 0, -1);
      vector.applyQuaternion(this.camera.quaternion);
      let direction = Math.atan2(vector.x, vector.z);

      // store current movement state
      let movementState = [
        this.movingForward,
        this.movingBackward,
        this.movingLeft,
        this.movingRight
      ];

      // check collision based on camera position's direction
      const intersectF = this.forwardRay.intersectObjects(this.terrain);
      const intersectB = this.backwardRay.intersectObjects(this.terrain);
      const intersectL = this.leftRay.intersectObjects(this.terrain);
      const intersectR = this.rightRay.intersectObjects(this.terrain);

      // update movementState based on collision checks and camera's direction and position
      // there's four sections, one for each camera position's direction
      // which are forward, backward, left and right
      // in each section, udpate movement state based on the key pressed and the camera facing direction
      if (intersectF.length) {
        if (direction < Math.PI && direction > 0 && this.movingForward) {
          this.movingForward = false;
          if (
            (!intersectL.length && direction > Math.PI / 2) ||
            (!intersectR.length && direction < Math.PI / 2)
          ) {
            this.moveZ(Math.PI / 2 - direction);
          }
        }
        if (direction < 0 && direction > -Math.PI && this.movingBackward) {
          this.movingBackward = false;
          if (
            (!intersectL.length && direction > -Math.PI / 2) ||
            (!intersectR.length && direction < -Math.PI / 2)
          ) {
            this.moveZ(-Math.PI / 2 - direction);
          }
        }
        if (
          direction < Math.PI / 2 &&
          direction > -Math.PI / 2 &&
          this.movingLeft
        ) {
          this.movingLeft = false;
          if (
            (!intersectR.length && direction < 0) ||
            (!intersectL.length && direction > 0)
          ) {
            this.moveZ(-direction);
          }
        }
        if (
          (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
          this.movingRight
        ) {
          this.movingRight = false;
          if (!intersectR.length && direction > 0) {
            this.moveZ(Math.PI - direction);
          }
          if (!intersectL.length && direction < 0) {
            this.moveZ(-Math.PI - direction);
          }
        }
      }

      if (intersectB.length) {
        if (direction < 0 && direction > -Math.PI && this.movingForward) {
          this.movingForward = false;
          if (
            (!intersectL.length && direction < -Math.PI / 2) ||
            (!intersectR.length && direction > -Math.PI / 2)
          ) {
            this.moveZ(Math.PI / 2 + direction);
          }
        }
        if (direction < Math.PI && direction > 0 && this.movingBackward) {
          this.movingBackward = false;
          if (
            (!intersectL.length && direction < Math.PI / 2) ||
            (!intersectR.length && direction > Math.PI / 2)
          ) {
            this.moveZ(direction - Math.PI / 2);
          }
        }
        if (
          (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
          this.movingLeft
        ) {
          this.movingLeft = false;
          if (!intersectL.length && direction > 0) {
            this.moveZ(-Math.PI + direction);
          }
          if (!intersectR.length && direction < 0) {
            this.moveZ(Math.PI + direction);
          }
        }
        if (
          direction < Math.PI / 2 &&
          direction > -Math.PI / 2 &&
          this.movingRight
        ) {
          this.movingRight = false;
          if (
            (!intersectL.length && direction < 0) ||
            (!intersectR.length && direction > 0)
          ) {
            this.moveZ(direction);
          }
        }
      }

      if (intersectL.length) {
        if (
          (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
          this.movingForward
        ) {
          this.movingForward = false;
          if (!intersectF.length && direction > 0) {
            this.moveX(Math.PI - direction);
          }
          if (!intersectB.length && direction < 0) {
            this.moveX(-Math.PI - direction);
          }
        }
        if (
          direction < Math.PI / 2 &&
          direction > -Math.PI / 2 &&
          this.movingBackward
        ) {
          this.movingBackward = false;
          if (
            (!intersectF.length && direction < 0) ||
            (!intersectB.length && direction > 0)
          ) {
            this.moveX(-direction);
          }
        }
        if (direction > 0 && direction < Math.PI && this.movingLeft) {
          this.movingLeft = false;
          if (
            (!intersectB.length && direction > Math.PI / 2) ||
            (!intersectF.length && direction < Math.PI / 2)
          ) {
            this.moveX(Math.PI / 2 - direction);
          }
        }
        if (direction < 0 && direction > -Math.PI && this.movingRight) {
          this.movingRight = false;
          if (
            (!intersectB.length && direction > -Math.PI / 2) ||
            (!intersectF.length && direction < -Math.PI / 2)
          ) {
            this.moveX(-Math.PI / 2 - direction);
          }
        }
      }

      if (intersectR.length) {
        if (
          direction < Math.PI / 2 &&
          direction > -Math.PI / 2 &&
          this.movingForward
        ) {
          this.movingForward = false;
          if (
            (!intersectB.length && direction < 0) ||
            (!intersectF.length && direction > 0)
          ) {
            this.moveX(direction);
          }
        }
        if (
          (direction < -Math.PI / 2 || direction > Math.PI / 2) &&
          this.movingBackward
        ) {
          this.movingBackward = false;
          if (!intersectB.length && direction > 0) {
            this.moveX(-Math.PI + direction);
          }
          if (!intersectF.length && direction < 0) {
            this.moveX(Math.PI + direction);
          }
        }
        if (direction < 0 && direction > -Math.PI && this.movingLeft) {
          this.movingLeft = false;
          if (
            (!intersectF.length && direction > -Math.PI / 2) ||
            (!intersectB.length && direction < -Math.PI / 2)
          ) {
            this.moveX(Math.PI / 2 + direction);
          }
        }
        if (direction > 0 && direction < Math.PI && this.movingRight) {
          this.movingRight = false;
          if (
            (!intersectF.length && direction > Math.PI / 2) ||
            (!intersectB.length && direction < Math.PI / 2)
          ) {
            this.moveX(direction - Math.PI / 2);
          }
        }
      }

      // update camera position based on movement state
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

      // restore movement state
      [
        this.movingForward,
        this.movingBackward,
        this.movingLeft,
        this.movingRight
      ] = movementState;

      // gravity simulation
      this.velocity -= 0.0075;
      this.velocity = Math.max(this.velocity, -0.5);
      this.moveY(this.velocity);

      // falling check
      const intersectD = this.downRay.intersectObjects(this.terrain);
      if (intersectD.length) {
        const instanceId = intersectD[0].instanceId;
        const matrix = new THREE.Matrix4();
        intersectD[0].object.getMatrixAt(instanceId, matrix);
        const position = new THREE.Vector3().setFromMatrixPosition(matrix);

        // set canJump flag to true when player touches the
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
