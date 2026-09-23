import { useState, useEffect, useCallback } from 'react';
import { initializeBoard, slide, isGameOver, hasWon } from '../utils/movement';
import type { BoardState } from '../utils/movement';
import { LEVELS } from '../utils/levels';
import { audio } from '../utils/audio';

export function useGame() {
    const [currentLevel, setCurrentLevel] = useState(1);
    const levelConfig = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];

    const [board, setBoard] = useState<BoardState>(() => initializeBoard(levelConfig.ops));
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(
        parseInt(localStorage.getItem('numberFusionBest') || '0', 10)
    );
    const [gameOver, setGameOverState] = useState(false);
    const [won, setWon] = useState(false);
    const [keptGoing, setKeptGoing] = useState(false);

    const restart = useCallback(() => {
        setBoard(initializeBoard(levelConfig.ops));
        setScore(0);
        setGameOverState(false);
        setWon(false);
        setKeptGoing(false);
    }, [levelConfig]);

    const playLevel = useCallback((level: number) => {
        const conf = LEVELS.find(l => l.level === level) || LEVELS[0];
        setCurrentLevel(level);
        setBoard(initializeBoard(conf.ops));
        setScore(0);
        setGameOverState(false);
        setWon(false);
        setKeptGoing(false);
    }, []);

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver || (won && !keptGoing)) return;

        const { newBoard, score: moveScore, moved } = slide(board, direction, levelConfig.ops);
        if (moved) {
            audio.playSlide();
            if (moveScore > 0) audio.playMerge();

            setBoard(newBoard);
            setScore(s => {
                const newScore = s + moveScore;
                if (newScore > bestScore) {
                    setBestScore(newScore);
                    localStorage.setItem('numberFusionBest', newScore.toString());
                }
                return newScore;
            });
            
            if (!won && hasWon(newBoard, levelConfig.targetValue)) {
                audio.playWin();
                setWon(true);
            } else if (isGameOver(newBoard)) {
                audio.playLose();
                setGameOverState(true);
            }
        }
    }, [board, gameOver, won, keptGoing, bestScore, levelConfig]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            switch (e.key) {
                case 'ArrowUp': move('UP'); break;
                case 'ArrowDown': move('DOWN'); break;
                case 'ArrowLeft': move('LEFT'); break;
                case 'ArrowRight': move('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    return { 
        board, score, bestScore, gameOver, won, keptGoing, setKeptGoing, 
        restart, move, currentLevel, levelConfig, playLevel 
    };
}
