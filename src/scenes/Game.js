import UnitV4 from '../units/UnitV4'
import { 
    createObjects, 
    createIsoObjects,
    getLineAngle, 
    drawDestinationMarker,
    createConstrainedLine,
    splitIntoChunk,
    modifyLineLength,
    splitLineProportionally
} from '../utils'
import { StrategyCameraController } from '../modules/StrategyCameraController'
import { Minimap } from '../modules/Minimap'
import IsoPlugin, { IsoPhysics } from '../plugins/IsometricProjector/IsoPlugin'

const UNIT_NAMES = {
    GOBLIN_SPEARMAN: 'goblin_spearman',
    GOBLIN_BOWMAN:   'goblin_bowman',
}

const unitSpace = 30

export class Game extends Phaser.Scene {
    constructor () {
        const sceneConfig = {
            key: 'Game',
            mapAdd: { isoPlugin: 'iso', isoPhysics: 'isoPhysics' }
        }
      
        super(sceneConfig)
    }

    preload() {
        this.load.scenePlugin({ key: 'IsoPlugin', url: IsoPlugin, sceneKey: 'iso' })
        this.load.scenePlugin({ key: 'IsoPhysics', url: IsoPhysics, sceneKey: 'isoPhysics' })
    }

    create () {
        this.squads = []
        this.masterGroup = this.add.group()

        this.isoPhysics.world.gravity.setTo(0, 0, 0)
        this.iso.projector.origin.setTo(0.5, 0.5)
        
        this.createWorld()
        this.minimap = new Minimap(this)
        
        // this.setupBoxSelection()
        this.setupFormationPositioning()

        this.squads.push(
            this.spawnSquad(1, { x1: 100, y1: 300, x2: 200, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            // this.spawnSquad(19, { x1: 600, y1: 300, x2: 700, y2: 300 }, UNIT_NAMES.GOBLIN_BOWMAN),
        )

        // const mapMainLayer = this.map.getLayer('floor')
        this.cameraController = new StrategyCameraController(this, {
            keyboardSpeed: 300,
            edgeSpeed: 250,
            edgeWidth: 20,
            minZoom: 0.25,
            maxZoom: 2,
            zoomSpeed: 0.1,
            worldBounds:null
        })

    }

    spawnSquad(unitCount, line, unitName) {
        const unitsGroup = this.add.group({runChildUpdate: true})
        const tmpTargets = this.formSquadFormation(unitCount, line)

        for(let i = 0; i < unitCount; i++){ 
            const unit = new UnitV4(this, tmpTargets[i].x, tmpTargets[i].y, 0, tmpTargets[i].angle, unitName)
            unitsGroup.add(unit)
            this.minimap.addObject(unit, 0x00ff00)
        }

        unitsGroup.isSelected = true

        return unitsGroup
    }

    setupBoxSelection() {
        let isDragging = false
        let startDragX = null
        let startDragY = null

        const selectionBox = this.add.graphics()

        this.input.on('pointerdown', pointer => {
            isDragging = true
            startDragX = Math.ceil(pointer.worldX)
            startDragY = Math.ceil(pointer.worldY)
        })  
    
        this.input.on('pointermove', pointer => {
            if (!isDragging) return

            selectionBox.clear()
            selectionBox.lineStyle(2, 0x00ff00, 1)
            selectionBox.strokeRect(startDragX, startDragY, pointer.worldX - startDragX, pointer.worldY - startDragY)    
        })
    
        this.input.on('pointerup', pointer => {
            isDragging = false
            selectionBox.clear()

            const selectionArea = new Phaser.Geom.Rectangle(startDragX, startDragY, pointer.worldX - startDragX, pointer.worldY - startDragY)
            
            // BasicUnit.units.forEach( unit => {
            //     Phaser.Geom.Rectangle.Contains(selectionArea, unit.x, unit.y) ? unit.select() : void(0)
            // })

            // selectionArea.destroy()
        })
    }

    setupFormationPositioning() {
        let isDragging = false
        let startDragX = null
        let startDragY = null

        const graphics = this.add.graphics()

        this.input.on('pointerdown', pointer => {
            isDragging = true
            startDragX = Math.ceil(pointer.worldX)
            startDragY = Math.ceil(pointer.worldY)
        })  
    
        this.input.on('pointermove', pointer => {
            if (!isDragging) return
            graphics.clear()

            const selectedSquads = this.squads.filter(squad => squad.isSelected)

            const isoStartDrag    = this.iso.projector.unproject({x: startDragX, y: startDragY})
            const isoPointerWorld = this.iso.projector.unproject({x:  pointer.worldX, y: pointer.worldY})

            const tmpTargets = this.formArmyFormation(selectedSquads, {
                x1: isoStartDrag.x, 
                y1: isoStartDrag.y, 
                x2: isoPointerWorld.x, 
                y2: isoPointerWorld.y
            })

            selectedSquads.forEach( (squad, squadIndex) => {
                squad.getChildren().forEach( (unit, index) =>{
                    const target = tmpTargets[squadIndex][index]
                    drawDestinationMarker(graphics, target, 5)
                })
            })
        })
    
        this.input.on('pointerup', pointer => {
            if (!isDragging) return
            isDragging = false
            graphics.clear()

            const selectedSquads = this.squads.filter(squad => squad.isSelected)

            const isoStartDrag    = this.iso.projector.unproject({x: startDragX, y: startDragY})
            const isoPointerWorld = this.iso.projector.unproject({x:  pointer.worldX, y: pointer.worldY})

            const tmpTargets = this.formArmyFormation(selectedSquads, {
                x1: isoStartDrag.x, 
                y1: isoStartDrag.y, 
                x2: isoPointerWorld.x, 
                y2: isoPointerWorld.y
            })

            selectedSquads.forEach( (squad, squadIndex) => {
                squad.getChildren().forEach( (unit, index) =>{
                    const target = tmpTargets[squadIndex][index]
                    unit.setTarget(target)
                    drawDestinationMarker(graphics, target, 5)
                })
            })
        })  
    }

    formArmyFormation(groups, desiredLine){
        const result = []
        const unitCounts = groups.map(group => group.getChildren().length)
        const squadLines = splitLineProportionally(desiredLine, unitCounts, unitSpace)

        groups.forEach( (group, index) => {
            result.push(this.formSquadFormation(group.getChildren().length, squadLines[index]))
        })

        return result
    }

    formSquadFormation(count, desiredLine) {   
        const lineLenght = Phaser.Math.Distance.Between( desiredLine.x1, desiredLine.y1, desiredLine.x2, desiredLine.y2 )
        const unitsInLine = Math.max(Math.ceil(lineLenght / unitSpace) - 1, 2)
        const tmpTargets = createObjects(count)
        const unitChunks = splitIntoChunk(tmpTargets, unitsInLine)
        const resultTargets = []

        unitChunks.forEach( (chunkOfUnits, row) => {
            let line = createConstrainedLine( desiredLine.x1, desiredLine.y1, desiredLine.x2, desiredLine.y2, unitSpace * unitsInLine)
            const lineAngle = getLineAngle(line) - Math.PI / 2
            const offsetX = Math.cos(lineAngle - Math.PI) * unitSpace * row
            const offsetY = Math.sin(lineAngle - Math.PI) * unitSpace * row

            if (chunkOfUnits.length < unitsInLine) modifyLineLength(line, unitSpace * chunkOfUnits.length)

            const parallelLine = new Phaser.Geom.Line(
                line.x1 + offsetX,
                line.y1 + offsetY,
                line.x2 + offsetX,
                line.y2 + offsetY
            )

            Phaser.Actions.PlaceOnLine(chunkOfUnits, parallelLine)
            chunkOfUnits.forEach( unit => {
                const isoPoint = this.iso.projector.projectXY(unit)
                unit.x = isoPoint.x
                unit.y = isoPoint.y
            })
            chunkOfUnits.forEach( unit => unit.angle = lineAngle)
            resultTargets.push(...chunkOfUnits)
        })

        return resultTargets
    }

    createWorld() {
        const mapData = new Phaser.Tilemaps.MapData({
            width: 64,
            height: 64,
            tileWidth: 64,
            tileHeight: 32,
            orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
        });

        this.map = new Phaser.Tilemaps.Tilemap(this, mapData);

        const tiles = this.map.addTilesetImage('desertTileset', 'desertTileset', 64, 40, 0, 0, 0)
        const floorLayer = this.map.createBlankLayer('floor', tiles)

        floorLayer.randomize(0, 0,  this.map.width,  this.map.height, [ 
            2,3,4
        ])
    }

    update(time, delta){
        this.cameraController.update(time, delta)
        this.minimap.update(time, delta)
        this.isoPhysics.world.collide(this.masterGroup)
    }
}
