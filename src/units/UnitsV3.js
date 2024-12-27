import { getDirectionFromRad } from '../utils'

export class UnitV3 extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, angle, unitType = 'goblin_spearman') {
        super(scene, x, y, unitType, 0)

        scene.masterGroup.add(this)

        this.scene = scene
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)

        this.unitType = unitType
        this.bodyRadius = 3
        this.body.setCircle(
            this.bodyRadius * 2,
            (this.width  - this.bodyRadius * 4) / 2,
            (this.height + this.bodyRadius * 18) / 2
        )
        this.body.pushable = true

        this.play(`${unitType}-${getDirectionFromRad(angle)}-idle`)

        this.speed = 40
        this.body.setSlideFactor(0.25)
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
    }
}