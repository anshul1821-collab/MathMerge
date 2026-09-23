import React, { useEffect, useState, useRef } from 'react';
import type { BoardState, TileData } from '../utils/movement';
import { useEducation } from '../hooks/useEducation';
import { generateExpression } from '../utils/mathGen';
import { LEVELS } from '../utils/levels';

const MATH_FACTS = [
    (mergedValue: number) => ({
        title: "🧠 Did you notice?",
        text: "When two identical numbers merge, the result is double the original number.",
        subtext: `${mergedValue / 2} + ${mergedValue / 2} = ${mergedValue}`
    }),
    (mergedValue: number) => ({
        title: "💡 Did you know?",
        text: "Multiplication is just repeated addition! Instead of adding the same number over and over, you can multiply.",
        subtext: `${mergedValue / 2} × 2 = ${mergedValue}`
    }),
    (mergedValue: number) => ({
        title: "🌟 Math Fact!",
        text: `The number ${mergedValue} is an even number. That means it can be divided perfectly in half without any remainders!`,
        subtext: `${mergedValue} ÷ 2 = ${mergedValue / 2}`
    }),
    (mergedValue: number) => ({
        title: "✨ Math Magic",
        text: "Adding zero to a number leaves it unchanged. This is called the additive identity property!",
        subtext: `${mergedValue} + 0 = ${mergedValue}`
    }),
    () => ({
        title: "🧩 Number Trivia",
        text: "Every time you merge tiles in this game, you are using the powers of 2 (2, 4, 8, 16, 32...).",
        subtext: `2 × 2 × 2... builds the board!`
    }),
    () => ({
        title: "🤓 Geek out!",
        text: "A 'jiffy' is an actual unit of time. It means 1/100th of a second!"
    }),
    () => ({
        title: "🔢 Zero Fact",
        text: "Zero is the only number that cannot be represented by Roman numerals."
    }),
    (mergedValue: number) => ({
        title: "📐 Geometry Connection",
        text: `If you arrange ${mergedValue} dots in a perfect rectangle, you are finding its factors!`
    }),
    () => ({
        title: "🤔 Brain Teaser",
        text: "Odd numbers always end in 1, 3, 5, 7, or 9!"
    }),
    () => ({
        title: "🤯 Mind Blown",
        text: "If you multiply any number by 9, the digits of the answer usually add up to 9! (e.g. 9 × 3 = 27, 2+7 = 9)"
    }),
    () => ({
        title: "🎯 Target Practice",
        text: "The target number at the top of the screen is your ultimate goal. Every merge gets you closer!"
    }),
    () => ({
        title: "🧮 Fast Math",
        text: "To multiply a whole number by 10, you just add a 0 to the end of the number!"
    }),
    () => ({
        title: "🚀 Space Math",
        text: "Math is the universal language. We even used it to send messages to aliens on the Voyager Golden Record!"
    }),
    () => ({
        title: "⚖️ Balancing Act",
        text: "An equation is like a scale. Whatever you do to one side, you must do to the other to keep it balanced."
    }),
    () => ({
        title: "♾️ Infinity",
        text: "There are infinitely many numbers. No matter how big a number you can think of, there is always one bigger!"
    }),
    () => ({
        title: "🍕 Pizza Math",
        text: "Fractions are just division! If you cut a pizza into 8 slices and eat 4, you ate 4/8, or 1/2 of the pizza."
    }),
    () => ({
        title: "⏳ Time Travel",
        text: "There are 86,400 seconds in a single day. Make them count!"
    }),
    () => ({
        title: "🧊 Cool Cube",
        text: "A cube has 6 faces, 12 edges, and 8 vertices. Dice are perfect examples of cubes!"
    }),
    () => ({
        title: "🔄 Palindrome Numbers",
        text: "Some numbers read the same forwards and backwards, like 121 or 33. These are called palindromes!"
    }),
    () => ({
        title: "🐝 Nature's Math",
        text: "Bees build their honeycombs using hexagons because they are the most efficient shape for storing honey!"
    })
];

