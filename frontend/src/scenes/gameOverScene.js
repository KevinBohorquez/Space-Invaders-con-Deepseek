import { GAME_WIDTH } from '../utils/constants.js';

export class GameOverScene {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
    }

    enter(data = {}) {
        this.score = data.score || 0;
        this.won = data.won || false;
    }

    draw() {
        // Título
        this.ctx.fillStyle = this.won ? '#00ff00' : '#ff0000';
        this.ctx.font = 'bold 64px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.won ? '¡VICTORIA!' : 'GAME OVER', 400, 120);
        
        // Puntaje
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '36px Courier New';
        this.ctx.fillText(`PUNTAJE: ${this.score}`, 400, 190);
        
        // Jugador
        this.ctx.font = '28px Courier New';
        this.ctx.fillText(`JUGADOR: ${this.game.playerName}`, 400, 240);
        
        // Estado del envío
        this.ctx.font = '20px Courier New';
        this.ctx.fillText(
            this.game.scoreSubmitted ? 'PUNTAJE GUARDADO' : 'ERROR AL GUARDAR PUNTAJE', 
            400, 290
        );
        
        // Instrucciones
        this.ctx.fillText('PRESIONA [ENTER] O HAZ CLIC PARA VOLVER AL MENÚ', 400, 350);
    }
}