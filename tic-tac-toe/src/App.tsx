import React, { useState, useEffect } from 'react';

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

  // Get empty cells
  const getEmptyCells = (board: Board): number[] => {
    return board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
  };

  // Minimax algorithm for computer AI
  // FIX: Never mutate the board directly, always use a copy
  const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'O';
          const score = minimax(newBoard, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = 'X';
          const score = minimax(newBoard, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // FIX: Never mutate the board directly in getBestMove
  const getBestMove = (board: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = 'O';
        const score = minimax(newBoard, 0, false);
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const makeComputerMove = (currentBoard: Board) => {
    const emptyCells = getEmptyCells(currentBoard);
    if (emptyCells.length === 0) return;

    let computerMove = getBestMove(currentBoard);

    // FIX: getBestMove should always return a valid move if there are empty cells
    if (computerMove === -1) {
      computerMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    const newBoard = [...currentBoard];
    newBoard[computerMove] = 'O';
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
      setCurrentPlayer('X');
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || gameState !== 'playing' || currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
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
      setCurrentPlayer('O');
    }
  };

  // FIX: Remove board from dependency array to avoid unnecessary triggers
  useEffect(() => {
    if (currentPlayer === 'O' && gameState === 'playing') {
      const timer = setTimeout(() => {
        makeComputerMove(board);
      }, 500); 
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameState]); // board removed

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
        return winner === 'X' ? 'You win!' : 'Computer wins!';
      case 'draw':
        return "It's a draw!";
      default:
        return currentPlayer === 'X' ? 'Your turn' : 'Computer thinking...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Tic Tac Toe vs Computer
        </h1>
        
        {/* Game Status */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold text-gray-700">
            {getStatusMessage()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You are X, Computer is O
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
                ${currentPlayer === 'O' && gameState === 'playing' && !cell ? 'cursor-not-allowed opacity-50' : ''}
              `}
              disabled={!!cell || gameState !== 'playing' || currentPlayer !== 'X'}
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
              <p className="text-sm text-gray-600">Your Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.draws}</p>
              <p className="text-sm text-gray-600">Draws</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.oWins}</p>
              <p className="text-sm text-gray-600">Computer Wins</p>
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