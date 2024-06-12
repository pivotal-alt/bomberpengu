declare global {
  interface RufflePlayerComponent extends HTMLElement {
    load: (options: any) => any
  }
  
  interface RufflePlayerInstance {
    createPlayer: () => RufflePlayerComponent
  }

  interface RufflePlayer {
    newest: () => RufflePlayerInstance
  }

  interface Window {
    RufflePlayer: RufflePlayer
  }
}

export {}
