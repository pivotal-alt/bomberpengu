declare global {
  interface Window {
    oWebSocket: typeof WebSocket
  }
}

interface IWebSocketMock extends WebSocket {
  recv: (data: string | ArrayBuffer) => void
}

interface MockHandler {
  host: string
  port: number
  onSend: (socket: IWebSocketMock, data: ArrayBuffer) => void
  onRecv: (socket: IWebSocketMock, data: ArrayBuffer) => void
}

const handlers: MockHandler[] = []

export const registerHandler = (handler: MockHandler) => {
  if (handlers.indexOf(handler) === -1) handlers.push(handler)
}

export const unregisterHandler = (handler: MockHandler) => {
  handlers.splice(handlers.indexOf(handler), 1)
}

window.oWebSocket = window.oWebSocket || window.WebSocket
window.WebSocket = function (url: string | URL, protocols?: string | string[] | undefined) {
  const currentHandlers = handlers.filter(e => {
    return e.host === new URL(url).hostname && e.port === +new URL(url).port
  })

  /*if (!/pengu\.test/.test(url)) {
    return new window.oWebSocket(url, protocols);
  }*/

  class WebSocketMock implements IWebSocketMock {
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3
    _events = new EventTarget()
    _closed = false
    onopen: ((event: Event) => void) | null = null
    onmessage: ((event: Event) => void) | null = null
    onclose: ((event: Event) => void) | null = null
    onerror: ((event: Event) => void) | null = null

    get readyState() { return this._closed ? WebSocketMock.CLOSED : WebSocketMock.OPEN }
    get bufferedAmount() { return 0 }
    get binaryType(): "arraybuffer" | "blob" { return 'blob' }
    set binaryType(_type) {}
    get url(): string { return String(url) }
    get protocol(): string {
      return protocols
        ? Array.isArray(protocols)
          ? protocols.join(',')
          : protocols
        : '';
    }

    constructor() {
      this.addEventListener('open', (event: Event) => {
        if (this.onopen) this.onopen(event)
      })
      this.addEventListener('message', (event: Event) => {
        if (this.onmessage) this.onmessage(event)
      })
      this.addEventListener('close', (event: Event) => {
        if (this.onclose) this.onclose(event)
      })
      this.addEventListener('error', (event: Event) => {
        if (this.onerror) this.onerror(event)
      })

      this.open()
    }

    addEventListener(name: string, cb: (event: Event) => void) {
      return this._events.addEventListener(name, cb);
    }

    removeEventListener(name: string, cb: (event: Event) => void) {
      return this._events.removeEventListener(name, cb);
    }

    dispatchEvent(event: Event) {
      return this._events.dispatchEvent(event);
    }

    send(data: string | ArrayBuffer) {
      if (this._closed) throw new Error('WebSocket is closed');
      if (typeof data === "string") data = new TextEncoder().encode(data).buffer

      currentHandlers.forEach(e => e.onSend(this, data))
    }

    recv(data: string | ArrayBuffer) {
      if (this._closed) throw new Error('WebSocket is closed');

      currentHandlers.forEach(e => e.onRecv(this, data))

      const event = new Event('message');
      event.data = data
      this.dispatchEvent(event);
    }

    close(code: number, reason: string) {
      this._closed = true;
      const event = new Event('close');
      event.code = code || 1000;
      event.reason = reason || '';
      this.dispatchEvent(event);
    }

    open() {
      setTimeout(() => {
        const event = new Event('open');
        this.dispatchEvent(event);
      }, 10);
    }
  }

  return new WebSocketMock()
} as unknown as typeof WebSocket;