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

  const stop = () => {
    control.velocity.y = 0
    control.velocity.x = 0
    control.velocity.z = 0
  }

  ui.play!.addEventListener('click', () => {
    const joy = initJoystick()

    joy.GO.onPress(() => {
      control.setMovementHandler({
        key: 'w',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.LEFT_GO.onPress(() => {
      control.setMovementHandler({
        key: 'w',
      } as KeyboardEvent)
      control.setMovementHandler({
        key: 'a',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.RIGHT_GO.onPress(() => {
      control.setMovementHandler({
        key: 'w',
      } as KeyboardEvent)
      control.setMovementHandler({
        key: 'd',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.LEFT.onPress(() => {
      control.setMovementHandler({
        key: 'a',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.RIGHT.onPress(() => {
      control.setMovementHandler({
        key: 'd',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.BACK.onPress(() => {
      control.setMovementHandler({
        key: 's',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.LEFT_BACK.onPress(() => {
      control.setMovementHandler({
        key: 's',
      } as KeyboardEvent)
      control.setMovementHandler({
        key: 'a',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.RIGHT_BACK.onPress(() => {
      control.setMovementHandler({
        key: 's',
      } as KeyboardEvent)
      control.setMovementHandler({
        key: 'd',
      } as KeyboardEvent)
    }).onLoosen(stop)

    joy.JUMP.onPress(() => {
      control.setMovementHandler({
        key: ' ',
      } as KeyboardEvent)
    }).onLoosen(() => {
      control.velocity.y = 0
    })

    joy.CENTER.onPress(() => {
      control.setMovementHandler({
        key: 'q',
      } as KeyboardEvent)

      control.setMovementHandler({
        key: ' ',
      } as KeyboardEvent)

      if (control.player.mode === Mode.flying) {
        joy.UP.toggleVisible(true)
        joy.DOWN.toggleVisible(true)
      } else {
        joy.UP.toggleVisible(false)
        joy.DOWN.toggleVisible(false)
      }
    }).onLoosen(stop)

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
