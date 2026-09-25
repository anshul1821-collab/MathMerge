import React from 'react';
import type { OperatorType } from '../utils/levels';

interface PracticeModeModalProps {
    onClose: () => void;
    onSelectMode: (ops: OperatorType[]) => void;
}

export const PracticeModeModal: React.FC<PracticeModeModalProps> = ({ onClose, onSelectMode }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content level-modal" onClick={e => e.stopPropagation()}>
                <h2>Custom Practice Mode</h2>
                <p>Select which operations you want to practice. The target will be set to 2048.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['ADD'])}>
                        ➕ Addition
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['SUB'])}>
                        ➖ Subtraction
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['MUL'])}>
                        ✖️ Multiplication
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['DIV'])}>
                        ➗ Division
                    </button>
                    <button className="btn btn-primary" style={{ padding: '15px', fontSize: '1.1rem', gridColumn: 'span 2' }} onClick={() => onSelectMode(['ADD', 'SUB', 'MUL', 'DIV'])}>
                        🎲 Mixed Basics
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['SQUARE', 'SQRT'])}>
                        📐 Squares & Roots
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '15px', fontSize: '1.1rem' }} onClick={() => onSelectMode(['ALGEBRA'])}>
                        🧮 Algebra
                    </button>
                </div>
                
                <button className="btn btn-primary modal-close" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
