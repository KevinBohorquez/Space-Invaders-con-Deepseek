const API_BASE_URL = 'http://localhost:4000/api';

export async function submitScore(playerName, score) {
    try {
        const response = await fetch(`${API_BASE_URL}/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, score }),
        });
        
        if (!response.ok) {
            throw new Error('Error al enviar puntaje');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting score:', error);
        throw error;
    }
}

export async function getLeaderboard(limit = 10) {
    try {
        const response = await fetch(`${API_BASE_URL}/scores?limit=${limit}`);
        
        if (!response.ok) {
            throw new Error('Error al obtener leaderboard');
        }
        
        const data = await response.json();
        console.log('Datos del leaderboard:', data);
        return data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return {
            success: true,
            data: [],
            count: 0
        };
    }
}