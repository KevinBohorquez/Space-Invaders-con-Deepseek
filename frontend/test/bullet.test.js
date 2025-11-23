import { expect } from 'chai';
import { Bullet } from '../src/game/bullet.js';

describe('Bullet', () => {
    describe('Constructor', () => {
        it('should initialize with correct properties', () => {
            const bullet = new Bullet(100, 200, 6, 15, 10, true);
            expect(bullet.x).to.equal(100);
            expect(bullet.y).to.equal(200);
            expect(bullet.width).to.equal(6);
            expect(bullet.height).to.equal(15);
            expect(bullet.speed).to.equal(10);
            expect(bullet.isPlayerBullet).to.be.true;
        });

        it('should default to player bullet if isPlayerBullet not specified', () => {
            const bullet = new Bullet(100, 200, 6, 15, 10);
            expect(bullet.isPlayerBullet).to.be.true;
        });

        it('should accept enemy bullet flag', () => {
            const bullet = new Bullet(100, 200, 6, 15, 5, false);
            expect(bullet.isPlayerBullet).to.be.false;
        });
    });

    describe('update()', () => {
        it('should move player bullet upward', () => {
            const bullet = new Bullet(100, 200, 6, 15, 10, true);
            const initialY = bullet.y;
            bullet.update();
            expect(bullet.y).to.equal(initialY - 10);
        });

        it('should move enemy bullet downward', () => {
            const bullet = new Bullet(100, 200, 6, 15, 5, false);
            const initialY = bullet.y;
            bullet.update();
            expect(bullet.y).to.equal(initialY + 5);
        });

        it('should update position correctly over multiple frames', () => {
            const bullet = new Bullet(100, 200, 6, 15, 10, true);
            bullet.update();
            bullet.update();
            bullet.update();
            expect(bullet.y).to.equal(170);
        });
    });

    describe('isOutOfBounds()', () => {
        it('should return true when player bullet goes above screen', () => {
            const bullet = new Bullet(100, -20, 6, 15, 10, true);
            expect(bullet.isOutOfBounds(600)).to.be.true;
        });

        it('should return false when player bullet is still on screen', () => {
            const bullet = new Bullet(100, 100, 6, 15, 10, true);
            expect(bullet.isOutOfBounds(600)).to.be.false;
        });

        it('should return true when enemy bullet goes below screen', () => {
            const bullet = new Bullet(100, 610, 6, 15, 5, false);
            expect(bullet.isOutOfBounds(600)).to.be.true;
        });

        it('should return false when enemy bullet is still on screen', () => {
            const bullet = new Bullet(100, 500, 6, 15, 5, false);
            expect(bullet.isOutOfBounds(600)).to.be.false;
        });

        it('should consider bullet height for player bullets', () => {
            const bullet = new Bullet(100, -14, 6, 15, 10, true);
            expect(bullet.isOutOfBounds(600)).to.be.false;
            
            const outBullet = new Bullet(100, -16, 6, 15, 10, true);
            expect(outBullet.isOutOfBounds(600)).to.be.true;
        });
    });
});