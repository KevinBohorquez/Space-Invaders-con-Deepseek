import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class StartScene {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
    }

    enter() {
        // La lógica de entrada se maneja en el game loop
    }

    draw() {
        // Título
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 64px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPACE INVADERS', 400, 80);
        
        // Línea decorativa
        this.ctx.fillRect(100, 110, 600, 4);
        
        // Jugador de ejemplo
        this.ctx.fillRect(360, 150, 80, 30);
        
        // Enemigos de ejemplo
        this.ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(150 + i * 100, 200, 50, 25);
        }
        
        // Instrucciones
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '20px Courier New';
        this.ctx.fillText('PRESIONA [ESPACIO] PARA JUGAR', 400, 280);
        this.ctx.fillText('O [ENTER] PARA VER RANKING', 400, 310);
        this.ctx.font = '16px Courier New';
        this.ctx.fillText('CONTROLES: FLECHAS/A-D = MOVER, ESPACIO = DISPARAR', 400, 350);
        this.ctx.fillText('HAZ CLIC EN CUALQUIER LUGAR PARA COMENZAR', 400, 380);
    }
}