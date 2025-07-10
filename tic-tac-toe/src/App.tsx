import React, { useState } from 'react';
import './App.css';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type GameState = 'playing' | 'won' | 'draw';

interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
}

const App: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [stats, setStats] = useState<GameStats>({ xWins: 0, oWins: 0, draws: 0 });

  // Winning combinations
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  // Check for winner
  const checkWinner = (board: Board): Player | null => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (board: Board): boolean => {
    return board.every(cell => cell !== null);
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameState('won');
      setStats(prev => ({
        ...prev,
        [gameWinner === 'X' ? 'xWins' : 'oWins']: prev[gameWinner === 'X' ? 'xWins' : 'oWins'] + 1
      }));
    } else if (isBoardFull(newBoard)) {
      setGameState('draw');
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameState('playing');
    setWinner(null);
  };

  // Reset stats
  const resetStats = () => {
    setStats({ xWins: 0, oWins: 0, draws: 0 });
  };

  // Get cell display value
  const getCellValue = (index: number): string => {
    return board[index] || '';
  };

  // Get game status message
  const getStatusMessage = (): string => {
    switch (gameState) {
      case 'won':
        return `Player ${winner} wins!`;
      case 'draw':
        return "It's a draw!";
      default:
        return `Player ${currentPlayer}'s turn`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Tic Tac Toe
        </h1>
        
        {/* Game Status */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold text-gray-700">
            {getStatusMessage()}
          </p>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`
                w-20 h-20 text-3xl font-bold rounded-lg border-2 transition-all duration-200
                ${cell 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer active:scale-95'
                }
                ${cell === 'X' ? 'text-blue-600' : 'text-red-600'}
              `}
              disabled={!!cell || gameState !== 'playing'}
            >
              {getCellValue(index)}
            </button>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center mb-6">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 active:scale-95"
          >
            New Game
          </button>
        </div>

        {/* Game Statistics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            Game Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.xWins}</p>
              <p className="text-sm text-gray-600">X Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.draws}</p>
              <p className="text-sm text-gray-600">Draws</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.oWins}</p>
              <p className="text-sm text-gray-600">O Wins</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={resetStats}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors duration-200"
            >
              Reset Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;