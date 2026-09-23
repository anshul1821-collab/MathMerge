import React, { useEffect, useState, useRef } from 'react';
import type { BoardState } from '../utils/movement';
import { useEducation } from '../hooks/useEducation';

interface EducationOverlayProps {
    board: BoardState;
    enabled: boolean;
}

interface ToastInfo {
    id: string;
    text: string;
    r: number;
    c: number;
}

export const EducationOverlay: React.FC<EducationOverlayProps> = ({ board, enabled }) => {
    const { registerMerge, registerChallengeAnswer } = useEducation();
    const [toasts, setToasts] = useState<ToastInfo[]>([]);
    const [popup, setPopup] = useState<{ type: 'why' | 'challenge', value?: number } | null>(null);
    const [challengeOptions, setChallengeOptions] = useState<number[]>([]);
    const [challengeHint, setChallengeHint] = useState<string>('');
    const prevBoardRef = useRef<string>('');

    useEffect(() => {
        if (!enabled) return;

        const boardStr = JSON.stringify(board.map(r => r.map(c => c?.mergedInto ? c.value : null)));
        if (boardStr === prevBoardRef.current) return;
        prevBoardRef.current = boardStr;

        const newToasts: ToastInfo[] = [];
        let mergedValue = 0;

        board.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell && cell.mergedInto) {
                    mergedValue = cell.value;
                    const half = cell.value / 2;
                    let text = `${half} + ${half} = ${cell.value} — combined equal numbers!`;
                    if (cell.value >= 16 && cell.value < 128) {
                        text = `Doubled! ${half} + ${half} = ${cell.value}`;
                    } else if (cell.value >= 128) {
                        text = `Power of 2: ${cell.value}!`;
                    }
                    newToasts.push({ id: cell.id, text, r, c });
                    registerMerge(cell.value);
                }
            });
        });

        if (newToasts.length > 0) {
            setToasts(newToasts);
            const timer = setTimeout(() => setToasts([]), 2000);
            
            // Randomly trigger popups (only if one isn't active)
            if (!popup) {
                const rand = Math.random();
                if (rand < 0.1 && mergedValue >= 8) {
                    setPopup({ type: 'why', value: mergedValue });
                } else if (rand > 0.9 && mergedValue >= 8) {
                    // Challenge
                    const correct = mergedValue * 2;
                    const opts = [correct, correct - 2, correct + 4, correct / 2].sort(() => Math.random() - 0.5);
                    setChallengeOptions(opts);
                    setChallengeHint('');
                    setPopup({ type: 'challenge', value: mergedValue });
                }
            }
            
            return () => clearTimeout(timer);
        }
    }, [board, enabled, registerMerge, popup]);

    if (!enabled) return null;

    return (
        <div className="edu-overlay-container">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className="merge-toast"
                    style={{
                        top: `calc(${toast.r * 25}% + 12.5%)`,
                        left: `calc(${toast.c * 25}% + 12.5%)`
                    }}
                >
                    {toast.text}
                </div>
            ))}

            {popup && popup.type === 'why' && (
                <div className="modal-backdrop edu-popup">
                    <div className="modal-content">
                        <h2>🧠 Did you notice?</h2>
                        <p>When two identical numbers merge, the result is double the original number.</p>
                        <p><strong>{popup.value! / 2} + {popup.value! / 2} = {popup.value}</strong></p>
                        <button className="btn btn-primary modal-close" onClick={() => setPopup(null)}>
                            Got it! → Continue
                        </button>
                    </div>
                </div>
            )}

            {popup && popup.type === 'challenge' && (
                <div className="modal-backdrop edu-challenge">
                    <div className="modal-content">
                        <h2>🎯 Quick Challenge</h2>
                        <p>You have an {popup.value}. What number will you get if you merge it with another {popup.value}?</p>
                        <div className="challenge-options">
                            {challengeOptions.map(opt => (
                                <button 
                                    key={opt}
                                    className="challenge-option-btn"
                                    onClick={() => {
                                        if (opt === popup.value! * 2) {
                                            registerChallengeAnswer(true);
                                            setPopup(null);
                                        } else {
                                            registerChallengeAnswer(false);
                                            setChallengeHint(`💡 Hint: You're merging two ${popup.value}s. ${popup.value} + ${popup.value} = ?`);
                                        }
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {challengeHint && <div className="challenge-hint">{challengeHint}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};
