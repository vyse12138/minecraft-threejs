import UI from './ui.html?raw'
import { htmlToDom } from '../../utils'

export enum ActionKey {
  LEFT_GO = 1,
  GO = 2,
  RIGHT_GO = 3,
  LEFT = 4,
  CENTER = 5,
  RIGHT = 6,
  LEFT_BACK = 7,
  BACK = 8,
  RIGHT_BACK = 9,
  UP = 10,
  JUMP = 11,
  DOWN = 12,
}

export enum ActionType {
  press,
  loosen,
}

const getActionEl = (key: ActionKey) => {
  return document.querySelector(`#joy-action-${key}`) as HTMLButtonElement
}

const createActionInstance = (key: ActionKey) => {
  return {
    $el: getActionEl(key),
    on(type: ActionType, listener: (event: Event) => void) {
      if (type === ActionType.press) {
        this.$el.addEventListener('pointerenter', listener)
      }
      if (type === ActionType.loosen) {
        this.$el.addEventListener('pointerleave', listener)
      }
      return this
    },
    /**
     * @alias on
     */
    onPress(listener: (event: Event) => void) {
      return this.on(ActionType.press, listener)
    },
    /**
     * @alias on
     */
    onLoosen(listener: (event: Event) => void) {
      return this.on(ActionType.loosen, listener)
    },
    toggleVisible(visible: boolean) {
      const toggleMap = {
        block: 'none',
        none: 'block',
      }
      const display = this.$el.style.display as 'block' | 'none'
      if (visible === undefined) {
        this.$el.style.display = toggleMap[display]
      }
      this.$el.style.display = visible ? 'block' : 'none'
    },
  }
}

interface JoystickOptions {
  safeWidth: number
}
export const initJoystick = (
  options: JoystickOptions = {
    safeWidth: 30,
  }
) => {
  const domFragment = htmlToDom(UI)
  window.document.body.appendChild(domFragment)

  const joystick = document.querySelector('.joystick') as HTMLDivElement
  const joystick_left = document.querySelector(
    '.joystick-left'
  ) as HTMLDivElement
  const joystick_right = document.querySelector(
    '.joystick-right'
  ) as HTMLDivElement

  joystick_left.style.marginLeft = `${options.safeWidth}px`
  joystick_right.style.marginRight = `${options.safeWidth}px`

  return {
    $joystick: joystick,
    $joystick_left: joystick_left,
    $joystick_right: joystick_right,

    LEFT_GO: createActionInstance(ActionKey.LEFT_GO),

    GO: createActionInstance(ActionKey.GO),

    RIGHT_GO: createActionInstance(ActionKey.RIGHT_GO),

    LEFT: createActionInstance(ActionKey.LEFT),

    CENTER: createActionInstance(ActionKey.CENTER),

    RIGHT: createActionInstance(ActionKey.RIGHT),

    LEFT_BACK: createActionInstance(ActionKey.LEFT_BACK),

    BACK: createActionInstance(ActionKey.BACK),

    RIGHT_BACK: createActionInstance(ActionKey.RIGHT_BACK),

    UP: createActionInstance(ActionKey.UP),

    JUMP: createActionInstance(ActionKey.JUMP),

    DOWN: createActionInstance(ActionKey.DOWN),
  }
}
