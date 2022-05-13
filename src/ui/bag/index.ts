import grass from '../../static/block-icon/grass.png'
import stone from '../../static/block-icon/stone.png'
import tree from '../../static/block-icon/tree.png'
import wood from '../../static/block-icon/wood.png'
import diamond from '../../static/block-icon/diamond.png'
import quartz from '../../static/block-icon/quartz.png'
import glass from '../../static/block-icon/glass.png'
import { isMobile } from '../../utils'

export default class Bag {
  constructor() {
    if (isMobile) return

    this.bag.className = 'bag'
    this.items[0].classList.add('selected')

    for (let i = 0; i < this.items.length; i++) {
      this.bag.appendChild(this.items[i])
    }
    document.body.appendChild(this.bag)

    document.body.addEventListener('keydown', (e: KeyboardEvent) => {
      if (isNaN(parseInt(e.key)) || e.key === '0') {
        return
      }

      for (let i = 0; i < this.items.length; i++) {
        this.items[i].classList.remove('selected')
      }

      this.current = parseInt(e.key) - 1
      this.items[this.current].classList.add('selected')
    })

    document.body.addEventListener('wheel', (e: WheelEvent) => {
      if (!this.wheelGap) {
        this.wheelGap = true
        setTimeout(() => {
          this.wheelGap = false
        }, 100)
        if (e.deltaY > 0) {
          this.current++
          this.current > 9 && (this.current = 0)
        } else if (e.deltaY < 0) {
          this.current--
          this.current < 0 && (this.current = 9)
        }
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].classList.remove('selected')
        }
        this.items[this.current].classList.add('selected')
      }
    })
  }
  wheelGap = false
  current = 0
  icon = [grass, stone, tree, wood, diamond, quartz, glass]
  iconIndex = 0
  y = 0

  bag = document.createElement('div')

  items = new Array(10).fill(null).map(() => {
    let item = document.createElement('div')
    item.className = 'item'

    let img = document.createElement('img')
    if (this.icon[this.iconIndex]) {
      img.className = 'icon'
      img.alt = 'block'
      img.src = this.icon[this.iconIndex++]
      item.appendChild(img)
    }

    return item
  })
}
