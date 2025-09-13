'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('dino-high-score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    // Aqui você implementaria a lógica do jogo
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dino-high-score', score.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Chrome Dino Game</h1>
        
        {gameState === 'menu' && (
          <div>
            <p className="text-lg mb-4">Pressione ESPAÇO para pular!</p>
            <Button onClick={startGame} size="lg">
              Começar Jogo
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <canvas
              ref={canvasRef}
              width={800}
              height={200}
              className="border border-gray-300 bg-white"
            />
            <p className="mt-4 text-lg">Pontuação: {score}</p>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-lg mb-2">Pontuação: {score}</p>
            <p className="text-lg mb-4">Melhor Pontuação: {highScore}</p>
            <Button onClick={startGame} size="lg">
              Jogar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
