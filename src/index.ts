import "./index.css"
import { registerHandler } from "./lib/ws-mock"

registerHandler({
  host: "pengu.test",
  port: 1234,
  onSend(socket, data) {
    console.log("Send:", socket, data)
    setTimeout(() => {
      socket.recv('<msgAll name="foo" msg"="hehe" />\0')
    }, 100)
  },
  onRecv(socket, data) {
    console.log("Recv:", socket, data)
  }
})

window.addEventListener('load', (_event) => {
  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  document.body.appendChild(player);

  player.load({
    url: 'game.swf',
    parameters: {
      surl: 'pengu.test',
      sport: 1234,
      sound: 1,
      user: new URLSearchParams(location.search).get('playerName') ??  `Player${Math.floor(Math.random() * (99999 - 10000 + 1) + 10000)}`,
      hash: '1bf6093ea530924697ca9cebd7bf4abb',
    },
    autoplay: 'on',
    logLevel: new URLSearchParams(location.search).get('logLevel') ?? 'error',
    socketProxy: [
      {
        host: 'pengu.test',
        port: 1234,
        proxyUrl: 'wss://pengu.test:1234',
      },
    ],
  });
});
