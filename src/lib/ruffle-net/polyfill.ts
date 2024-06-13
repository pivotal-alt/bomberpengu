const createPlayer = window.RufflePlayer.sources.local.createPlayer
window.RufflePlayer.sources.local.createPlayer = function(...args) {
  const instance = createPlayer(...args)
  
  instance.loadedConfig.socketProxy = [
    {
      host: 'pengu.test',
      port: 1234,
      proxyUrl: location.protocol.replace(/^http(.)?:/, 'ws$1://') + 'pengu.test:1234',
    }
  ]

  return instance
}

/*window.RufflePlayer.config = {
  ...window.RufflePlayer.config,
  socketProxy: [
    ...(window.RufflePlayer.config?.socketProxy ?? []),
    {
      host: 'pengu.test',
      port: 1234,
      proxyUrl: location.protocol.replace(/^http(.)?:/, 'ws$1://') + 'pengu.test:1234',
    },
  ],
}


console.log(window.RufflePlayer)*/