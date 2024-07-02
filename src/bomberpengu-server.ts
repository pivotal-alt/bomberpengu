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
    
    socket.on('message', (data: ArrayBuffer) => {
      const xmlStr = new TextDecoder().decode(data).slice(0, -1)
      const xml = this._xmlParser.parse(xmlStr)

      if (!user && !xml.auth) {
        this._sendError('Not logged in', socket)
        return
      }
      
      if (xml.auth) {
        const { name } = xml.auth
        const [username, _password] = name.split(':')
        if (username.startsWith('[Bot]')) {
          return this._sendError('Invalid username', socket)
        }

        user = { username }
      }
      if (xml.challenge) {
        const { name } = xml.challenge

      }
    })

    socket.on('close', () => {
      console.log('Client disconnected')
    })
  }
}

export default new BomberPenguServer('pengu.test', 1234)
