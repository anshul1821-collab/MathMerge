import { useState, useEffect, useCallback } from 'react';
import { generateExpression } from '../utils/mathGen';
import { initializeBoard, slide, isGameOver, hasWon } from '../utils/movement';
import type { BoardState } from '../utils/movement';
import { LEVELS, getAdaptiveLevelConfig } from '../utils/levels';
import type { OperatorType } from '../utils/levels';
import { audio } from '../utils/audio';
import type { EducationStats } from './useEducation';

export function useGame(initialLevel: number = -2, isLocked: boolean = false, stats?: EducationStats, registerChallengeAnswer?: (correct: boolean, expr?: string) => void) {
    const [currentLevel, setCurrentLevel] = useState(initialLevel);
    const [customOps, setCustomOps] = useState<OperatorType[] | null>(null);
    const [isPredictMode, setIsPredictMode] = useState(() => localStorage.getItem('nf_predictMode') === 'true');
    const [isAdaptiveMode, setIsAdaptiveMode] = useState(() => localStorage.getItem('nf_adaptiveMode') === 'true');
    const [askedPredictions] = useState(() => new Set<string>());
    const [predictionChallenge, setPredictionChallenge] = useState<{
        tileId: string;
        expr1: string;
        expr2: string;
        value: number;
        options: number[];
    } | null>(null);

    const levelConfig = customOps 
        ? { level: 0, targetValue: 2048, ops: customOps } 
        : (isAdaptiveMode && stats ? getAdaptiveLevelConfig(stats) : 
          (currentLevel === -2 ? { level: -2, targetValue: 2048, ops: ['ADD', 'SUB', 'MUL', 'DIV'] as OperatorType[] } : (LEVELS.find(l => l.level === currentLevel) || LEVELS[0])));

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
        const conf = level === -2 ? { level: -2, targetValue: 2048, ops: ['ADD', 'SUB', 'MUL', 'DIV'] as OperatorType[] } : (LEVELS.find(l => l.level === level) || LEVELS[0]);
        setCustomOps(null);
        setCurrentLevel(level);
        setBoard(initializeBoard(conf.ops));
        setScore(0);
        setGameOverState(false);
        setWon(false);
        setKeptGoing(false);
    }, []);

    const playPractice = useCallback((ops: OperatorType[]) => {
        setCustomOps(ops);
        setCurrentLevel(0); // 0 indicates practice mode
        setBoard(initializeBoard(ops));
        setScore(0);
        setGameOverState(false);
        setWon(false);
        setKeptGoing(false);
    }, []);

    const predictCheck = useCallback((e1: string, e2: string) => {
        if (!isPredictMode) return false;
        const key = `${e1}+${e2}`;
        if (askedPredictions.has(key)) return false;
        return true;
    }, [isPredictMode, askedPredictions]);

    const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (gameOver || (won && !keptGoing) || isLocked || predictionChallenge) return;

        const { newBoard, score: moveScore, moved, predictionTarget } = slide(board, direction, levelConfig.ops, predictCheck);
        if (moved) {
            audio.playSlide();
            if (moveScore > 0) audio.playMerge();

            if (predictionTarget && predictionTarget.mergeInfo) {
                const key = `${predictionTarget.mergeInfo.expr1}+${predictionTarget.mergeInfo.expr2}`;
                askedPredictions.add(key);

                const correct = predictionTarget.value;
                const opts = Array.from(new Set([correct, correct + 2, Math.max(2, correct - 2), correct * 2]));
                while (opts.length < 3) opts.push(opts[opts.length - 1] + 2);
                const options = opts.slice(0, 3).sort(() => Math.random() - 0.5);
                
                setPredictionChallenge({
                    tileId: predictionTarget.id,
                    expr1: predictionTarget.mergeInfo.expr1,
                    expr2: predictionTarget.mergeInfo.expr2,
                    value: correct,
                    options
                });
            }

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
    }, [board, gameOver, won, keptGoing, bestScore, levelConfig, isLocked, predictCheck, predictionChallenge, askedPredictions]);

    const resolvePrediction = useCallback((correct: boolean) => {
        if (correct) {
            setScore(s => s + 50);
            audio.playMerge();
        } else {
            audio.playSlide();
        }
        
        if (registerChallengeAnswer && predictionChallenge) {
            registerChallengeAnswer(correct, `${predictionChallenge.expr1} + ${predictionChallenge.expr2}`);
        }
        
        setBoard(b => b.map(row => row.map(cell => {
            if (cell && cell.id === predictionChallenge?.tileId) {
                return { ...cell, pendingPrediction: false, expression: generateExpression(cell.value, levelConfig.ops) };
            }
            return cell;
        })));
        
        setPredictionChallenge(null);
    }, [predictionChallenge, levelConfig.ops, stats]);

    const togglePredictMode = useCallback((enabled: boolean) => {
        setIsPredictMode(enabled);
        localStorage.setItem('nf_predictMode', String(enabled));
    }, []);

    const toggleAdaptiveMode = useCallback((enabled: boolean) => {
        setIsAdaptiveMode(enabled);
        localStorage.setItem('nf_adaptiveMode', String(enabled));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            if (isLocked) return;
            switch (e.key) {
                case 'ArrowUp': move('UP'); break;
                case 'ArrowDown': move('DOWN'); break;
                case 'ArrowLeft': move('LEFT'); break;
                case 'ArrowRight': move('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move, isLocked]);

    return { 
        board, score, bestScore, gameOver, won, keptGoing, setKeptGoing, 
        restart, move, currentLevel, levelConfig, playLevel, playPractice,
        isPredictMode, togglePredictMode, predictionChallenge, resolvePrediction,
        isAdaptiveMode, toggleAdaptiveMode
    };
}
