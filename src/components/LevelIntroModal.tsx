import React from 'react';
import type { LevelConfig } from '../utils/levels';

interface LevelIntroModalProps {
    levelConfig: LevelConfig;
    onStart: () => void;
}

export const LevelIntroModal: React.FC<LevelIntroModalProps> = ({ levelConfig, onStart }) => {
    
    const getConceptExplanation = () => {
        const ops = levelConfig.ops;
        let explanation = "In this level, you will merge tiles to reach " + levelConfig.targetValue + ". ";
        
        if (ops.includes('ADD') && ops.length === 1) {
            explanation += "You'll see addition problems. Combine tiles that add up to the same number! For example, '4 + 4' merges with '8'.";
        } else if (ops.includes('SUB') && !ops.includes('MUL') && !ops.includes('DIV')) {
            explanation += "We've added subtraction! You'll need to solve both addition and subtraction. Like '10 - 2' equals 8.";
        } else if (ops.includes('MUL') && !ops.includes('DIV') && !ops.includes('SQUARE')) {
            explanation += "Multiplication is here! It's just fast addition. '4 × 2' equals 8.";
        } else if (ops.includes('DIV') && !ops.includes('SQUARE')) {
            explanation += "Now including division! Splitting numbers into equal parts. '16 ÷ 2' equals 8.";
        } else if (ops.includes('SQUARE') && !ops.includes('SQRT')) {
            explanation += "Squares! A number multiplied by itself. '3²' means 3 × 3 = 9.";
        } else if (ops.includes('SQRT') && !ops.includes('ALGEBRA')) {
            explanation += "Square Roots! The opposite of a square. '√64' means 'what number times itself is 64?' It's 8!";
        } else if (ops.includes('ALGEBRA')) {
            explanation += "Algebra time! Find the missing 'x'. If '2x = 16', then x is 8.";
        } else {
            explanation += "This is a mixed review level! You'll see a mix of all the concepts you've learned so far.";
        }
        
        return explanation;
    };

    return (
        <div className="modal-backdrop" onClick={onStart}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '400px' }}>
                <h2 style={{ color: '#60a5fa', marginBottom: '10px' }}>Level {levelConfig.level}</h2>
                <h3 style={{ margin: '0 0 20px 0', color: '#cbd5e1' }}>Target: {levelConfig.targetValue}</h3>
                
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '25px', lineHeight: '1.6' }}>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>{getConceptExplanation()}</p>
                </div>
                
                <button className="btn btn-primary pulse-btn" onClick={onStart} style={{ fontSize: '1.2rem', padding: '12px 30px' }}>
                    Start Level
                </button>
            </div>
        </div>
    );
};
