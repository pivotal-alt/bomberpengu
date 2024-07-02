import { BomberPenguGame, BomberPenguPlayer } from "../bomberpengu-game"
import { MAP_BLOCK_SIZE, MAP_HEIGHT, MAP_OFFSET_X, MAP_OFFSET_Y } from '../constants'

export class FreestyleBot {
  static name = "[Bot] Freestyle"
  #game: BomberPenguGame
  #me?: BomberPenguPlayer
  #enemy?: BomberPenguPlayer

  constructor(game: BomberPenguGame) {
    this.#game = game
    this.#game.on('start', this.onStart.bind(this))
    this.#game.on('tick', this.onTick.bind(this))
    if (this.#game.started) this.onStart()
  }

  async onStart() {
    for (const player of this.#game.players) {
      if (player.name === FreestyleBot.name) {
        this.#me = player
      } else {
        this.#enemy = player
      }
    }

    if (!this.#me || !this.#enemy) throw new Error('Missing player for start')
    
    await new Promise(resolve => setTimeout(resolve, 1))
    const x = MAP_OFFSET_X - MAP_BLOCK_SIZE
    const y = MAP_OFFSET_Y + MAP_HEIGHT
    this.#me.setPos(x, y)
  }

  onTick() {
    if (!this.#me || !this.#enemy) return
  }
}