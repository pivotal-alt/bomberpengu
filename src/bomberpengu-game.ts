import { EventEmitter } from "events"
import { MAP_OFFSET_X, MAP_OFFSET_Y, MAP_BLOCK_SIZE, TICKRATE } from './constants'

export class BomberPenguPlayer extends EventEmitter {
  #alive = true
  #name: string = ""
  #pos: Vec2 = { x: 0, y: 0 }
  #gridPos: Vec2 = { x: 0, y: 0 }
  #items = { bombs: 1, fire: 1, speed: 1, kick: false }
  
  get alive() { return this.#alive }
  get name() { return this.#name }
  get pos() { return this.#pos }
  set pos({ x, y }) { this.setPos(x, y ) }
  get gridPos() { return this.#gridPos }
  get items() { return this.#items }

  constructor(name: string) {
    super()
    this.#name = name
  }

  setBombs(num: number) {
    if (num === this.#items.bombs) return
    const previous = this.#items.bombs
    this.#items.bombs = num
    this.emit('bombsChanged', num, previous)
  }

  setFire(num: number) {
    if (num === this.#items.fire) return
    const previous = this.#items.fire
    this.#items.fire = num
    this.emit('fireChanged', num, previous)
  }

  setSpeed(num: number) {
    if (num === this.#items.speed) return
    const previous = this.#items.speed
    this.#items.speed = num
    this.emit('speedChanged', num, previous)
  }

  setKick(kick: boolean) {
    if (kick === this.#items.kick) return
    const previous = this.#items.kick
    this.#items.kick = kick
    this.emit('kickChanged', kick, previous)
  }

  die() {
    if (!this.#alive) throw new Error('Already dead')
    this.#alive = false
    this.emit('die')
  }

  setPos(x: number, y: number) {
    if (this.#pos.x === x && this.#pos.y === y) return

    const previousPos = { ...this.#pos }
    this.#pos.x = x
    this.#pos.y = y
    this.#gridPos.x = Math.floor((x - MAP_OFFSET_X) / MAP_BLOCK_SIZE)
    this.#gridPos.y = Math.floor((y - MAP_OFFSET_Y) / MAP_BLOCK_SIZE)
    this.emit('move', this.#pos, previousPos)
  }

  tick() {
    this.emit('tick')
  }
}

export class BomberPenguGame extends EventEmitter {
  started = false
  players: BomberPenguPlayer[] = []
  seed: string = ""
  
  constructor() {
    super()
  }

  addPlayer(player: BomberPenguPlayer) {
    if (this.players.length === 2) throw new Error('Game is full')
    this.players.push(player)
    this.emit('playerAdded', player)
  }

  start() {
    if (this.started) throw new Error('Game already started')
    this.started = true

    setTimeout(() => {
      this.emit('start')
      this.tick()
    }, 1)
  }

  tick() {
    if (!this.started) return

    for (const player of this.players) {
      player.tick()
    }

    setTimeout(() => this.tick(), 1000 / TICKRATE)
  }
}
