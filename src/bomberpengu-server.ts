import { XMLParser } from "fast-xml-parser"
import { WebSocketServer, WebSocketClient } from "./lib/ws-browser-mock"


export class BomberpenguServer {
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

  _onSocket(socket: WebSocketClient) {
    console.log('Client connected')
    
    socket.on('message', (data: ArrayBuffer) => {
      const xmlStr = new TextDecoder().decode(data).slice(0, -1)
      const xml = this._xmlParser.parse(xmlStr)
      
      PARSEN!
    })

    socket.on('close', () => {
      console.log('Client disconnected')
    })
  }
}

export default new BomberpenguServer('pengu.test', 1234)
