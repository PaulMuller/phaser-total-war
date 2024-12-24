import { Scene } from 'phaser'


//load assets for actual preloader
export class Boot extends Scene {
    constructor () {
        super('Boot')
    }

    preload () {
        this.load.image('background', 'assets/bg.png')
    }

    create () {
        this.scene.start('Preloader')
    }
}
