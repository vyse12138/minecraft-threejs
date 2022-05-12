import UI from './joystick.html?raw'
import { htmlToDom } from '../../../utils'

export enum ActionKey {
  GO = 2,
  LEFT = 4,
  CENTER = 5,
  RIGHT = 6,
  BACK = 8,
  UP = 10,
  JUMP = 11,
  DOWN = 12
}

export enum ActionType {
  press,
  loosen
}

const getActionEl = (key: ActionKey) => {
  return document.querySelector(`#joy-action-${key}`) as HTMLButtonElement
}

const createActionInstance = (key: ActionKey) => {
  return {
    $el: getActionEl(key),
    on(type: ActionType, listener: (event: Event) => void) {
      if (type === ActionType.press) {
        this.$el.addEventListener('pointermove', listener)
      }
      if (type === ActionType.loosen) {
        this.$el.addEventListener('pointerout', listener)
      }
      return this
    },
    onPress(listener: (event: Event) => void) {
      return this.on(ActionType.press, listener)
    },

    onLoosen(listener: (event: Event) => void) {
      return this.on(ActionType.loosen, listener)
    },
    toggleVisible(visible: boolean) {
      const toggleMap = {
        block: 'none',
        none: 'block'
      }
      const display = this.$el.style.display as 'block' | 'none'
      if (visible === undefined) {
        this.$el.style.display = toggleMap[display]
      }
      this.$el.style.display = visible ? 'block' : 'none'
    }
  }
}

export const initJoystick = () => {
  htmlToDom(UI)

  return {
    GO: createActionInstance(ActionKey.GO),
    LEFT: createActionInstance(ActionKey.LEFT),
    CENTER: createActionInstance(ActionKey.CENTER),
    RIGHT: createActionInstance(ActionKey.RIGHT),
    BACK: createActionInstance(ActionKey.BACK),
    UP: createActionInstance(ActionKey.UP),
    JUMP: createActionInstance(ActionKey.JUMP),
    DOWN: createActionInstance(ActionKey.DOWN)
  }
}
