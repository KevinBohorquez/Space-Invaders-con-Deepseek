export function validateScore(req, res, next) {
    const { playerName, score } = req.body;
    
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Nombre de jugador inválido' 
        });
    }
    
    if (typeof score !== 'number' || score < 0 || score > 999999) {
        return res.status(400).json({ 
            error: 'Puntaje inválido' 
        });
    }
    
    // Limitar longitud del nombre
    if (playerName.length > 50) {
        req.body.playerName = playerName.substring(0, 50);
    }
    
    next();
}

export function validateLimit(req, res, next) {
    const limit = parseInt(req.query.limit) || 10;
    
    if (limit < 1 || limit > 100) {
        return res.status(400).json({ 
            error: 'Límite debe estar entre 1 y 100' 
        });
    }
    
    req.validLimit = limit;
    next();
}