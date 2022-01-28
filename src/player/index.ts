export enum Mode {
  walking = 'walking',
  sprinting = 'sprinting',
  flying = 'flying',
  sprintFlying = 'sprintFlying',
  sneaking = 'sneaking'
}

export enum Speed {
  // walking = 4.317,
  walking = 5.317,
  sprinting = 5.612,
  flying = 10.89,
  sprintFlying = 21.78,
  sneaking = 1.95
}
export default class Player {
  mode = Mode.sprintFlying
  speed = Speed[this.mode]

  setMode(Mode: Mode) {
    this.mode = Mode
    this.speed = Speed[this.mode]
  }
  falling = 38.4

  jump = 1.2522

  body = {
    height: 1.8,
    width: 0.6
  }
}
