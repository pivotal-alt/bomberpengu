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
        proxyUrl: 'ws://pengu.test:1234',
      },
    ],
  });
});
