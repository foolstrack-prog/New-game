// ... (rest of the file remains the same until Player Class)

// 1. Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40; // Wider character
        this.height = 50; // Taller character
        this.color = '#C90000'; // Red Shirt Color
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.health = 100;
        this.facing = 'right';
        this.lastShotTime = 0;
        this.shotDelay = 300; // milliseconds
    }

    // ... (update, handlePlatformCollision, jump, shoot methods remain the same)

    draw() {
        // --- Custom Drawing for the new Main Character ---
        
        // 1. Pants (Lower body - Brown/Khaki color)
        const pantsColor = '#D4AA7A';
        const pantsHeight = this.height * 0.4;
        ctx.fillStyle = pantsColor;
        ctx.fillRect(this.x, this.y + this.height - pantsHeight, this.width, pantsHeight);
        
        // 2. Shirt (Upper body - Red)
        const shirtColor = '#C90000';
        const shirtHeight = this.height * 0.6;
        ctx.fillStyle = shirtColor;
        ctx.fillRect(this.x, this.y, this.width, shirtHeight);

        // 3. Vest (Black/Dark overlay)
        const vestColor = '#1F1F1F';
        ctx.fillStyle = vestColor;
        ctx.fillRect(this.x, this.y, this.width, shirtHeight * 0.6);
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, shirtHeight * 0.8); // V-neck area cutout

        // 4. Head (Skin color - simplified as top block of the shirt rectangle)
        const headWidth = this.width * 0.8;
        const headHeight = this.height * 0.4;
        const headX = this.x + (this.width - headWidth) / 2;
        const headY = this.y - headHeight;
        ctx.fillStyle = '#FFDAB9'; // Peach/Skin tone
        ctx.fillRect(headX, headY, headWidth, headHeight);
        
        // 5. Mustache/Face (Simple dark line for mustache/features)
        ctx.fillStyle = '#000000'; // Black
        ctx.fillRect(headX + 5, headY + headHeight * 0.5, headWidth - 10, 3);

        // 6. Gun (Based on direction)
        ctx.fillStyle = 'gray';
        const gunLength = 15;
        const gunHeight = 4;
        const gunY = this.y + this.height/2 - gunHeight/2;

        if (this.facing === 'right') {
            ctx.fillRect(this.x + this.width, gunY, gunLength, gunHeight);
        } else {
            ctx.fillRect(this.x - gunLength, gunY, gunLength, gunHeight);
        }
    }
}

// ... (rest of the file including Bullet, Platform, Alien classes and game loop)

// --- INITIALIZATION ---
// Adjusting the initial player creation to use the new dimensions
const player = new Player(50, canvas.height - 50); // canvas.height - New Player Height (50)
loadLevel(1);

// ... (rest of the file remains the same)