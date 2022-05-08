import Control from '../control'
import { Mode } from '../player'
import UI from '../ui'
import { useDevice } from '../utils'
import { initJoystick } from './core'

const { isMobile } = useDevice()

export const setupJoy = (ui: UI, control: Control) => {
  if (!isMobile) {
    return
  }

  const cancel = () => {
    control.resetMovementHandler({ key: 'w' } as KeyboardEvent)
  }

  const stop = () => {
    control.resetMovementHandler({ key: ' ' } as KeyboardEvent)
  }

  ui.play!.addEventListener('click', () => {
    const joy = initJoystick()

    joy.GO.onPress(() => {
      control.setMovementHandler({
        key: 'w',
      } as KeyboardEvent)
    }).onLoosen(cancel)

    joy.LEFT.onPress(() => {
      control.setMovementHandler({
        key: 'a',
      } as KeyboardEvent)
    }).onLoosen(cancel)

    joy.RIGHT.onPress(() => {
      control.setMovementHandler({
        key: 'd',
      } as KeyboardEvent)
    }).onLoosen(cancel)

    joy.BACK.onPress(() => {
      control.setMovementHandler({
        key: 's',
      } as KeyboardEvent)
    }).onLoosen(cancel)

    joy.JUMP.onPress(() => {
      control.setMovementHandler({
        key: ' ',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.CENTER.onPress(() => {
      control.setMovementHandler({
        key: 'q',
      } as KeyboardEvent)

      if (control.player.mode === Mode.flying) {
        joy.UP.toggleVisible(true)
        joy.DOWN.toggleVisible(true)
      } else {
        joy.UP.toggleVisible(false)
        joy.DOWN.toggleVisible(false)
      }
    })

    joy.UP.onPress(() => {
      control.setMovementHandler({
        key: ' ',
      } as KeyboardEvent)
    })
      .onLoosen(stop)
      .toggleVisible(false)

    joy.DOWN.onPress(() => {
      control.setMovementHandler({
        key: 'Shift',
      } as KeyboardEvent)
    })
      .onLoosen(stop)
      .toggleVisible(false)
  })
}
