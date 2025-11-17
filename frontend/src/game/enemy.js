export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 25;
        this.alive = true;
        this.lastShotTime = 0;
        this.shotCooldown = 2000; // 2 segundos entre disparos
    }

    shoot(currentTime) {
        // Solo disparar si ha pasado el tiempo de cooldown
        if (currentTime - this.lastShotTime > this.shotCooldown) {
            this.lastShotTime = currentTime;
            return {
                x: this.x + this.width / 2 - 3, // Centrado
                y: this.y + this.height,
                width: 6,
                height: 15,
                speed: 5 // Más lento que las balas del jugador
            };
        }
        return null;
    }
}