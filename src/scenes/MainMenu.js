import { Scene } from 'phaser'

export class MainMenu extends Scene {
    constructor () {
        super('MainMenu')
    }

    create () {
        this.add.text(this.cameras.main.x /2 , this.cameras.main.y / 2, 'Main Menuuuu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5)

        // this.input.once('pointerdown', () => {
            this.scene.start('Game')
            this.scene.launch('HUD')
        // })
    }
}
