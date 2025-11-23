// test/player.test.js
import { expect } from 'chai';
import { Player } from '../src/game/player.js';

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(370, 510);
    });

    describe('Constructor', () => {
        it('should initialize with correct position', () => {
            expect(player.x).to.equal(370);
            expect(player.y).to.equal(510);
        });

        it('should initialize with correct dimensions', () => {
            expect(player.width).to.equal(60);
            expect(player.height).to.equal(25);
        });

        it('should start with 3 lives', () => {
            expect(player.lives).to.equal(3);
        });

        it('should start alive', () => {
            expect(player.isAlive).to.be.true;
        });

        it('should have correct speed', () => {
            expect(player.speed).to.equal(8);
        });
    });

    describe('move()', () => {
        it('should move left when direction is "left"', () => {
            const initialX = player.x;
            player.move('left', 800);
            expect(player.x).to.equal(initialX - 8);
        });

        it('should move right when direction is "right"', () => {
            const initialX = player.x;
            player.move('right', 800);
            expect(player.x).to.equal(initialX + 8);
        });

        it('should not move beyond left boundary', () => {
            player.x = 0;
            player.move('left', 800);
            expect(player.x).to.equal(0);
        });

        it('should not move beyond right boundary', () => {
            const gameWidth = 800;
            player.x = gameWidth - player.width;
            player.move('right', gameWidth);
            expect(player.x).to.equal(gameWidth - player.width);
        });
    });

    describe('takeDamage()', () => {
        it('should decrease lives by 1', () => {
            player.takeDamage();
            expect(player.lives).to.equal(2);
        });

        it('should return true when player still has lives', () => {
            const result = player.takeDamage();
            expect(result).to.be.true;
        });

        it('should set isAlive to false when lives reach 0', () => {
            player.takeDamage();
            player.takeDamage();
            player.takeDamage();
            expect(player.isAlive).to.be.false;
        });

        it('should return false when player dies', () => {
            player.takeDamage();
            player.takeDamage();
            const result = player.takeDamage();
            expect(result).to.be.false;
        });
    });

    describe('shoot()', () => {
        it('should return bullet data object', () => {
            const bullet = player.shoot();
            expect(bullet).to.be.an('object');
        });

        it('should return centered bullet x position', () => {
            const bullet = player.shoot();
            const expectedX = player.x + player.width / 2 - 3;
            expect(bullet.x).to.equal(expectedX);
        });

        it('should return bullet y position above player', () => {
            const bullet = player.shoot();
            expect(bullet.y).to.equal(player.y - 15);
        });

        it('should return bullet with correct dimensions', () => {
            const bullet = player.shoot();
            expect(bullet.width).to.equal(6);
            expect(bullet.height).to.equal(15);
        });

        it('should return bullet with correct speed', () => {
            const bullet = player.shoot();
            expect(bullet.speed).to.equal(10);
        });
    });
});