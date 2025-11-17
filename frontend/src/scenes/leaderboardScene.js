import { GAME_WIDTH } from '../utils/constants.js';

export class LeaderboardScene {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
    }

    enter(data = {}) {
        // Los datos se cargan desde el game
    }

    draw() {
        // Título
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RANKING - TOP 10', 400, 60);
        
        if (this.game.leaderboardData.length === 0) {
            this.ctx.font = '24px Courier New';
            this.ctx.fillText('NO HAY PUNTAJES REGISTRADOS', 400, 250);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('El servidor puede no estar disponible', 400, 290);
        } else {
            this.ctx.font = '20px Courier New';
            this.ctx.textAlign = 'left';
            
            // Encabezados
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText('#', 120, 120);
            this.ctx.fillText('JUGADOR', 180, 120);
            this.ctx.fillText('PUNTAJE', 500, 120);
            
            // Línea separadora
            this.ctx.fillRect(100, 130, 600, 2);
            
            // Datos
            this.game.leaderboardData.slice(0, 10).forEach((scoreData, index) => {
                const yPos = 160 + index * 35;
                
                // Posición
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillText(`${index + 1}.`, 120, yPos);
                
                // Nombre
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(scoreData.playerName, 180, yPos);
                
                // Puntaje
                this.ctx.fillStyle = '#ffff00';
                this.ctx.fillText(scoreData.score.toString().padStart(6, '0'), 500, yPos);
            });
        }
        
        // Instrucciones
        this.ctx.textAlign = 'center';
        this.ctx.font = '18px Courier New';
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillText('PRESIONA [ENTER] O HAZ CLIC PARA VOLVER AL MENÚ', 400, 520);
    }
}