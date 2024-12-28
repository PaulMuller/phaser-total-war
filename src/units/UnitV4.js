import { getDirectionFromRad } from '../utils'
import IsoSprite from '../plugins/IsometricProjector/IsoSprite'

export default class UnitV4 extends IsoSprite{
    constructor(scene, x, y, angle, unitType = 'goblin_spearman') {
        super(scene, x, y, 0, unitType, 0)
        this.scene = scene

        this.scene.masterGroup.add(this)
        this.scene.isoPhysics.world.enable(this)
        this.body.collideWorldBounds = true
        this.body.bounce.set(0.2, 0.2, 0)   

        const pluginKey = this.scene.sys.settings.map.isoPlugin
        this.scene[pluginKey].systems.displayList.add(this)
        this.scene[pluginKey].systems.updateList.add(this)


        this.unitType = unitType
        this.play(`${unitType}-${getDirectionFromRad(angle)}-idle`)

        this.speed = 40
        this.target = null
    }

    setTarget(target){
        this.target = target
    }

    stop() {
        this.target = null
    }

    move() {
        this.setDepth(this.y)

        if(this.target) {
            const angle = Phaser.Math.Angle.Between(
                this.body.center.x, 
                this.body.center.y, 
                this.target.x, 
                this.target.y
            )
    
            const distance = Phaser.Math.Distance.Between(
                this.body.center.x, 
                this.body.center.y, 
                this.target.x, 
                this.target.y
            )
        
            if (distance < 2) {
                this.body.velocity.x = 0
                this.body.velocity.y = 0
                this.play(`${this.unitType}-${getDirectionFromRad(this.target.angle || angle)}-idle`, true)
            }else {
                this.body.velocity.x = Math.cos(angle) * this.speed
                this.body.velocity.y = Math.sin(angle) * this.speed
                this.play(`${this.unitType}-${getDirectionFromRad(angle)}-rush`, true)
            }
        }else {
            this.body.velocity.x = 0
            this.body.velocity.y = 0
        }
    }

    update(delta, time) {
        this.move() 
        console.log(this.body.velocity)
    }
}