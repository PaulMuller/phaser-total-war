export class Minimap {
    constructor(scene, config) {
        this.scene = scene
        
        // Default configuration
        this.config = {
            x: 10,                    // X position of minimap
            y: 10,                    // Y position of minimap
            width: 200,               // Width of minimap
            height: 150,              // Height of minimap
            borderThickness: 2,       // Border thickness
            borderColor: 0xffffff,    // Border color
            backgroundColor: 0x000000, // Background color
            alpha: 0.7,               // Minimap transparency
            zoom: 0.2,                // Minimap zoom level
            ...config                 // Override defaults with provided config
        };

        this.initialize()
    }

    initialize() {
        // Create minimap container
        this.minimapContainer = this.scene.add.container(this.config.x, this.config.y)
        
        // Create background
        this.background = this.scene.add.rectangle(
            0,
            0,
            this.config.width,
            this.config.height,
            this.config.backgroundColor
        )
        this.background.setOrigin(0, 0)
        this.background.setAlpha(this.config.alpha)
        
        // Create border
        this.border = this.scene.add.rectangle(
            0,
            0,
            this.config.width,
            this.config.height,
            this.config.borderColor
        );
        this.border.setOrigin(0, 0)
        this.border.setStrokeStyle(this.config.borderThickness, this.config.borderColor)
        this.border.setFillStyle(undefined, 0)
        
        // Create render texture for the minimap view
        this.renderTexture = this.scene.add.renderTexture(
            0,
            0,
            this.config.width,
            this.config.height
        );
        this.renderTexture.setOrigin(0, 0)
        
        // Add elements to container
        this.minimapContainer.add([this.background, this.renderTexture, this.border])
        
        // Make minimap fixed to camera
        this.minimapContainer.setScrollFactor(0)
    }

    // Add game object to be tracked on minimap
    addObject(gameObject, color = 0x00ff00) {
        const marker = this.scene.add.rectangle( 0, 0, 5, 5, color )
        marker.setOrigin(0.5, 0.5)
        
        // Store reference to original object
        marker.trackedObject = gameObject
        
        this.minimapContainer.add(marker)
        return marker
    }

    // Update minimap object positions
    update() {
        // Clear previous frame
        this.renderTexture.clear()

        this.minimapContainer.list.forEach(obj => {
            if (obj.trackedObject) {
                const worldX = obj.trackedObject.x
                const worldY = obj.trackedObject.y
                
                // Convert world coordinates to minimap coordinates
                obj.x = (worldX * this.config.zoom) + (this.config.width / 2)
                obj.y = (worldY * this.config.zoom) + (this.config.height / 2)
            }
        });
    }

    // Set minimap position
    setPosition(x, y) {
        this.minimapContainer.setPosition(x, y)
    }

    // Show/hide minimap
    setVisible(visible) {
        this.minimapContainer.setVisible(visible)
    }

    // Destroy minimap
    destroy() {
        this.minimapContainer.destroy()
    }
}