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

// --- CLASS DEFINITIONS ---

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
        if (keys['a'] || keys['ArrowLeft']) {
            this.velocityX = -PLAYER_SPEED;
            this.facing = 'left';
        }
        if (keys['d'] || keys['ArrowRight']) {
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

// 2. Bullet Class
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

// 3. Platform Class
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

// 4. Enemy Class (Alien)
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

// --- LEVEL SETUP ---
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

// --- INPUT HANDLER ---
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

// --- MAIN GAME LOOP FUNCTIONS ---

function updateGame() {
    // 1. Update Player
    player.update();

    // 2. Update Bullets and handle Enemy Collision
    bullets.forEach((bullet, bIndex) => {
        bullet.update();
        enemies.forEach((enemy, eIndex) => {
            if (bullet.isAlive && checkCollision(bullet, enemy)) {
                bullet.isAlive = false; // Bullet is destroyed
                if (enemy.takeDamage()) {
                    enemies.splice(eIndex, 1); // Remove defeated enemy
                }
            }
        });
    });
    // Clean up dead bullets
    bullets = bullets.filter(bullet => bullet.isAlive);

    // 3. Enemy-Player Collision (Player takes damage)
    enemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            // Simple damage model: lose health and push back
            player.health -= 1;
            player.x += (player.facing === 'right' ? -10 : 10);
        }
    });

    // 4. Update HUD
    updateDisplay();

    // 5. Level Completion Check (Simple: defeat all enemies)
    if (enemies.length === 0 && level === 1) {
        alert("Level 1 Complete! You beat the protoype!");
        // To build the full game, you would increment 'level' here
        // level++;
        // loadLevel(level);
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#111122'; // Background Color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    platforms.forEach(p => p.draw());

    // Draw Player
    player.draw();

    // Draw Bullets
    bullets.forEach(b => b.draw());

    // Draw Enemies
    enemies.forEach(e => e.draw());
}

// --- GAME LOOP ---
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game!
updateDisplay();
gameLoop();