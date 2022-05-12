import Control from '../../control'
import { Mode } from '../../player'
import { initJoystick } from './core'

export default class Joystick {
  constructor(control: Control) {
    this.control = control
  }

  private emitKeyboardEvent = (key: string) => {
    return {
      key
    } as KeyboardEvent
  }

  control: Control
  init = () => {
    const joystick = initJoystick()

    joystick.GO.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('w'))
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent('w'))
    })

    joystick.LEFT.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('a'))
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent('a'))
    })

    joystick.RIGHT.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('d'))
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent('d'))
    })

    joystick.BACK.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('s'))
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent('s'))
    })

    joystick.JUMP.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent(' '))
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent(' '))
    })

    joystick.CENTER.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('q'))
      this.control.setMovementHandler(this.emitKeyboardEvent(' '))

      if (this.control.player.mode === Mode.flying) {
        joystick.UP.toggleVisible(true)
        joystick.DOWN.toggleVisible(true)
      } else {
        joystick.UP.toggleVisible(false)
        joystick.DOWN.toggleVisible(false)
      }
    }).onLoosen(() => {
      this.control.resetMovementHandler(this.emitKeyboardEvent(' '))
    })

    joystick.UP.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent(' '))
    })
      .onLoosen(() => {
        this.control.resetMovementHandler(this.emitKeyboardEvent(' '))
      })
      .toggleVisible(false)

    joystick.DOWN.onPress(() => {
      this.control.setMovementHandler(this.emitKeyboardEvent('Shift'))
    })
      .onLoosen(() => {
        this.control.resetMovementHandler(this.emitKeyboardEvent('Shift'))
      })
      .toggleVisible(false)
  }
}
