import { Boot } from './scenes/Boot'
import { Preloader } from './scenes/Preloader'
import { MainMenu } from './scenes/MainMenu'
import { Game } from './scenes/Game'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#222255',
    // pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { 
            // debug: true,
            // debugShowBody: true 
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game
    ]
}
const game = new Phaser.Game(config)


game.canvas.addEventListener('contextmenu', e => e.preventDefault() )

export default game