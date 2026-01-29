// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let animationId;

// Game objects
const dino = {
    x: 50,
    y: 150,
    width: 40,
    height: 50,
    velocityY: 0,
    gravity: 0.6,
    jumpPower: -12,
    isJumping: false
};

const obstacles = [];
let obstacleTimer = 0;
const obstacleInterval = 100; // frames between obstacles

// Ground
const ground = {
    y: 200,
    speed: 5
};

// Initialize high score display
document.getElementById('highScore').textContent = highScore;

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('jumpBtn').addEventListener('click', jump);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameOver) {
        resetGame();
    } else {
        jump();
    }
});

function startGame() {
    if (!gameRunning && !gameOver) {
        gameRunning = true;
        document.getElementById('gameOverText').classList.add('hidden');
        gameLoop();
    }
}

function jump() {
    if (gameRunning && !dino.isJumping) {
        dino.velocityY = dino.jumpPower;
        dino.isJumping = true;
    }
}

function createObstacle() {
    const obstacle = {
        x: canvas.width,
        y: ground.y - 40,
        width: 20,
        height: 40
    };
    obstacles.push(obstacle);
}

function updateDino() {
    // Apply gravity
    dino.velocityY += dino.gravity;
    dino.y += dino.velocityY;
    
    // Check if dino landed
    if (dino.y >= ground.y - dino.height) {
        dino.y = ground.y - dino.height;
        dino.velocityY = 0;
        dino.isJumping = false;
    }
}

function updateObstacles() {
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= ground.speed;
        
        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            document.getElementById('score').textContent = score;
        }
    }
    
    // Create new obstacles
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        createObstacle();
        obstacleTimer = 0;
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function drawDino() {
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Dino eye
    ctx.fillStyle = 'white';
    ctx.fillRect(dino.x + 25, dino.y + 10, 8, 8);
    
    // Dino legs
    ctx.fillStyle = '#535353';
    const legAnimation = Math.floor(Date.now() / 100) % 2;
    if (!dino.isJumping) {
        if (legAnimation === 0) {
            ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 10);
            ctx.fillRect(dino.x + 27, dino.y + dino.height, 8, 10);
        } else {
            ctx.fillRect(dino.x + 10, dino.y + dino.height, 8, 10);
            ctx.fillRect(dino.x + 22, dino.y + dino.height, 8, 10);
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = '#535353';
    for (let obstacle of obstacles) {
        // Draw cactus
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Cactus arms
        ctx.fillRect(obstacle.x - 5, obstacle.y + 10, 5, 15);
        ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 15, 5, 15);
    }
}

function drawGround() {
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ground.y);
    ctx.lineTo(canvas.width, ground.y);
    ctx.stroke();
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawGround();
    drawDino();
    drawObstacles();
}

function gameLoop() {
    if (!gameRunning) return;
    
    updateDino();
    updateObstacles();
    
    // Check for collision
    if (checkCollision()) {
        endGame();
        return;
    }
    
    drawGame();
    
    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    document.getElementById('gameOverText').classList.remove('hidden');
    
    // Track game over event for analytics
    if (window.va) {
        window.va('event', {
            name: 'game_over',
            data: {
                score: score,
                high_score: highScore
            }
        });
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    document.getElementById('score').textContent = score;
    obstacles.length = 0;
    obstacleTimer = 0;
    dino.y = ground.y - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
    
    startGame();
}

// Draw initial state
drawGame();
