import { getDirectionFromRad } from '../utils'
import IsoSprite from '../plugins/IsometricProjector/IsoSprite'
import Point3 from '../plugins/IsometricProjector/Point3'

export default class UnitV4 extends IsoSprite {
    constructor(scene, x, y, z = 0, angle, unitType = 'goblin_spearman') {
        super(scene, x, y, z, unitType, 0)
        this.scene = scene
        this.debugGraphics = scene.add.graphics()

        this.debug = true


        this.scene.masterGroup.add(this)
        this.scene.isoPhysics.world.enable(this)
        this.body.collideWorldBounds = true
        this.body.bounce.set(0.2, 0.2, 0)
        this.body.setSize(32 ,32 ,32 ,16 ,16 , 0)   
        this.body.offset.x = 26
        this.body.offset.y = 26

        this.scene.iso.systems.displayList.add(this)
        this.scene.iso.systems.updateList.add(this)


        this.unitType = unitType
        this.speed = 40
        this.target = null
        this.angle = angle

        this.play(`${unitType}-${getDirectionFromRad(angle)}-idle`)
    }

    setTarget(target) {
        this.target = this.scene.iso.projector.unproject(target)
        this.target.angle = target.angle
    }

    stop() {
        this.angle = this.target.angle
        this.target = null
        this.body.velocity.x = 0
        this.body.velocity.y = 0
        this.play(`${this.unitType}-${getDirectionFromRad(this.angle)}-idle`, true)
    }

    move() {
        // this.setDepth(this.isoY)

        if (this.target) {
            const distance = this.scene.isoPhysics.distanceBetween(this.body.position, this.target)

            if (distance < 2) {
                this.stop()
            } else {
                const targetAngle = this.scene.isoPhysics.moveToObject(this, this.target, this.speed)
                this.play(`${this.unitType}-${getDirectionFromRad(targetAngle)}-rush`, true)
            }
        } else {
            this.body.velocity.x = 0
            this.body.velocity.y = 0
        }
    }

    update(delta, time) {
        this.move()


        if (this.debug) {
            this.debugGraphics.clear()
   
            this.debugGraphics.lineStyle(1, 0x00ff00)
            this.debugGraphics.fillStyle(0xff0000, 0.2)
            this.debugBody(this.debugGraphics)
            // return
            // this.debugGraphics.clear()

            this.debugGraphics.lineStyle(1, 0x0000ff)
            this.debugGraphics.strokeRect(
                this.x - this.originX * this.width,
                this.y - this.originY * this.height,
                this.width,
                this.height
            )

            this.debugGraphics.fillCircle(
                this.x,
                this.y,
                5
            )

            if(this.body.position && this.target) {
                const start = this.scene.iso.projector.project(this.body.position)
                const end = this.scene.iso.projector.project(this.target)

                this.debugGraphics.lineStyle(1, 0x00ff00)
                this.debugGraphics.strokeLineShape({
                    x1: start.x,
                    y1: start.y,
                    x2: end.x,
                    y2: end.y
                })
            }
            
            // if (this.body) {
            //     this.debugGraphics.lineStyle(1, 0x00ff00)
            //     this.debugGraphics.strokeRect(
            //         this.body.position.x,
            //         this.body.position.y,
            //         this.body.widthX,
            //         this.body.height
            //     )
            // }
            return


            if (this.target) {
                this.debugGraphics.fillStyle(0xff0000)
                this.debugGraphics.fillCircle(this.target.x, this.target.y, 5)
            }

        }
    }


    debugBody(context, filled = false) {
        if (!this.isoBounds) return

        let points = []
        let corners = this.body.getCorners()

        const posX = -this.scene.cameras.main.x
        const posY = -this.scene.cameras.main.y

        if (filled) {
            points = [corners[1], corners[3], corners[2], corners[6], corners[4], corners[5], corners[1]]

            points = points.map( (p) =>  {
                let newPos = this.scene.iso.projector.project(p)
                newPos.x += posX
                newPos.y += posY
                return newPos
            })
            context.beginPath();
            context.moveTo(points[0].x, points[0].y)
            for (const i = 1; i < points.length; i++) {
                context.lineTo(points[i].x, points[i].y)
            }
            context.fillPath()
        } else {
            points = corners.slice(0, corners.length);
            points = points.map( p => {
                var newPos = this.scene.iso.projector.project(p);
                newPos.x += posX;
                newPos.y += posY;
                return newPos;
            });

            context.moveTo(points[0].x, points[0].y);
            context.beginPath();
            // context.strokeStyle = color;

            context.lineTo(points[1].x, points[1].y);
            context.lineTo(points[3].x, points[3].y);
            context.lineTo(points[2].x, points[2].y);
            context.lineTo(points[6].x, points[6].y);
            context.lineTo(points[4].x, points[4].y);
            context.lineTo(points[5].x, points[5].y);
            context.lineTo(points[1].x, points[1].y);
            context.lineTo(points[0].x, points[0].y);
            context.lineTo(points[4].x, points[4].y);
            context.moveTo(points[0].x, points[0].y);
            context.lineTo(points[2].x, points[2].y);
            context.moveTo(points[3].x, points[3].y);
            context.lineTo(points[7].x, points[7].y);
            context.lineTo(points[6].x, points[6].y);
            context.moveTo(points[7].x, points[7].y);
            context.lineTo(points[5].x, points[5].y);
            context.stroke();
            context.closePath()
        }
    }
}