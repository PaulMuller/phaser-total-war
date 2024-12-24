import { UnitV3 } from '../units/UnitsV3'
import { 
    createObjects, 
    getLineAngle, 
    drawDestinationMarker,
    createConstrainedLine,
    splitIntoChunk,
    modifyLineLength,
    splitLineProportionally
} from '../utils'
import { StrategyCameraController } from '../modules/StrategyCameraController'

const UNIT_NAMES = {
    GOBLIN_SPEARMAN: 'goblin_spearman',
    GOBLIN_BOWMAN:   'goblin_bowman',
}

const unitSpace = 30

export class Game extends Phaser.Scene {
    constructor () {
        super('Game')
    }

    create () {
        this.squads = []
        this.masterGroup = this.physics.add.group()
        this.createWorld()
        
        // this.setupBoxSelection()
        // this.setupFormationPositioning()
        
        this.squads.push(
            this.spawnSquad(10, { x1: 100, y1: 300, x2: 200, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            this.spawnSquad(3,  { x1: 200, y1: 300, x2: 300, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            this.spawnSquad(10, { x1: 300, y1: 300, x2: 400, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            this.spawnSquad(15, { x1: 400, y1: 300, x2: 500, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            this.spawnSquad(1,  { x1: 500, y1: 300, x2: 600, y2: 300 }, UNIT_NAMES.GOBLIN_SPEARMAN),
            this.spawnSquad(10, { x1: 600, y1: 300, x2: 700, y2: 300 }, UNIT_NAMES.GOBLIN_BOWMAN),
        )

        this.setupFormationPositioning()

        this.cameraController = new StrategyCameraController(this, {
            keyboardSpeed: 300,
            edgeSpeed: 250,
            edgeWidth: 20,
            minZoom: 0.25,
            maxZoom: 2,
            zoomSpeed: 0.1,
            worldBounds: null
        });

    }

    spawnSquad(unitCount, line, unitName) {
        const unitsGroup = this.physics.add.group({ runChildUpdate: true })
        this.physics.add.collider(unitsGroup, this.masterGroup)

        const tmpTargets = this.formSquadFormation(undefined, createObjects(unitCount), line)

        for(let i = 0; i < unitCount; i++){ 
            unitsGroup.add( new UnitV3(this, tmpTargets[i].x, tmpTargets[i].y, tmpTargets[i].angle, unitName))
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

            this.formArmyFormation(graphics, selectedSquads, {
                x1: startDragX, 
                y1: startDragY, 
                x2: pointer.worldX, 
                y2: pointer.worldY
            })
        })
    
        this.input.on('pointerup', pointer => {
            if (!isDragging) return
            isDragging = false
            graphics.clear()

            const selectedSquads = this.squads.filter(squad => squad.isSelected)

            const tmpTargets = this.formArmyFormation(graphics, selectedSquads, {
                x1: startDragX, 
                y1: startDragY, 
                x2: pointer.worldX, 
                y2: pointer.worldY
            })

            selectedSquads.forEach( (squad, squadIndex) => {
                squad.getChildren().forEach( (unit, index) =>{
                    unit.setTarget(tmpTargets[squadIndex][index])
                })
            })


        })  
    }

    formArmyFormation(graphics, groups, desiredLine){
        const result = []
        const unitCounts = groups.map(group => group.getChildren().length)
        const squadLines = splitLineProportionally(desiredLine, unitCounts, unitSpace)

        groups.forEach( (group, index) => {
            result.push(this.formSquadFormation(graphics, group, squadLines[index]))
        })

        return result
    }

    formSquadFormation(graphics, group, desiredLine) {   
        // separate creation and marking, dismiss 'isPhysicsGroup', use 'PhysicsGroup' only 
        const isPhysicsGroup = typeof group.getChildren == 'function'
        const unitsCount = isPhysicsGroup ? group.getChildren().length : group.length
        const lineLenght = Phaser.Math.Distance.Between( desiredLine.x1, desiredLine.y1, desiredLine.x2, desiredLine.y2 )

        const unitsInLine = Math.max(Math.ceil(lineLenght / unitSpace) - 1, 2)
        const tmpTargets = createObjects(unitsCount)
        const unitChunks = splitIntoChunk(tmpTargets, unitsInLine)
        
        unitChunks.forEach( (chunkOfUnits, row) => {
            let line = createConstrainedLine( desiredLine.x1, desiredLine.y1, desiredLine.x2, desiredLine.y2, unitSpace * unitsInLine)
            const lineAngle = getLineAngle(line) -  Math.PI / 2
            chunkOfUnits.forEach( target => target.angle = lineAngle)
            
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
        })
        
        if ( isPhysicsGroup ) {
            group.getChildren().forEach( (unit, index) =>{
                drawDestinationMarker(graphics, tmpTargets[index], 5)
            })
        }


        return tmpTargets
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
        this.cameraController.update(time, delta);
    }
}
