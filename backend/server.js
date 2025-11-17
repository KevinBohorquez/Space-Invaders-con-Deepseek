import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import scoreRoutes from './routes/scores.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (cuando esté construido)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes API
app.use('/api', scoreRoutes);

// Para desarrollo: redirigir al servidor de Vite
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
        // En desarrollo, redirigir al servidor de Vite
        res.redirect('http://localhost:5173');
    }
});

// Manejo de errores 404 para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado'
    });
});

// Para todas las demás rutas, servir el frontend
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
        res.redirect('http://localhost:5173');
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        error: 'Error interno del servidor'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
    console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});

export default app;