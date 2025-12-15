const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME CONSTANTS ---
const GRAVITY = 0.5;
const PLAYER_JUMP_STRENGTH = -10;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;
const TILE_SIZE = 20;

// --- GAME STATE ---
let score = 0;
let level = 1;
const keys = {};
let bullets = [];
let enemies = [];
let platforms = [];

// --- UTILITY FUNCTIONS ---
function checkCollision(objA, objB) {
    return objA.x < objB.x + objB.width &&
           objA.x + objA.width > objB.x &&
           objA.y < objB.y + objB.height &&
           objA.y + objA.height > objB.y;
}

function updateDisplay() {
    document.getElementById('healthDisplay').textContent = player.health;
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('levelDisplay').textContent = level;
}

// --- CLASS DEFINITIONS (Player, Bullet, Platform, Alien classes remain the same) ---

// 1. Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.color = '#ff0055'; // Main Character Color
        this.velocityX = 0;
        this.velocityY = 0;
        this.isGrounded = false;
        this.health = 100;
        this.facing = 'right';
        this.lastShotTime = 0;
        this.shotDelay = 300; // milliseconds
    }

    update() {
        // Apply Gravity
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Apply Movement
        this.velocityX = 0;
        // Check for 'a'/'ArrowLeft' keys OR 'left' control state
        if (keys['a'] || keys['ArrowLeft'] || keys['control_left']) {
            this.velocityX = -PLAYER_SPEED;
            this.facing = 'left';
        }
        // Check for 'd'/'ArrowRight' keys OR 'right' control state
        if (keys['d'] || keys['ArrowRight'] || keys['control_right']) {
            this.velocityX = PLAYER_SPEED;
            this.facing = 'right';
        }
        this.x += this.velocityX;

        // Check platform collision (Vertical movement)
        this.handlePlatformCollision();

        // Check boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Check death
        if (this.health <= 0) {
            alert("Game Over! Score: " + score);
            // Optionally, reset the game state here
            location.reload();
        }
    }

    handlePlatformCollision() {
        this.isGrounded = false;
        platforms.forEach(p => {
            if (checkCollision(this, p)) {
                // Landed on platform
                if (this.velocityY > 0 && this.y + this.height <= p.y + this.velocityY) {
                    this.y = p.y - this.height;
                    this.velocityY = 0;
                    this.isGrounded = true;
                }
                // Hitting head on platform
                else if (this.velocityY < 0 && this.y >= p.y + p.height) {
                    this.y = p.y + p.height;
                    this.velocityY = 0;
                }
            }
        });

        // Simple Ground Floor Check (If not on a platform)
        if (!this.isGrounded && this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        }
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = PLAYER_JUMP_STRENGTH;
            this.isGrounded = false;
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime > this.shotDelay) {
            const bulletX = this.facing === 'right' ? this.x + this.width : this.x - 5;
            const bulletY = this.y + this.height / 2 - 2;
            const direction = this.facing === 'right' ? 1 : -1;
            bullets.push(new Bullet(bulletX, bulletY, direction));
            this.lastShotTime = currentTime;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        // Body (Simplified character shape)
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Gun representation
        ctx.fillStyle = 'gray';
        if (this.facing === 'right') {
            ctx.fillRect(this.x + this.width, this.y + this.height/2 - 2, 10, 4);
        } else {
            ctx.fillRect(this.x - 10, this.y + this.height/2 - 2, 10, 4);
        }
    }
}

// 2. Bullet Class (No change)
class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 4;
        this.color = 'yellow';
        this.speed = BULLET_SPEED * direction;
        this.isAlive = true;
    }

    update() {
        this.x += this.speed;
        if (this.x < 0 || this.x > canvas.width) {
            this.isAlive = false;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 3. Platform Class (No change)
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#00ff88'; // Platform Color
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 4. Enemy Class (Alien) (No change)
class Alien {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = '#8a2be2'; // Alien Color (Purple)
        this.health = 2;
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            score += 10;
            return true; // Return true if defeated
        }
        return false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add eye/tentacle detail to look like an alien
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 3, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- LEVEL SETUP (No change) ---
function loadLevel(levelNum) {
    bullets = [];
    enemies = [];
    platforms = [];

    // Level 1: Basic Platforms and Static Enemies
    if (levelNum === 1) {
        // Player start position
        player.x = 50;
        player.y = canvas.height - player.height;

        // Platforms (x, y, width, height)
        platforms.push(new Platform(200, 300, 150, 20));
        platforms.push(new Platform(400, 250, 100, 20));
        platforms.push(new Platform(600, 150, 80, 20));

        // Enemies (Spawned on platforms)
        enemies.push(new Alien(250, 300 - 30));
        enemies.push(new Alien(450, 250 - 30));
    }
    // You would add Level 2, 3, 4, 5, 6 logic here...
}

// --- INITIALIZATION ---
const player = new Player(50, canvas.height - 40);
loadLevel(1);

// --- INPUT HANDLER (Keyboard) ---
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') {
        player.jump();
    }
    if (e.key === 'j') {
        player.shoot();
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// --- INPUT HANDLER (Mobile Touch Controls) ---

const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const jumpBtn = document.getElementById('jump-btn');
const shootBtn = document.getElementById('shoot-btn');

// Helper to handle touch/mouse down/up events for movement
function setupMovementButton(element, keyName) {
    // Touch start and Mouse down
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[keyName] = true;
    }, { passive: false });
    element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        keys[keyName] = true;
    });

    // Touch end and Mouse up
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[keyName] = false;
    }, { passive: false });
    element.addEventListener('mouseup', (e) => {
        e.preventDefault();
        keys[keyName] = false;
    });
    // Handle touch moving off the button
    element.addEventListener('touchcancel', (e) => {
        keys[keyName] = false;
    });
}

setupMovementButton(leftBtn, 'control_left');
setupMovementButton(rightBtn, 'control_right');


// Jump and Shoot buttons (Taps/Clicks)
jumpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    player.jump();
});
jumpBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    // Only call jump if it wasn't already triggered by the click/tap (to avoid double jump on some devices)
    // The player.jump() has its own check for isGrounded, so a simple call is fine.
    player.jump