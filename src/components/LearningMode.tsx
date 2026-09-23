import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './GameBoard';
import { slide, type BoardState } from '../utils/movement';
import type { OperatorType } from '../utils/levels';

const LESSONS = [
    {
        id: 1,
        title: "Number Bonds",
        desc: "Merge equal numbers to create the next number. Try merging two 2s to make a 4!",
        goal: 8,
        ops: ['ADD'] as OperatorType[],
        initialBoard: () => {
            const b: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
            b[1][1] = { id: 'a', value: 2, expression: '2', isNew: true };
            b[1][2] = { id: 'b', value: 2, expression: '2', isNew: true };
            return b;
        }
    },
    {
        id: 2,
        title: "Doubling",
        desc: "Every merge doubles the number. Make your way up to 32!",
        goal: 32,
        ops: ['ADD'] as OperatorType[],
        initialBoard: () => {
            const b: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
            b[2][1] = { id: 'c', value: 4, expression: '4', isNew: true };
            b[2][2] = { id: 'd', value: 4, expression: '4', isNew: true };
            return b;
        }
    },
    {
        id: 3,
        title: "Powers of 2",
        desc: "See how fast the numbers grow? Can you reach 128?",
        goal: 128,
        ops: ['ADD'] as OperatorType[],
        initialBoard: () => {
            const b: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
            b[1][0] = { id: 'e', value: 8, expression: '8', isNew: true };
            b[1][1] = { id: 'f', value: 8, expression: '8', isNew: true };
            return b;
        }
    }
];

interface LearningModeProps {
    onExit: () => void;
}

export const LearningMode: React.FC<LearningModeProps> = ({ onExit }) => {
    const [lessonIndex, setLessonIndex] = useState(0);
    const lesson = LESSONS[lessonIndex];
    
    const [board, setBoard] = useState<BoardState>(lesson.initialBoard());
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        setBoard(lesson.initialBoard());
        setCompleted(false);
    }, [lessonIndex, lesson]);

    const handleMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        if (completed) return;
        const { newBoard, moved } = slide(board, direction, lesson.ops);
        if (moved) {
            setBoard(newBoard);
            
            // Check goal
            let maxVal = 0;
            newBoard.forEach(r => r.forEach(c => {
                if (c && c.value > maxVal) maxVal = c.value;
            }));
            
            if (maxVal >= lesson.goal) {
                setCompleted(true);
            }
        }
    }, [board, completed, lesson]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': handleMove('UP'); break;
                case 'ArrowDown': handleMove('DOWN'); break;
                case 'ArrowLeft': handleMove('LEFT'); break;
                case 'ArrowRight': handleMove('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    return (
        <div className="app-container" style={{ textAlign: 'center' }}>
            <header>
                <h1>📚 Learning Mode</h1>
                <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Lesson {lesson.id}: {lesson.title}</h2>
                <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>{lesson.desc}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onExit}>Exit to Menu</button>
                    <button className="btn btn-secondary" onClick={() => {
                        setBoard(lesson.initialBoard());
                        setCompleted(false);
                    }}>Restart Lesson</button>
                </div>
            </header>

            <main className="game-container" style={{ marginTop: '20px' }}>
                <GameBoard board={board} showValue={true} onMove={handleMove} />
                
                {completed && (
                    <div className="game-overlay">
                        <h2>Lesson Complete!</h2>
                        <p>You reached {lesson.goal}!</p>
                        <div className="overlay-actions">
                            {lessonIndex < LESSONS.length - 1 ? (
                                <button className="btn btn-primary" onClick={() => setLessonIndex(i => i + 1)}>
                                    Next Lesson
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={onExit}>
                                    Finish Learning Mode
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
