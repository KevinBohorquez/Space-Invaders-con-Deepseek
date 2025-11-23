// NÚCLEO PRINCIPAL DEL JUEGO - Canvas 2D
import { Enemy } from './enemy.js';

class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.debug = document.getElementById('debug');
        this.nameInput = document.getElementById('name-input');
        this.playerNameInput = document.getElementById('player-name');
        
        this.currentScene = 'start';
        this.playerName = 'JUGADOR';
        this.score = 0;
        this.lives = 3;
        this.playerX = 370;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.gameOver = false;
        this.won = false;
        this.scoreSubmitted = false;
        
        this.keys = {};
        this.lastEnemyShotTime = 0; // Control global para disparos enemigos
        this.enemyShotCooldown = 1000; // 1 segundo entre disparos enemigos
        this.init();
    }
    
    init() {
        console.log("Inicializando Space Invaders...");
        this.setupEventListeners();
        this.showNameInput();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleGlobalKeys(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Click en el canvas
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    }
    
    handleGlobalKeys(e) {
        // Teclas globales que funcionan en cualquier escena
        switch(e.key) {
            case 'Escape':
                if (this.currentScene === 'game') {
                    this.changeScene('start');
                }
                break;
            case 'Enter':
                if (this.currentScene === 'start') {
                    this.showLeaderboard();
                } else if (this.currentScene === 'gameover' || this.currentScene === 'leaderboard') {
                    this.changeScene('start');
                }
                break;
        }
    }
    
    showNameInput() {
        this.nameInput.style.display = 'block';
        this.playerNameInput.focus();
        this.playerNameInput.value = '';
    }
    
    hideNameInput() {
        this.nameInput.style.display = 'none';
    }
    
    startGame() {
        this.playerName = this.playerNameInput.value.trim() || 'JUGADOR';
        if (this.playerName.length > 15) {
            this.playerName = this.playerName.substring(0, 15);
        }
        this.hideNameInput();
        this.changeScene('game');
    }
    
    showLeaderboard() {
        this.hideNameInput();
        this.changeScene('leaderboard');
    }
    
    changeScene(newScene) {
        this.currentScene = newScene;
        
        // Reiniciar estado del juego si vamos a jugar
        if (newScene === 'game') {
            this.resetGame();
        }
        
        // Limpiar arrays
        if (newScene !== 'game') {
            this.bullets = [];
            this.enemyBullets = [];
        }
        
        console.log(`Cambiando a escena: ${newScene}`);
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.playerX = 370;
        this.gameOver = false;
        this.won = false;
        this.scoreSubmitted = false;
        this.bullets = [];
        this.enemyBullets = [];
        this.lastEnemyShotTime = 0;
        this.createEnemies();
    }
    
    createEnemies() {
        this.enemies = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                this.enemies.push(new Enemy(80 + col * 80, 100 + row * 60));
            }
        }
    }
    
    updateGame() {
        if (this.currentScene !== 'game' || this.gameOver) return;
        
        this.handleInput();
        this.updateBullets();
        this.updateEnemyBullets();
        this.checkCollisions();
        this.enemyShooting();
        this.checkGameStatus();
    }
    
    handleInput(keys) {
    if (this.gameOver) return;

    // Movimiento fluido mientras disparamos
    const movingLeft = keys['ArrowLeft'] || keys['a'];
    const movingRight = keys['ArrowRight'] || keys['d'];

    if (movingLeft) {
        this.player.move('left', GAME_WIDTH);
    } else if (movingRight) {
        this.player.move('right', GAME_WIDTH);
    }

    // Disparo independiente del movimiento
    if (keys[' '] || keys['Space']) {
        this.shoot();
    }
}

    
    shoot() {
        // Control de tasa de disparo
        if (this.lastShot && Date.now() - this.lastShot < 300) return;
        
        this.bullets.push({
            x: this.playerX + 27,
            y: 545,
            width: 6,
            height: 15
        });
        this.lastShot = Date.now();
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= 10;
            return bullet.y > 0;
        });
    }
    
    updateEnemyBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += 8;
            return bullet.y < 600;
        });
    }
    
    enemyShooting() {
        const currentTime = Date.now();
        
        // Control global: solo un enemigo puede disparar cada cierto tiempo
        if (currentTime - this.lastEnemyShotTime < this.enemyShotCooldown) {
            return;
        }
        
        // Obtener enemigos vivos
        const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length === 0) return;
        
        // Elegir un enemigo aleatorio para disparar
        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        
        // Usar el método shoot de la clase Enemy
        const bullet = randomEnemy.shoot(currentTime);
        if (bullet) {
            this.enemyBullets.push(bullet);
            this.lastEnemyShotTime = currentTime;
        }
    }
    
    checkCollisions() {
        // Colisiones bala-enemigo
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive && 
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    enemy.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 100;
                }
            });
        });
        
        // Colisiones bala enemiga-jugador
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < this.playerX + 60 &&
                bullet.x + bullet.width > this.playerX &&
                bullet.y < 575 &&
                bullet.y + bullet.height > 550) {
                
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
            }
        });
    }
    
    checkGameStatus() {
        // Verificar victoria
        const aliveEnemies = this.enemies.filter(e => e.alive).length;
        if (aliveEnemies === 0 && !this.gameOver) {
            this.gameOver = true;
            this.won = true;
            this.submitScore();
            setTimeout(() => {
                this.changeScene('gameover');
            }, 1000);
        }
        
        // Verificar derrota
        if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.won = false;
            this.submitScore();
            setTimeout(() => {
                this.changeScene('gameover');
            }, 1000);
        }
    }
    
    async submitScore() {
        if (this.scoreSubmitted) return;
        
        try {
            await submitScore(this.playerName, this.score);
            this.scoreSubmitted = true;
            console.log('Puntaje enviado correctamente');
        } catch (error) {
            console.error('Error enviando puntaje:', error);
        }
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.currentScene === 'start') {
            // Click en botones del menú principal
            if (y > 300 && y < 350) {
                this.showNameInput();
            } else if (y > 370 && y < 420) {
                this.showLeaderboard();
            }
        } else if (this.currentScene === 'gameover' || this.currentScene === 'leaderboard') {
            this.changeScene('start');
        }
    }
    
    gameLoop() {
        this.updateGame();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Dibujar escena actual
        switch(this.currentScene) {
            case 'start':
                this.drawStartScene();
                break;
            case 'game':
                this.drawGameScene();
                break;
            case 'gameover':
                this.drawGameOverScene();
                break;
            case 'leaderboard':
                this.drawLeaderboardScene();
                break;
        }
        
        // Actualizar debug
        this.updateDebugInfo();
    }
    
    updateDebugInfo() {
        const sceneNames = {
            'start': 'MENÚ PRINCIPAL',
            'game': 'JUEGO ACTIVO',
            'gameover': 'GAME OVER',
            'leaderboard': 'RANKING'
        };
        
        let debugText = `ESCENA: ${sceneNames[this.currentScene]}`;
        
        if (this.currentScene === 'game') {
            debugText += ` | SCORE: ${this.score} | VIDAS: ${this.lives}`;
        } else if (this.currentScene === 'gameover') {
            debugText += this.won ? ' - VICTORIA!' : ' - DERROTA';
        }
        
        this.debug.innerHTML = debugText;
    }

    // Métodos de dibujo (drawStartScene, drawGameScene, etc.)...
    // ... (mantén los mismos métodos de dibujo que ya tenías)
}

// Inicializar el juego cuando se carga la página
window.startGame = function() {
    game.startGame();
};

window.showLeaderboard = function() {
    game.showLeaderboard();
};

// Permitir enviar el formulario con Enter
document.getElementById('player-name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        startGame();
    }
});

// Iniciar el juego
const game = new SpaceInvadersGame();