interface EducationOverlayProps {
    board: BoardState;
    enabled: boolean;
    level: number;
    lockFrequency?: number;
    onLock?: (locked: boolean) => void;
    onMerge?: (text: string, isChallenge: boolean) => void;
}

interface ToastInfo {
    id: string;
    text: string;
    r: number;
    c: number;
}

export const EducationOverlay: React.FC<EducationOverlayProps> = ({ board, enabled, level, lockFrequency, onLock, onMerge }) => {
    const { registerMerge, registerChallengeAnswer } = useEducation();
    const [toasts, setToasts] = useState<ToastInfo[]>([]);
    const [popup, setPopup] = useState<{ type: 'why' | 'challenge' | 'lock_challenge', value?: number, expr?: string, options?: string[], correctOption?: string, fact?: { title: string; text: string; subtext?: string; } } | null>(null);
    const [challengeOptions, setChallengeOptions] = useState<number[]>([]);
    const [challengeHint, setChallengeHint] = useState<string>('');
    const prevBoardRef = useRef<string>('');
    const mergesSinceLastChallenge = useRef(0);
    const factOrderRef = useRef<number[]>([]);

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
                    if (cell.mergeInfo) {
                        const { expr1, expr2 } = cell.mergeInfo;
                        if (expr1.includes('+') || expr2.includes('+')) {
                            text = `${expr1} = ${half} and ${expr2} = ${half} — adding up to the same thing!`;
                        } else if (expr1.includes('-') || expr2.includes('-')) {
                            text = `${expr1} = ${half} and ${expr2} = ${half} — subtraction matching up!`;
                        } else if (expr1.includes('×') || expr2.includes('×')) {
                            text = `${expr1} and ${expr2} both evaluate to ${half}!`;
                        } else {
                            text = `${expr1} = ${half} and ${expr2} = ${half} — different expressions, same value!`;
                        }
                        registerMerge(cell.value, expr1, expr2);
                        if (onMerge) {
                            const formatExpr = (e: string) => e.includes('+') || e.includes('-') || e.includes('×') || e.includes('÷') ? `(${e})` : e;
                            onMerge(`${formatExpr(expr1)} + ${formatExpr(expr2)} = ${cell.value}`, false);
                        }
                    } else {
                        registerMerge(cell.value);
                        if (onMerge) onMerge(`${half} + ${half} = ${cell.value}`, false);
                    }
                    newToasts.push({ id: cell.id, text, r, c });
                    mergesSinceLastChallenge.current += 1;
                }
            });
        });

        if (newToasts.length > 0) {
            setToasts(newToasts);
            const timer = setTimeout(() => setToasts([]), 2000);
            
            if (!popup) {
                let chosenCell: TileData | null = null;
                for (const r of board) {
                    for (const c of r) {
                        if (c && c.mergedInto) chosenCell = c;
                    }
                }

                if (lockFrequency && lockFrequency > 0 && mergesSinceLastChallenge.current >= lockFrequency && chosenCell?.mergeInfo) {
                    mergesSinceLastChallenge.current = 0;
                    if (onLock) onLock(true);
                    
                    const ops = LEVELS.find(l => l.level === level)?.ops || ['ADD'];
                    const randomTarget = Math.floor(Math.random() * 30) + 5;
                    const randomExprStr = generateExpression(randomTarget, ops);
                    const correct = randomTarget;

                    const opts = Array.from(new Set([correct, correct + 2, Math.max(1, correct - 2), correct * 2]));
                    while (opts.length < 4) opts.push(opts[opts.length - 1] + 1);
                    const shuffled = opts.sort(() => Math.random() - 0.5);

                    setChallengeHint('');
                    setPopup({
                        type: 'lock_challenge',
                        value: correct,
                        expr: randomExprStr,
                        options: shuffled.map(String),
                        correctOption: String(correct)
                    });
                } else {
                    const rand = Math.random();
                    if (rand < 0.1 && mergedValue >= 8) {
                        const maxIndex = Math.min(MATH_FACTS.length - 1, 3 + level);
                        if (factOrderRef.current.length === 0) {
                            const allowed = [];
                            for(let i = 0; i <= maxIndex; i++) allowed.push(i);
                            factOrderRef.current = allowed.sort(() => Math.random() - 0.5);
                        }
                        const nextFactIndex = factOrderRef.current.shift()!;
                        const randomFact = MATH_FACTS[nextFactIndex || 0](mergedValue);
                        setPopup({ type: 'why', value: mergedValue, fact: randomFact });
                    } else if (rand > 0.9 && mergedValue >= 8) {
                        // Quick Challenge
                        const ops = LEVELS.find(l => l.level === level)?.ops || ['ADD'];
                        const randomTarget = Math.floor(Math.random() * 20) + 5;
                        const randomExprStr = generateExpression(randomTarget, ops);
                        const correct = randomTarget;

                        const opts = Array.from(new Set([correct, correct + 2, Math.max(1, correct - 2), correct * 2]));
                        while (opts.length < 4) opts.push(opts[opts.length - 1] + 1);
                        const shuffled = opts.sort(() => Math.random() - 0.5);

                        setChallengeOptions(shuffled);
                        setChallengeHint('');
                        setPopup({ 
                            type: 'challenge', 
                            value: correct, 
                            expr: randomExprStr,
                            correctOption: String(correct)
                        });
                    }
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

            {popup && popup.type === 'why' && popup.fact && (
                <div className="modal-backdrop edu-popup">
                    <div className="modal-content" style={{ textAlign: 'center' }}>
                        <h2>{popup.fact.title}</h2>
                        <p style={{ fontSize: '1.2rem', margin: '20px 0', color: '#e2e8f0' }}>{popup.fact.text}</p>
                        {popup.fact.subtext && (
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', fontSize: '1.3rem', fontWeight: 'bold', color: '#60a5fa' }}>
                                {popup.fact.subtext}
                            </div>
                        )}
                        <button className="btn btn-primary modal-close" style={{ marginTop: '25px' }} onClick={() => setPopup(null)}>
                            Got it! → Continue
                        </button>
                    </div>
                </div>
            )}

            {popup && popup.type === 'challenge' && (
                <div className="modal-backdrop edu-challenge">
                    <div className="modal-content">
                        <h2>🎯 Quick Challenge</h2>
                        <p>Solve this quick math problem for extra points!</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '20px 0', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px' }}>{popup.expr} = ?</p>
                        <div className="challenge-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {challengeOptions.map(opt => (
                                <button 
                                    key={opt}
                                    className="challenge-option-btn"
                                    onClick={() => {
                                        if (String(opt) === popup.correctOption) {
                                            registerChallengeAnswer(true);
                                            setPopup(null);
                                        } else {
                                            registerChallengeAnswer(false);
                                            setChallengeHint(`💡 Hint: ${popup.expr}`);
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

            {popup && popup.type === 'lock_challenge' && (
                <div className="modal-backdrop edu-challenge" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
                    <div className="modal-content" style={{ border: '2px solid #ef4444', transform: 'translateY(-10vh)' }}>
                        <h2>🔒 Solve to continue</h2>
                        <p>To unlock the board, solve this random math challenge:</p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '20px 0', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px' }}>{popup.expr} = ?</p>
                        <div className="challenge-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {popup.options?.map((opt, i) => (
                                <button 
                                    key={i}
                                    className="challenge-option-btn"
                                    onClick={() => {
                                        if (opt === popup.correctOption) {
                                            if (onLock) onLock(false);
                                            if (onMerge) onMerge(`${popup.expr} = ${popup.value}`, true);
                                            setPopup(null);
                                        } else {
                                            setChallengeHint(`💡 Hint: ${popup.expr}`);
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
