import grass from '../icon/grass.png'
import stone from '../icon/stone.png'
import tree from '../icon/tree.png'
import wood from '../icon/wood.png'

export default class Bag {
  constructor() {
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

      this.items[parseInt(e.key) - 1].classList.add('selected')
    })
  }

  icon = [grass, stone, tree, wood]
  iconIndex = 0

  bag = document.createElement('div')

  items = new Array(10).fill(null).map(() => {
    let item = document.createElement('div')
    item.className = 'item'

    let img = document.createElement('img')
    if (this.icon[this.iconIndex]) {
      img.className = 'icon'
      img.src = this.icon[this.iconIndex++]
      item.appendChild(img)
    }

    return item
  })

  update = () => {}
}
