'use client';

import { useState, useCallback, useEffect } from 'react';
import { GameState, Position, ValidMove, Difficulty, CheatAction } from '@/types/game';
import {
  createInitialBoard,
  getValidMoves,
  makeMove,
  countStones,
  isGameOver,
  getWinner,
  getOpponentColor
} from '@/utils/gameLogic';
import { getAIMove } from '@/utils/ai';
import { shouldCheat, performCheat, detectCheat } from '@/utils/cheating';
import { useAuth } from './useAuth';
import { getUserStats, updateUserStats, saveGameHistory } from '@/lib/db';

export function useGameState() {
  const { user } = useAuth();
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    successfulDoubts: 0
  });

  // ユーザーの統計情報を読み込む
  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        // Supabaseから読み込む
        const stats = await getUserStats(user.id);
        if (stats) {
          setGameStats({
            totalGames: stats.totalGames,
            wins: stats.wins,
            losses: stats.losses,
            draws: stats.draws,
            successfulDoubts: stats.successfulDoubts
          });
        }
      } else {
        // ログインしていない場合はlocalStorageから読み込む
        const saved = localStorage.getItem('othelloStats');
        if (saved) {
          setGameStats(JSON.parse(saved));
        }
      }
    };

    loadStats();
  }, [user]);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'black',
    blackCount: 2,
    whiteCount: 2,
    lastMove: null,
    isGameOver: false,
    winner: null,
    difficulty: 'beginner',
    cheatingHistory: [],
    doubtSuccess: 0,
    isPlayerTurn: true
  });

  const [turn, setTurn] = useState(1);
  const [message, setMessage] = useState('あなたのターンです');
  const [lastCheat, setLastCheat] = useState<CheatAction | null>(null);
  const [boardBeforeAI, setBoardBeforeAI] = useState(gameState.board);

  const updateGameState = useCallback((board: typeof gameState.board, nextPlayer: 'black' | 'white' | null, lastMove: Position | null) => {
    const { black, white } = countStones(board);
    const gameOver = isGameOver(board);
    
    setGameState(prev => ({
      ...prev,
      board,
      currentPlayer: nextPlayer,
      blackCount: black,
      whiteCount: white,
      lastMove,
      isGameOver: gameOver,
      winner: gameOver ? getWinner(board) : null,
      isPlayerTurn: nextPlayer === 'black'
    }));
  }, []);

  const handlePlayerMove = useCallback((row: number, col: number) => {
    if (!gameState.isPlayerTurn || gameState.isGameOver) return;

    const validMoves = getValidMoves(gameState.board, 'black');
    const move = validMoves.find(m => 
      m.position.row === row && m.position.col === col
    );

    if (!move) return;

    const newBoard = makeMove(gameState.board, move, 'black');
    updateGameState(newBoard, 'white', move.position);
    setMessage('コンピューターが考えています...');
    setTurn(prev => prev + 1);
  }, [gameState, updateGameState]);

  const handleAIMove = useCallback(async () => {
    if (gameState.currentPlayer !== 'white' || gameState.isGameOver) return;

    // Store board state before AI move
    setBoardBeforeAI(gameState.board);

    // AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    const aiMove = getAIMove(gameState.board, 'white', gameState.difficulty);
    if (!aiMove) {
      // AI can't move, pass turn
      const playerMoves = getValidMoves(gameState.board, 'black');
      if (playerMoves.length > 0) {
        updateGameState(gameState.board, 'black', null);
        setMessage('コンピューターはパスしました。あなたのターンです');
      }
      return;
    }

    let newBoard = makeMove(gameState.board, aiMove, 'white');
    let cheatAction: CheatAction | null = null;

    // Check if AI should cheat
    if (shouldCheat(gameState.difficulty, turn, gameState.cheatingHistory)) {
      const cheat = performCheat(newBoard, gameState.difficulty, turn);
      if (cheat) {
        cheatAction = cheat;
        newBoard = cheat.cheatedBoard;
        setLastCheat(cheat);
        setGameState(prev => ({
          ...prev,
          cheatingHistory: [...prev.cheatingHistory, cheat]
        }));
      }
    } else {
      setLastCheat(null);
    }

    updateGameState(newBoard, 'black', aiMove.position);
    
    // Check if player has moves
    const playerMoves = getValidMoves(newBoard, 'black');
    if (playerMoves.length === 0) {
      const aiMoves = getValidMoves(newBoard, 'white');
      if (aiMoves.length > 0) {
        setMessage('あなたはパスです。コンピューターのターンです');
        updateGameState(newBoard, 'white', aiMove.position);
      }
    } else {
      setMessage('あなたのターンです');
    }
    
    setTurn(prev => prev + 1);
  }, [gameState, updateGameState, turn]);

  const handleDoubt = useCallback(() => {
    if (gameState.isGameOver) return;

    const confirmed = window.confirm('本当にダウトしますか？\n間違っていた場合、即座に負けとなります。');
    if (!confirmed) return;

    // プレイヤーのターンでもダウトできるが、必ず失敗する
    if (gameState.isPlayerTurn) {
      setMessage('ダウト失敗...まだあなたのターンです。');
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 'white'
      }));
      return;
    }

    if (lastCheat && detectCheat(gameState.board, boardBeforeAI, lastCheat)) {
      // ダウト成功！！！
      setMessage('🎉 ダウト成功！不正を見抜きました！あなたの勝ちです！');
      
      // 不正前の盤面に戻す
      updateGameState(lastCheat.originalBoard, 'black', gameState.lastMove);
      
      // プレイヤーの勝利として終了
      setGameState(prev => ({
        ...prev,
        doubtSuccess: prev.doubtSuccess + 1,
        board: lastCheat.originalBoard,
        isGameOver: true,
        winner: 'black'  // プレイヤーの勝利
      }));
      
      // 統計を更新（勝利とダウト成功）
      const updateStats = async () => {
        if (user) {
          // Supabaseに保存
          await updateUserStats(user.id, 'win', true);
          await saveGameHistory(
            user.id,
            gameState.difficulty,
            'win',
            gameState.blackCount,
            gameState.whiteCount,
            1
          );
          // ローカルステートを更新
          const stats = await getUserStats(user.id);
          if (stats) {
            setGameStats({
              totalGames: stats.totalGames,
              wins: stats.wins,
              losses: stats.losses,
              draws: stats.draws,
              successfulDoubts: stats.successfulDoubts
            });
          }
        } else {
          // ログインしていない場合はlocalStorageに保存
          setGameStats(prev => {
            const newStats = { 
              ...prev, 
              totalGames: prev.totalGames + 1,
              wins: prev.wins + 1,
              successfulDoubts: prev.successfulDoubts + 1 
            };
            localStorage.setItem('othelloStats', JSON.stringify(newStats));
            return newStats;
          });
        }
      };
      updateStats();
      
      setLastCheat(null);
    } else {
      // ダウト失敗
      setMessage('😢 ダウト失敗...不正はありませんでした。あなたの負けです。');
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 'white'
      }));
    }
  }, [gameState, lastCheat, boardBeforeAI, updateGameState]);

  const startNewGame = useCallback((difficulty: Difficulty) => {
    const initialBoard = createInitialBoard();
    setGameState({
      board: initialBoard,
      currentPlayer: 'black',
      blackCount: 2,
      whiteCount: 2,
      lastMove: null,
      isGameOver: false,
      winner: null,
      difficulty,
      cheatingHistory: [],
      doubtSuccess: 0,
      isPlayerTurn: true
    });
    setTurn(1);
    setMessage('あなたのターンです');
    setLastCheat(null);
    setGameStarted(true);
  }, []);

  // Handle AI moves
  useEffect(() => {
    if (gameState.currentPlayer === 'white' && !gameState.isGameOver) {
      handleAIMove();
    }
  }, [gameState.currentPlayer, gameState.isGameOver, handleAIMove]);

  // Check game over
  useEffect(() => {
    if (gameState.isGameOver && gameState.winner !== null) {
      // ゲーム終了時の統計更新
      const updateStats = async () => {
        const result = gameState.winner === 'black' ? 'win' : 
                       gameState.winner === 'white' ? 'loss' : 'draw';
        
        if (user) {
          // ログインユーザーの場合はSupabaseに保存
          try {
            await updateUserStats(user.id, result, gameState.doubtSuccess > 0);
            await saveGameHistory(
              user.id,
              gameState.difficulty || 'beginner',
              result,
              gameState.blackCount,
              gameState.whiteCount,
              gameState.doubtSuccess
            );
            
            // ローカルの状態も更新
            const updatedStats = {
              totalGames: gameStats.totalGames + 1,
              wins: gameStats.wins + (result === 'win' ? 1 : 0),
              losses: gameStats.losses + (result === 'loss' ? 1 : 0),
              draws: gameStats.draws + (result === 'draw' ? 1 : 0),
              successfulDoubts: gameStats.successfulDoubts + (gameState.doubtSuccess ? 1 : 0)
            };
            setGameStats(updatedStats);
          } catch (error) {
            console.error('統計の保存に失敗:', error);
          }
        } else {
          // 非ログインユーザーの場合はローカルストレージに保存
          if (gameState.winner === 'black') {
            setGameStats(prev => {
              const newStats = { ...prev, totalGames: prev.totalGames + 1, wins: prev.wins + 1 };
              localStorage.setItem('othelloStats', JSON.stringify(newStats));
              return newStats;
            });
          } else if (gameState.winner === 'white') {
            setGameStats(prev => {
              const newStats = { ...prev, totalGames: prev.totalGames + 1, losses: prev.losses + 1 };
              localStorage.setItem('othelloStats', JSON.stringify(newStats));
              return newStats;
            });
          } else if (gameState.winner === 'draw') {
            setGameStats(prev => {
              const newStats = { ...prev, totalGames: prev.totalGames + 1, draws: prev.draws + 1 };
              localStorage.setItem('othelloStats', JSON.stringify(newStats));
              return newStats;
            });
          }
        }
      };
      
      updateStats();
    }
  }, [gameState.isGameOver, gameState.winner, user, gameState.difficulty, gameState.blackCount, gameState.whiteCount, gameState.doubtSuccess, gameStats]);

  return {
    gameState,
    gameStats,
    gameStarted,
    turn,
    message,
    validMoves: gameState.currentPlayer ? getValidMoves(gameState.board, gameState.currentPlayer) : [],
    handlePlayerMove,
    handleDoubt,
    startNewGame
  };
}