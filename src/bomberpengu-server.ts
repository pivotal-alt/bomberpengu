import { XMLParser } from "fast-xml-parser"
import { WebSocketServer, WebSocketClient } from "./lib/ws-browser-mock"
import { BomberPenguGame, BomberPenguPlayer } from "./bomberpengu-game"
import { } from './constants'
import * as bots from './bots'

const botMap = Object.values(bots).map(e => e.name)

export class BomberPenguServer {
  _server: WebSocketServer
  _xmlParser  = new XMLParser({
    allowBooleanAttributes: true,
    attributeNamePrefix: "",
    ignoreAttributes: false,
    alwaysCreateTextNode: true
  })

  constructor(host: string, port: number) {
    this._server = new WebSocketServer({ host, port })
    this._server.on('connection', this._onSocket.bind(this))
  }

  _sendXml(xml: string, socket: WebSocketClient) {
    socket.send(xml.replace(/\0*$/, '\0'))
  }

  _sendError(error: string, socket: WebSocketClient) {
    this._sendXml(`<errorMsg>${error}</errorMsg>`, socket)
  }

  _onSocket(socket: WebSocketClient) {
    let user: { username: string } | null = null
    let game: BomberPenguGame | null = null
    
    socket.on('message', async (data: ArrayBuffer) => {
      const xmlStr = new TextDecoder().decode(data).slice(0, -1)
      const xml = this._xmlParser.parse(xmlStr)

      console.log(xml)
      
      if (xml.auth) {
        const { name } = xml.auth
        const [username, _password] = name.split(':')
        if (username.startsWith('[Bot]')) {
          return this._sendError('Invalid username', socket)
        }

        user = { username }
        
        for (const bot of Object.values(bots)) {
          this._sendXml(`<newPlayer name="${bot.name}" skill="0/0/0" state="0" />`, socket)
        }
      }

      if (!user) {
        this._sendError('Not logged in', socket)
        return
      }

      if (xml.challenge) {
        const { name } = xml.challenge

        if (game) return this._sendError('Already in game', socket)

        const botMode = name.startsWith('[Bot]')
        const me = new BomberPenguPlayer(user.username)
        const enemy = new BomberPenguPlayer(name)
        game = new BomberPenguGame()
        game.addPlayer(me)
        game.addPlayer(enemy)

        if (botMode) {
          const BotClass = Object.values(bots).find(e => e.name === name)
          if (!BotClass) {
            game = null
            return this._sendError('Invalid bot', socket)
          }

          const bot = new BotClass(game)

          const seed = Math.floor(Math.random() * 20000)
          this._sendXml(`<startGame name="${name}" />`, socket)
          await new Promise(resolve => setTimeout(resolve, 100))
          this._sendXml(`<16 s="${seed}" />`, socket)

          enemy.on('move', ({ x, y }) => {
            this._sendXml(`<12 x="${x}" y="${y}" c="0000" />`, socket)
          })

          game.start(seed)
        } else {
          game = null
          return this._sendError('NOT IMPLEMENTED', socket)
        }
      }
    })

    socket.on('close', () => {
      console.log('Client disconnected')
    })
  }
}

export default new BomberPenguServer('pengu.test', 1234)
