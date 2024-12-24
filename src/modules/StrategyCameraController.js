export class StrategyCameraController {
    constructor(scene, config = {}) {
        this.scene = scene
        this.camera = scene.cameras.main
        
        // Configuration with default values
        this.config = {
            // Movement speed when using keyboard (pixels per second)
            keyboardSpeed: config.keyboardSpeed || 300,
            // Speed of camera movement when mouse is at screen edge
            edgeSpeed: config.edgeSpeed || 250,
            // Width of the edge boundary for mouse movement (pixels)
            edgeWidth: config.edgeWidth || 20,
            // Zoom constraints
            minZoom: config.minZoom || 0.25,
            maxZoom: config.maxZoom || 2,
            // Zoom speed (percentage per scroll)
            zoomSpeed: config.zoomSpeed || 0.1,
            // World bounds (if null, camera can move anywhere)
            worldBounds: config.worldBounds || null
        };

        // Initialize controls
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasdKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Setup zoom control
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.handleZoom(deltaY);
        });

        // Initialize movement variables
        this.movementVector = new Phaser.Math.Vector2(0, 0);
    }

    handleZoom(deltaY) {
        // Calculate new zoom level
        const newZoom = this.camera.zoom + (deltaY > 0 ? -this.config.zoomSpeed : this.config.zoomSpeed);
        
        // Clamp zoom level to constraints
        this.camera.setZoom(
            Phaser.Math.Clamp(newZoom, this.config.minZoom, this.config.maxZoom)
        );
    }

    checkEdgeScroll(pointer) {
        const width = this.scene.game.config.width
        const height = this.scene.game.config.height
        
        // Reset movement vector
        this.movementVector.set(0, 0)

        if (pointer.x < this.config.edgeWidth) {
            this.movementVector.x = -1
        } else if (pointer.x > width - this.config.edgeWidth) {
            this.movementVector.x = 1
        }

        if (pointer.y < this.config.edgeWidth) {
            this.movementVector.y = -1
        } else if (pointer.y > height - this.config.edgeWidth) {
            this.movementVector.y = 1
        }

        // Normalize the vector if we're moving diagonally
        if (this.movementVector.x !== 0 && this.movementVector.y !== 0) {
            this.movementVector.normalize()
        }
    }

    checkKeyboardInput() {
        // Check arrow keys and WASD
        const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
        const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
        const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
        const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;

        // Update movement vector based on keyboard input
        this.movementVector.x = (right ? 1 : 0) - (left ? 1 : 0);
        this.movementVector.y = (down ? 1 : 0) - (up ? 1 : 0);

        // Normalize the vector if we're moving diagonally
        if (this.movementVector.x !== 0 && this.movementVector.y !== 0) {
            this.movementVector.normalize();
        }
    }

    update(time, delta) {
        // Check for keyboard input

        // Check for edge scrolling if mouse is in game window
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown || pointer.x > 0 && pointer.y > 0 && 
            pointer.x < this.scene.game.config.width && 
            pointer.y < this.scene.game.config.height) {
            this.checkEdgeScroll(pointer);
        }

        this.checkKeyboardInput();

        // Calculate movement this frame
        const moveX = this.movementVector.x * this.config.keyboardSpeed * delta / 1000 / this.camera.zoom
        const moveY = this.movementVector.y * this.config.keyboardSpeed * delta / 1000 / this.camera.zoom

        

        // Move camera
        if (moveX !== 0 || moveY !== 0) {
            const newX = this.camera.scrollX + moveX;
            const newY = this.camera.scrollY + moveY;

            // Apply world bounds if they exist
            if (this.config.worldBounds) {
                const bounds = this.config.worldBounds;
                this.camera.scrollX = Phaser.Math.Clamp(newX, bounds.x, bounds.x + bounds.width);
                this.camera.scrollY = Phaser.Math.Clamp(newY, bounds.y, bounds.y + bounds.height);
            } else {
                this.camera.scrollX = newX;
                this.camera.scrollY = newY;
            }
        }
    }

    // Method to set new world bounds
    setWorldBounds(bounds) {
        this.config.worldBounds = bounds;
    }

    // Method to update movement speed
    setSpeed(keyboardSpeed, edgeSpeed) {
        this.config.keyboardSpeed = keyboardSpeed || this.config.keyboardSpeed;
        this.config.edgeSpeed = edgeSpeed || this.config.edgeSpeed;
    }

    // Method to update zoom constraints
    setZoomLimits(minZoom, maxZoom) {
        this.config.minZoom = minZoom || this.config.minZoom;
        this.config.maxZoom = maxZoom || this.config.maxZoom;
        // Clamp current zoom to new limits
        this.camera.setZoom(
            Phaser.Math.Clamp(this.camera.zoom, this.config.minZoom, this.config.maxZoom)
        );
    }
}