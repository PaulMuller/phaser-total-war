import Point3 from "./plugins/IsometricProjector/Point3"

export const DIRECTIONS = {
    W: 'W',
    NW: 'NW',
    N: 'N',
    NE: 'NE',
    E: 'E',
    SE: 'SE',
    S: 'S',
    SW: 'SW',
}

export const createObjects = (n) => Array.from({ length: n }, () => (new Object({
    x: 0,
    y: 0
})))

export const createIsoObjects = (n) => Array.from({ length: n }, () => new Point3())

export function drawTriangle(graphics, centerX, centerY, angle, size = 10) {

    angle = angle + Math.PI / 4
    // Calculate the three points from the offset center
    const topX = centerX + Math.cos(angle) * size * 1.5
    const topY = centerY + Math.sin(angle) * size * 0.9

    const point2X = centerX + Math.cos(angle + (2 * Math.PI / 3)) * size/2
    const point2Y = centerY + Math.sin(angle + (2 * Math.PI / 3)) * size/2
    
    const point3X = centerX + Math.cos(angle - (2 * Math.PI / 3)) * size/2
    const point3Y = centerY + Math.sin(angle - (2 * Math.PI / 3)) * size/2

    graphics.beginPath()
    graphics.moveTo(topX, topY)
    graphics.lineTo(point2X, point2Y)
    graphics.lineTo(point3X, point3Y)
    graphics.closePath()
    graphics.fillPath()
}

export function createConstrainedLine(startX, startY, endX, endY, minLength, maxLength = minLength) {
    const {x1, y1, x2, y2} = calculateConstrainedLine(startX, startY, endX, endY, minLength, maxLength)

    return new Phaser.Geom.Line(x1, y1, x2, y2)
}

export function calculateConstrainedLine(startX, startY, endX, endY, minLength, maxLength = minLength) {
    // Calculate current length and angle
    const dx = endX - startX
    const dy = endY - startY
    const currentLength = Math.sqrt(dx * dx + dy * dy)  
    const angle = Math.atan2(dy, dx)

    // Determine final length based on constraints
    let finalLength = currentLength
    if (currentLength < minLength) {
        finalLength = minLength
    } else if (currentLength > maxLength) {
        finalLength = maxLength
    }

    // Calculate new end point
    const newEndX = startX + Math.cos(angle) * finalLength
    const newEndY = startY + Math.sin(angle) * finalLength

    return {x1: startX, y1: startY, x2: newEndX, y2: newEndY}
}

export function modifyLineLength(line, newLength) {
    // Calculate the center of the line
    const centerX = (line.x1 + line.x2) / 2
    const centerY = (line.y1 + line.y2) / 2

    // Calculate the current length of the line
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const currentLength = Math.sqrt(dx * dx + dy * dy)

    // Calculate the shrink factor
    const scale = newLength / currentLength / 2

    // Update the endpoints of the line closer to or farther from the center
    line.x1 = centerX - dx * scale
    line.y1 = centerY - dy * scale
    line.x2 = centerX + dx * scale
    line.y2 = centerY + dy * scale

    return line
}

//8, 14, 2, 1, 10
export function splitLineProportionally(desiredLine, unitCounts, spacing) {
    const result = []

    if (!unitCounts.length) result

    const totalUnits    = unitCounts.reduce((sum, count) => sum + Math.max(count, 2), 0)
    const totalSpacing  = spacing * (unitCounts.length - 1)
    const minimalLength = unitCounts.length * 2 * spacing + totalSpacing
    const maximalLength = totalUnits * spacing + totalSpacing 
    const actualLine    = calculateConstrainedLine(desiredLine.x1, desiredLine.y1, desiredLine.x2, desiredLine.y2, minimalLength + 5, maximalLength + 5)
    
    // Calculate direction vector
    const dx = actualLine.x2 - actualLine.x1
    const dy = actualLine.y2 - actualLine.y1
    const actualLength = Math.sqrt(dx * dx + dy * dy)
    
    // Calculate total length available for lines
    const availableLength = actualLength - totalSpacing
    
    // Calculate unit proportions
    const lengthPerUnitInGroup = availableLength / totalUnits
    const nx = dx / actualLength
    const ny = dy / actualLength
    
    let currentX = actualLine.x1
    let currentY = actualLine.y1
    
    // Create segments
    for (let i = 0; i < unitCounts.length; i++) {
        const segmentLength = Math.max(unitCounts[i], 2) * lengthPerUnitInGroup 
        const endX = currentX + Math.max(segmentLength, spacing*2) * nx
        const endY = currentY + Math.max(segmentLength, spacing*2) * ny
        
        result.push(new Phaser.Geom.Line(currentX, currentY, endX, endY))

        currentX = endX + spacing * nx  
        currentY = endY + spacing * ny
        
    }
    
    return result
}

export function drawDestinationMarker(graphics, target, radius = 5) {
    graphics.fillStyle(0x00ff00, 0.5    )
    drawTriangle(graphics, target.x, target.y, target.angle || Math.PI)
    graphics.fillEllipse(target.x, target.y, 20, 10); // Math.PI/6 is 30 degrees
    // graphics.fillCircle(target.x, target.y, radius * 2)
    graphics.setDepth(0)
}

export const getLineAngle = lineLikeObject => {
    const dy = lineLikeObject.y2 - lineLikeObject.y1
    const dx = lineLikeObject.x2 - lineLikeObject.x1
    return Math.atan2(dy, dx)
}

export function isInsideEllipse(pointerX, pointerY, centerX, centerY, width, height) {
    const dx = pointerX - centerX
    const dy = pointerY - centerY

    return (dx * dx) / (width * width / 4) + (dy * dy) / (height * height / 4) <= 1
}

export function splitIntoChunk(arr, chunk){
    const res = []
    for (let i = 0; i < arr.length; i += chunk) res.push(arr.slice(i, i + chunk))
    return res
}

export function getDirectionFromRad(radians) {
    const directionsArray = ['SE', 'S', 'SW', 'W', 'NW', 'N', 'NE', 'E']
    const segment = (2 * Math.PI) / 8 // Each segment is 45 degrees (π/4 radians)
    
    // Normalize radians to the range [0, 2π)
    const normalizedRad = (radians + 2 * Math.PI) % (2 * Math.PI)

    // Find the corresponding direction index
    const index = Math.floor((normalizedRad + segment / 2) / segment) % 8

    return DIRECTIONS[directionsArray[index]]
}
