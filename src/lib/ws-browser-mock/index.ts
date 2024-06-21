import { EventEmitter } from 'events';

export class WebSocketClient extends EventEmitter {
  static CONNECTING: 0 = 0;
  static OPEN: 1 = 1;
  static CLOSING: 2 = 2;
  static CLOSED: 3 = 3;
  CONNECTING: 0 = 0;
  OPEN: 1 = 1;
  CLOSING: 2 = 2;
  CLOSED: 3 = 3;

  readonly bufferedAmount = 0;
  binaryType: 'nodebuffer' | 'arraybuffer' | 'fragments' = 'nodebuffer';
  protocol = '';
  readyState: number = WebSocketClient.CONNECTING;
  url = '';
  extensions = {};
  isPaused = false;
  _events = new EventTarget();

  onopen: ((ev: Event) => any) | null = null;
  onmessage: ((ev: MessageEvent) => any) | null = null;
  onerror: ((ev: Event) => any) | null = null;
  onclose: ((ev: CloseEvent) => any) | null = null;

  constructor(url: string | URL, protocols: string | string[] = []) {
    super();
    this.url = typeof url === 'string' ? url : url.href;
    this.protocol =
      typeof protocols === 'string' ? protocols : protocols.join(',');

    this.on('open', () => {
      this.readyState = WebSocketClient.OPEN;
      const evt = new Event('open');
      this.onopen?.(evt);
      this.dispatchEvent(evt);
    });

    this.on('message', (data) => {
      const evt = new MessageEvent('message', { data });
      this.onmessage?.(evt);
      this.dispatchEvent(evt);
    });

    this.on('close', (code, reason) => {
      this.readyState = WebSocketClient.CLOSED;
      const evt = new CloseEvent('close', { code, reason });
      this.onclose?.(evt);
      this.dispatchEvent(evt);
    });

    this.on('error', (error) => {
      const evt = new ErrorEvent('error', { error });
      this.onerror?.(evt);
      this.dispatchEvent(evt);
    });
  }

  send(data: String | ArrayBuffer | ArrayBufferTypes) {
    setTimeout(() => {
      this.emit('send', data); // Custom send event
    }, 1);
  }

  pause() {
    if (this.readyState === WebSocketClient.CONNECTING) return;
    if (this.readyState === WebSocketClient.CLOSED) return;
    throw new Error('pause not implemented');
  }

  ping(_data: any, _mask: boolean, _callback: Function) {
    throw new Error('ping not implemented');
  }

  pong(_data: any, _mask: boolean, _callback: Function) {
    throw new Error('pong not implemented');
  }

  resume() {
    if (this.readyState === WebSocketClient.CONNECTING) return;
    if (this.readyState === WebSocketClient.CLOSED) return;
    throw new Error('resume not implemented');
  }

  close(_code = 1000, _reason = '') {
    throw new Error('close not implemented');
  }

  terminate() {
    throw new Error('terminate not implemented');
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this._events.addEventListener(type, listener);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ) {
    this._events.removeEventListener(type, listener);
  }

  dispatchEvent(event: Event): boolean {
    return this._events.dispatchEvent(event);
  }
}

interface WebSocketServerOptions {
  host?: string;
  port?: number;
  urlMatcher?: (url: string) => boolean;
}

export class WebSocketServer extends EventEmitter {
  _options: WebSocketServerOptions;

  constructor(options: WebSocketServerOptions = {}) {
    super();
    if (!options.host) options.host = '0.0.0.0';
    if (!options.port) options.port = location.protocol === 'https:' ? 443 : 80;

    this._options = options;

    this._hookWebSocket();
  }

  address() {
    return {
      family: this._options.host?.indexOf(':') !== -1 ? 'IPv6' : 'IPv4',
      address: this._options.host,
      port: this._options.port,
    };
  }

  _hookWebSocket() {
    const server = this;
    const OriginalWebSocket = window.WebSocket;

    class WebSocketHook extends EventTarget implements WebSocket {
      static CONNECTING: 0 = 0;
      static OPEN: 1 = 1;
      static CLOSING: 2 = 2;
      static CLOSED: 3 = 3;
      CONNECTING: 0 = 0;
      OPEN: 1 = 1;
      CLOSING: 2 = 2;
      CLOSED: 3 = 3;

      readonly bufferedAmount = 0;
      binaryType: BinaryType = 'blob';
      protocol = '';
      readyState = 0;
      url = '';
      extensions = '';
      wsClient: WebSocketClient = null as unknown as WebSocketClient;

      onopen: ((ev: Event) => any) | null = null;
      onmessage: ((ev: MessageEvent) => any) | null = null;
      onerror: ((ev: Event) => any) | null = null;
      onclose: ((ev: CloseEvent) => any) | null = null;

      constructor(
        url: string | URL,
        protocols: string | string[] | undefined = []
      ) {
        super();

        this.url = typeof url === 'string' ? url : url.href;
        let shouldHook = false;

        if (server._options.urlMatcher) {
          shouldHook = server._options.urlMatcher(this.url);
        } else {
          const serverAddress = server.address();
          shouldHook =
            this.url.indexOf(
              `://${serverAddress.address}:${serverAddress.port}`
            ) !== -1;
        }

        if (!shouldHook) {
          return new OriginalWebSocket(url, protocols) as WebSocketHook;
        }

        this.readyState = WebSocketHook.CONNECTING;
        this.protocol =
          typeof protocols === 'string' ? protocols : protocols.join(',');

        this.wsClient = new WebSocketClient(url, protocols);

        this.wsClient.on('open', () => {
          server.emit('connection', this.wsClient);
        });

        this.wsClient.on('send', (data) => {
          const event = new MessageEvent("message", { data })
          this.dispatchEvent(event)
        })

        this.addEventListener('open', (event) => {
          this.onopen?.(event);

          setTimeout(() => {
            this.wsClient.emit('open');
          }, 1);
        });

        this.addEventListener('message', (event) => {
          this.onmessage?.(event as MessageEvent);
        });

        this.addEventListener('close', (event) => {
          this.onclose?.(event as CloseEvent);

          setTimeout(() => {
            this.wsClient.emit('close');
          }, 1);
        });

        this.addEventListener('error', (event) => {
          this.onerror?.(event);

          /*setTimeout(() => {
            this.wsClient.emit('error', event);
          }, 1);*/
        });

        // Simulate WebSocket connection
        setTimeout(() => {
          this.readyState = WebSocketHook.OPEN;
          this.dispatchEvent(new Event('open'));
        }, 100);
      }

      close() {
        if (
          this.readyState === WebSocketHook.CLOSING ||
          this.readyState === WebSocketHook.CLOSED
        ) {
          throw new Error('WebSocket is not open');
        }

        this.readyState = WebSocketHook.CLOSING;
        this.readyState = WebSocketHook.CLOSED;
        this.dispatchEvent(new Event('close'));
      }

      send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.readyState !== WebSocketHook.OPEN) {
          throw new Error('WebSocket is not open');
        }

        if (ArrayBuffer.isView(data)) {
          data = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
        }
        else if (data instanceof ArrayBuffer) {
          data = data.slice(0)
        }

        setTimeout(() => {
          this.wsClient.emit('message', data);
        }, 1);
      }
    }

    window.WebSocket = WebSocketHook;
  }
}
