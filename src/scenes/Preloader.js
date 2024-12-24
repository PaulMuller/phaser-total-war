import { Scene } from 'phaser'
import { DIRECTIONS } from '../utils'

export class Preloader extends Scene {
    constructor () {
        super('Preloader')
    }

    init () {
        this.add.image(512, 384, 'background')

        // const graphics = this.add.graphics()
        // graphics.lineStyle(4, 0xff0000, 1)
        // graphics.fillStyle(0x00ff00, 1)
        //  A simple progress bar. This is the outline of the bar.
        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff)
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff)
        this.load.on('progress', progress => bar.width = 4 + (460 * progress) ) 
    }

    preload () {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets')
        this.load.image('logo', 'logo.png')
        // this.load.image('desertTileset', 'tilemaps/desert.png')
        this.load.image('desertTileset', 'tilemaps/desertIso.png')
        this.load.spritesheet('goblin_spearman', 'units/goblin_spearman.png', { frameWidth: 128, frameHeight: 128 })
        this.load.spritesheet('goblin_bowman', 'units/goblin_bowman.png', { frameWidth: 128, frameHeight: 128 })
    }

    

    create () {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        setupAnimations_goblin(this, 'goblin_spearman')
        setupAnimations_goblin(this, 'goblin_bowman')

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu')
    }
}

function setupAnimations_goblin(scene, key) {
    let row = 0
    for (const dir in DIRECTIONS){
        const span = row++ * 48

        scene.anims.create({
            key: key + `-${dir}-idle`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 0, end: span + 3 }),
            frameRate: 4,
            repeat: -1,
            yoyo: true
        })

        scene.anims.create({
            key: key + `-${dir}-jump`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 4, end: span + 11 }),
            frameRate: 8,
            repeat: -1,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-rush`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 12, end: span + 19 }),
            frameRate: 8,
            repeat: -1,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-attack-1`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 20, end: span + 23 }),
            frameRate: 4,
            repeat: -1,
            yoyo: true
        })

        
        scene.anims.create({
            key: key + `-${dir}-attack-2`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 24, end: span + 27 }),
            frameRate: 4,
            repeat: -1,
            yoyo: true
        })

        scene.anims.create({
            key: key + `-${dir}-hit-1`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 28, end: span + 29 }),
            frameRate: 2,
            repeat: -1,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-hit-2`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 30, end: span + 31 }),
            frameRate: 2,
            repeat: -1,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-hit-3`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 32, end: span + 33 }),
            frameRate: 2,
            repeat: -1,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-fall`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 34, end: span + 39 }),
            frameRate: 6,
            repeat: 0,
            yoyo: false
        })

        scene.anims.create({
            key: key + `-${dir}-death`,
            frames:scene.anims.generateFrameNumbers( key, { start: span + 40, end: span + 47 }),
            frameRate: 8,
            repeat: 0,
            yoyo: false
        })
    }
}
