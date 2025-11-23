// test/gameScene.full.test.js
import { expect } from 'chai';
import { GameScene } from '../src/scenes/gameScene.js';
import { Bullet } from '../src/game/bullet.js';

describe('GameScene - Full Coverage', () => {
    let scene;
    let mockGame;
    let mockCtx;
    let changeSceneCalled;
    let changeSceneData;

    beforeEach(() => {
        changeSceneCalled = false;
        changeSceneData = null;

        mockCtx = {
            fillStyle: '',
            font: '',
            textAlign: '',
            fillText: () => {},
            fillRect: () => {}
        };

        mockGame = {
            ctx: mockCtx,
            playerName: 'TEST_PLAYER',
            changeScene: (scene, data) => {
                changeSceneCalled = true;
                changeSceneData = data;
            }
        };

        scene = new GameScene(mockGame);
    });

    describe('Lines 41-48: enter() with data parameter', () => {
        it('should accept and ignore data parameter', () => {
            const testData = { previousScore: 1000 };
            scene.enter(testData);
            
            expect(scene.player).to.not.be.null;
            expect(scene.score).to.equal(0); // Score se resetea
        });

        it('should reset all game state on enter', () => {
            scene.score = 5000;
            scene.gameOver = true;
            scene.won = true;
            scene.lastShotTime = 12345;
            
            scene.enter();
            
            expect(scene.score).to.equal(0);
            expect(scene.gameOver).to.be.false;
            expect(scene.won).to.be.false;
            expect(scene.lastShotTime).to.equal(0);
        });
    });

    describe('Lines 140-152: checkCollisions - reverse loop coverage', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should handle multiple bullets hitting same enemy', () => {
            const enemy = scene.enemies[0];
            
            // Agregar dos balas en la misma posición
            scene.bullets.push(new Bullet(enemy.x, enemy.y, 6, 15, 10, true));
            scene.bullets.push(new Bullet(enemy.x + 5, enemy.y, 6, 15, 10, true));
            
            scene.checkCollisions();
            
            expect(enemy.alive).to.be.false;
            // Una o ambas balas se eliminan
            expect(scene.bullets.length).to.be.lessThan(2);
        });

        it('should handle bullets at edge of enemy hitbox', () => {
            const enemy = scene.enemies[0];
            
            // Bala justo en el borde derecho del enemigo
            scene.bullets.push(new Bullet(
                enemy.x + enemy.width - 1,
                enemy.y,
                6, 15, 10, true
            ));
            
            scene.checkCollisions();
            
            expect(enemy.alive).to.be.false;
        });

        it('should process all bullets in reverse order', () => {
            const enemiesHit = [];
            
            // Agregar varias balas para diferentes enemigos
            for (let i = 0; i < 3; i++) {
                const enemy = scene.enemies[i];
                scene.bullets.push(new Bullet(
                    enemy.x + 10,
                    enemy.y + 10,
                    6, 15, 10, true
                ));
            }
            
            scene.checkCollisions();
            
            // Contar enemigos muertos
            const deadEnemies = scene.enemies.filter(e => !e.alive).length;
            expect(deadEnemies).to.be.at.least(3);
        });

        it('should handle collision detection with offset bullets', () => {
            const enemy = scene.enemies[5];
            
            // Bala con offset pero dentro del hitbox
            scene.bullets.push(new Bullet(
                enemy.x + 15,
                enemy.y + 10,
                6, 15, 10, true
            ));
            
            scene.checkCollisions();
            
            expect(enemy.alive).to.be.false;
        });
    });

    describe('Lines 176, 182: Player collision and death', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should handle player taking damage but surviving', () => {
            scene.player.lives = 2;
            
            scene.enemyBullets.push(new Bullet(
                scene.player.x + 20,
                scene.player.y + 10,
                6, 15, 5, false
            ));
            
            scene.checkCollisions();
            
            expect(scene.player.lives).to.equal(1);
            expect(scene.gameOver).to.be.false;
        });

        it('should trigger game over when player loses last life', (done) => {
            scene.player.lives = 1;
            
            scene.enemyBullets.push(new Bullet(
                scene.player.x + 20,
                scene.player.y + 10,
                6, 15, 5, false
            ));
            
            scene.checkCollisions();
            
            expect(scene.gameOver).to.be.true;
            expect(scene.won).to.be.false;
            
            // Verificar que se llama changeScene después del timeout
            setTimeout(() => {
                expect(changeSceneCalled).to.be.true;
                expect(changeSceneData.won).to.be.false;
                done();
            }, 1100);
        });

        it('should pass correct data to gameover scene on loss', (done) => {
            scene.player.lives = 1;
            scene.score = 3500;
            
            scene.enemyBullets.push(new Bullet(
                scene.player.x,
                scene.player.y,
                6, 15, 5, false
            ));
            
            scene.checkCollisions();
            
            setTimeout(() => {
                expect(changeSceneData.score).to.equal(3500);
                expect(changeSceneData.won).to.be.false;
                done();
            }, 1100);
        });
    });

    describe('Lines 213-214, 218-228: Victory condition and scene change', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should trigger victory when all enemies defeated', (done) => {
            // Matar a todos los enemigos
            scene.enemies.forEach(enemy => enemy.alive = false);
            
            scene.checkGameStatus();
            
            expect(scene.gameOver).to.be.true;
            expect(scene.won).to.be.true;
            
            // Verificar que se llama changeScene después del timeout
            setTimeout(() => {
                expect(changeSceneCalled).to.be.true;
                expect(changeSceneData.won).to.be.true;
                done();
            }, 1100);
        });

        it('should pass correct score on victory', (done) => {
            scene.score = 10000;
            scene.enemies.forEach(enemy => enemy.alive = false);
            
            scene.checkGameStatus();
            
            setTimeout(() => {
                expect(changeSceneData.score).to.equal(10000);
                expect(changeSceneData.won).to.be.true;
                done();
            }, 1100);
        });

        it('should not trigger victory if enemies still alive', () => {
            scene.enemies[0].alive = true; // Dejar un enemigo vivo
            scene.enemies.slice(1).forEach(e => e.alive = false);
            
            scene.checkGameStatus();
            
            expect(scene.gameOver).to.be.false;
            expect(scene.won).to.be.false;
        });

        it('should only trigger victory once', (done) => {
            scene.enemies.forEach(enemy => enemy.alive = false);
            
            scene.checkGameStatus();
            const firstGameOver = scene.gameOver;
            
            // Intentar triggear de nuevo
            scene.checkGameStatus();
            
            expect(scene.gameOver).to.equal(firstGameOver);
            
            setTimeout(() => {
                done();
            }, 1100);
        });
    });

    describe('Edge cases and boundary conditions', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should handle empty bullet arrays', () => {
            scene.bullets = [];
            scene.enemyBullets = [];
            
            expect(() => scene.checkCollisions()).to.not.throw();
        });

        it('should handle all enemies dead from start', (done) => {
            scene.enemies = [];
            
            scene.checkGameStatus();
            
            expect(scene.gameOver).to.be.true;
            
            setTimeout(() => {
                done();
            }, 1100);
        });

        it('should handle player collision at exact boundary', () => {
            scene.player.x = 100;
            scene.player.y = 510;
            
            scene.enemyBullets.push(new Bullet(
                scene.player.x,
                scene.player.y,
                6, 15, 5, false
            ));
            
            const initialLives = scene.player.lives;
            scene.checkCollisions();
            
            expect(scene.player.lives).to.equal(initialLives - 1);
        });

        it('should handle rapid enemy deaths', () => {
            const initialScore = scene.score;
            
            // Crear balas para matar varios enemigos
            for (let i = 0; i < 5; i++) {
                scene.bullets.push(new Bullet(
                    scene.enemies[i].x + 10,
                    scene.enemies[i].y + 10,
                    6, 15, 10, true
                ));
            }
            
            scene.checkCollisions();
            
            expect(scene.score).to.be.greaterThan(initialScore);
        });

        it('should handle simultaneous player hit and enemy kill', () => {
            const enemy = scene.enemies[0];
            const initialLives = scene.player.lives;
            
            // Bala del jugador mata enemigo
            scene.bullets.push(new Bullet(
                enemy.x + 10,
                enemy.y + 10,
                6, 15, 10, true
            ));
            
            // Bala enemiga golpea jugador
            scene.enemyBullets.push(new Bullet(
                scene.player.x + 20,
                scene.player.y + 10,
                6, 15, 5, false
            ));
            
            scene.checkCollisions();
            
            expect(enemy.alive).to.be.false;
            expect(scene.player.lives).to.equal(initialLives - 1);
        });
    });

    describe('Update and draw integration', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should not update when game over', () => {
            scene.gameOver = true;
            const bulletsBefore = scene.bullets.length;
            
            scene.update();
            
            expect(scene.bullets.length).to.equal(bulletsBefore);
        });

        it('should update all systems when game active', () => {
            scene.gameOver = false;
            
            scene.bullets.push(new Bullet(100, 100, 6, 15, 10, true));
            const initialY = scene.bullets[0].y;
            
            scene.update();
            
            // La bala debe haberse movido
            expect(scene.bullets[0].y).to.not.equal(initialY);
        });

        it('should draw different colors for victory vs defeat', () => {
            let victoryColor, defeatColor;
            
            // Victoria
            scene.gameOver = true;
            scene.won = true;
            mockCtx.fillText = function(text) {
                if (text === '¡VICTORIA!') {
                    victoryColor = this.fillStyle;
                }
            };
            scene.draw();
            
            // Derrota
            scene.won = false;
            mockCtx.fillText = function(text) {
                if (text === 'GAME OVER') {
                    defeatColor = this.fillStyle;
                }
            };
            scene.draw();
            
            expect(victoryColor).to.not.equal(defeatColor);
        });
    });

    describe('Comprehensive scenario tests', () => {
        beforeEach(() => {
            scene.enter();
        });

        it('should handle complete game win scenario', (done) => {
            // Simular victoria completa
            scene.enemies.forEach((enemy, i) => {
                if (i < scene.enemies.length - 1) {
                    enemy.alive = false;
                }
            });
            
            // Matar último enemigo
            const lastEnemy = scene.enemies[scene.enemies.length - 1];
            scene.bullets.push(new Bullet(
                lastEnemy.x + 10,
                lastEnemy.y + 10,
                6, 15, 10, true
            ));
            
            scene.checkCollisions();
            scene.checkGameStatus();
            
            expect(scene.gameOver).to.be.true;
            expect(scene.won).to.be.true;
            
            setTimeout(() => {
                expect(changeSceneCalled).to.be.true;
                done();
            }, 1100);
        });

        it('should handle complete game loss scenario', (done) => {
            // Simular derrota completa
            scene.player.lives = 1;
            
            // Bala enemiga mata al jugador
            scene.enemyBullets.push(new Bullet(
                scene.player.x + 25,
                scene.player.y + 12,
                6, 15, 5, false
            ));
            
            scene.checkCollisions();
            
            expect(scene.gameOver).to.be.true;
            expect(scene.won).to.be.false;
            expect(scene.player.isAlive).to.be.false;
            
            setTimeout(() => {
                expect(changeSceneCalled).to.be.true;
                expect(changeSceneData.won).to.be.false;
                done();
            }, 1100);
        });
    });
});