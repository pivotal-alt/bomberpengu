declare global {
  interface RufflePlayerComponent extends HTMLElement {
    load: (options: any) => any
  }
  
  interface RufflePlayerInstance {
    createPlayer: () => RufflePlayerComponent
    version: string
  }

  interface RufflePlayerConfig {
    socketProxy?: any[]
  }

  interface RufflePlayer {
    config?: RufflePlayerConfig
    sources: {
      local: RufflePlayerInstance
    }
    newest: () => RufflePlayerInstance
  }

  interface Window {
    RufflePlayer: RufflePlayer
  }
}

export {}
