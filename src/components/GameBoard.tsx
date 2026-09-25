import React, { useRef } from 'react';
import type { BoardState } from '../utils/movement';
import { Tile } from './Tile';

interface GameBoardProps {
    board: BoardState;
    showValue: boolean;
    educationEnabled?: boolean;
    onMove: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, showValue, educationEnabled, onMove }) => {
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStart.current.x;
        const dy = touchEndY - touchStart.current.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            if (Math.abs(dx) > 30) {
                onMove(dx > 0 ? 'RIGHT' : 'LEFT');
            }
        } else {
            // Vertical
            if (Math.abs(dy) > 30) {
                onMove(dy > 0 ? 'DOWN' : 'UP');
            }
        }
        touchStart.current = null;
    };

    return (
        <div 
            className="game-board"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {board.map((row, r) => 
                row.map((cell, c) => (
                    <div key={`${r}-${c}`} className="grid-cell">
                        {cell ? (
                            <Tile 
                                value={cell.value} 
                                expression={cell.expression} 
                                showValue={showValue}
                                isNew={cell.isNew}
                                mergedInto={cell.mergedInto}
                                mergeInfo={cell.mergeInfo}
                                pendingPrediction={cell.pendingPrediction}
                                educationEnabled={educationEnabled}
                            />
                        ) : null}
                    </div>
                ))
            )}
        </div>
    );
};
