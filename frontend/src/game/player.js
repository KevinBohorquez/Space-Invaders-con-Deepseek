export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 25;
        this.speed = 8;
        this.lives = 3;
        this.isAlive = true;
    }

    move(direction, gameWidth) {
        if (direction === 'left') {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (direction === 'right') {
            this.x = Math.min(gameWidth - this.width, this.x + this.speed);
        }
    }

    takeDamage() {
        this.lives--;
        if (this.lives <= 0) {
            this.isAlive = false;
        }
        return this.isAlive;
    }

    shoot() {
        return {
            x: this.x + this.width / 2 - 3, // Centrado
            y: this.y - 15,
            width: 6,
            height: 15,
            speed: 10
        };
    }
}