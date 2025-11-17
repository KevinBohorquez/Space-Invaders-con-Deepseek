CREATE TABLE IF NOT EXISTS scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playerName VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_score (score DESC),
    INDEX idx_createdAt (createdAt DESC)
);

-- Insertar datos de ejemplo
INSERT IGNORE INTO scores (playerName, score) VALUES
('MAESTRO', 2500),
('INVADER', 1800),
('SPACE', 1200),
('GAMER', 900),
('PRO', 750),
('PLAYER', 600),
('TEST', 450),
('DEMO', 300),
('USER', 200),
('NEW', 100);