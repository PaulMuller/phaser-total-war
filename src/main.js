import { Boot } from './scenes/Boot'
import { Preloader } from './scenes/Preloader'
import { MainMenu } from './scenes/MainMenu'
import { Game } from './scenes/Game'
import IsoPlugin, { IsoPhysics } from 'phaser3-plugin-isometric'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100vw',
        height: '100vh',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'game-container',
    backgroundColor: '#222255',
    // pixelArt: true,
    // physics: {
        // default: 'arcade',
        // arcade: { 
            // debug: true,
            // debugShowBody: true 
        // }
    // },
    plugins: {
        scene: [
            { key: 'isoPlugin', plugin: IsoPlugin,  mapping: 'iso', start: true },
            { key: 'isoPlugin', plugin: IsoPhysics, mapping: 'isoPhysics', start: true }
        ]
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

window.addEventListener('resize', () => game.scale.refresh())

export default game