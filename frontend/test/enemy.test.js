import { expect } from 'chai';
import { Enemy } from '../src/game/enemy.js';

describe('Enemy', () => {
    let enemy;

    beforeEach(() => {
        enemy = new Enemy(100, 100);
    });

    describe('Constructor', () => {
        it('should initialize with correct position', () => {
            expect(enemy.x).to.equal(100);
            expect(enemy.y).to.equal(100);
        });

        it('should initialize with correct dimensions', () => {
            expect(enemy.width).to.equal(40);
            expect(enemy.height).to.equal(25);
        });

        it('should start alive', () => {
            expect(enemy.alive).to.be.true;
        });

        it('should have shot cooldown of 2000ms', () => {
            expect(enemy.shotCooldown).to.equal(2000);
        });

        it('should initialize lastShotTime to 0', () => {
            expect(enemy.lastShotTime).to.equal(0);
        });
    });

    describe('shoot()', () => {
        it('should return bullet data on first shot', () => {
            const bullet = enemy.shoot(Date.now());
            expect(bullet).to.be.an('object');
        });

        it('should return null if cooldown has not passed', () => {
            const currentTime = Date.now();
            enemy.shoot(currentTime);
            const secondShot = enemy.shoot(currentTime + 1000); // Solo 1 segundo después
            expect(secondShot).to.be.null;
        });

        it('should allow shooting after cooldown period', () => {
            const currentTime = Date.now();
            enemy.shoot(currentTime);
            const secondShot = enemy.shoot(currentTime + 2100);
            expect(secondShot).to.not.be.null;
        });

        it('should return centered bullet x position', () => {
            const bullet = enemy.shoot(Date.now());
            const expectedX = enemy.x + enemy.width / 2 - 3;
            expect(bullet.x).to.equal(expectedX);
        });

        it('should return bullet y position below enemy', () => {
            const bullet = enemy.shoot(Date.now());
            expect(bullet.y).to.equal(enemy.y + enemy.height);
        });

        it('should return bullet with correct dimensions', () => {
            const bullet = enemy.shoot(Date.now());
            expect(bullet.width).to.equal(6);
            expect(bullet.height).to.equal(15);
        });

        it('should return bullet with correct speed', () => {
            const bullet = enemy.shoot(Date.now());
            expect(bullet.speed).to.equal(5);
        });

        it('should update lastShotTime when shooting', () => {
            const currentTime = Date.now();
            enemy.shoot(currentTime);
            expect(enemy.lastShotTime).to.equal(currentTime);
        });
    });
});