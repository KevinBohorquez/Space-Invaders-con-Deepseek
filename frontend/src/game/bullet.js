export class Bullet {
    constructor(x, y, width, height, speed, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.isPlayerBullet = isPlayerBullet;
    }

    update() {
        if (this.isPlayerBullet) {
            this.y -= this.speed;
        } else {
            this.y += this.speed;
        }
    }

    isOutOfBounds(gameHeight) {
        if (this.isPlayerBullet) {
            return this.y < -this.height;
        } else {
            return this.y > gameHeight;
        }
    }
}