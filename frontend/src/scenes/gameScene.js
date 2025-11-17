import { GAME_WIDTH, GAME_HEIGHT, ENEMY_ROWS, ENEMY_COLS, SHOOT_COOLDOWN } from '../utils/constants.js';
import { Player } from '../game/player.js';
import { Enemy } from '../game/enemy.js';
import { Bullet } from '../game/bullet.js';

export class GameScene {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.lastShotTime = 0;
    }

    enter(data = {}) {
        this.player = new Player(370, 510);
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.lastShotTime = 0;
        this.createEnemies();
    }

    createEnemies() {
        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                this.enemies.push(new Enemy(80 + col * 80, 80 + row * 60));
            }
        }
    }

    update() {
        if (this.gameOver) return;

        this.updateBullets();
        this.updateEnemyBullets();
        this.checkCollisions();
        this.enemyShooting();
        this.checkGameStatus();
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return !bullet.isOutOfBounds(GAME_HEIGHT);
        });
    }

    updateEnemyBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return !bullet.isOutOfBounds(GAME_HEIGHT);
        });
    }

    enemyShooting() {
    const currentTime = Date.now();

    // Solo permitir 1 disparo global cada 800ms (opcional)
    if (!this.globalEnemyShotTime) this.globalEnemyShotTime = 0;
    if (currentTime - this.globalEnemyShotTime < 300) return;

    // Enemigos vivos
    const aliveEnemies = this.enemies.filter(e => e.alive);

    if (aliveEnemies.length === 0) return;

    // Elegir 1 enemigo aleatorio
    const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

    // Intentar disparar con su cooldown interno
    const bulletData = randomEnemy.shoot(currentTime);

    if (bulletData) {
        this.enemyBullets.push(new Bullet(
            bulletData.x, bulletData.y,
            bulletData.width, bulletData.height,
            bulletData.speed,
            false
        ));

        // Guardar tiempo del disparo global
        this.globalEnemyShotTime = currentTime;
    }
}


    checkCollisions() {
        // Colisiones bala-enemigo
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (enemy.alive && this.checkBulletCollision(bullet, enemy)) {
                    enemy.alive = false;
                    this.bullets.splice(i, 1);
                    this.score += 100;
                    break; // Salir del loop interno
                }
            }
        }

        // Colisiones bala enemiga-jugador
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.checkBulletCollision(bullet, this.player)) {
                this.enemyBullets.splice(i, 1);
                const stillAlive = this.player.takeDamage();
                if (!stillAlive) {
                    this.gameOver = true;
                    this.won = false;
                    // Cambiar a gameover después de un breve delay
                    setTimeout(() => {
                        this.game.changeScene('gameover', {
                            score: this.score,
                            won: this.won
                        });
                    }, 1000);
                }
            }
        }
    }

    checkBulletCollision(bullet, target) {
        return bullet.x < target.x + target.width &&
               bullet.x + bullet.width > target.x &&
               bullet.y < target.y + target.height &&
               bullet.y + bullet.height > target.y;
    }

    checkGameStatus() {
        const aliveEnemies = this.enemies.filter(enemy => enemy.alive).length;
        if (aliveEnemies === 0 && !this.gameOver) {
            this.gameOver = true;
            this.won = true;
            // Cambiar a gameover después de un breve delay
            setTimeout(() => {
                this.game.changeScene('gameover', {
                    score: this.score,
                    won: this.won
                });
            }, 1000);
        }
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Jugador (solo si está vivo)
        if (this.player.isAlive) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
        
        // Enemigos
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });
        
        // Balas del jugador
        this.ctx.fillStyle = '#00ff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Balas enemigas
        this.ctx.fillStyle = '#ff0000';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // UI
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '18px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score.toString().padStart(6, '0')}`, 20, 25);
        this.ctx.fillText(`VIDAS: ${this.player.lives}`, 650, 25);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.game.playerName, 400, 25);

        // Mostrar mensaje de game over si es necesario
        if (this.gameOver) {
            this.ctx.fillStyle = this.won ? '#00ff00' : '#ff0000';
            this.ctx.font = 'bold 32px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.won ? '¡VICTORIA!' : 'GAME OVER', 400, 280);
        }
    }

    handleInput(keys) {
        if (this.gameOver) return;

        if (keys['ArrowLeft'] || keys['a']) {
            this.player.move('left', GAME_WIDTH);
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.player.move('right', GAME_WIDTH);
        }
        if (keys[' ']) {
            this.shoot();
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < SHOOT_COOLDOWN) return;
        
        const bulletData = this.player.shoot();
        this.bullets.push(new Bullet(
            bulletData.x, bulletData.y,
            bulletData.width, bulletData.height,
            bulletData.speed
        ));
        this.lastShotTime = currentTime;
    }

    exit() {
        // No necesitamos hacer nada aquí porque el cambio de escena
        // se maneja en checkCollisions y checkGameStatus
        return null;
    }
}