import React from 'react';

interface TileProps {
    value: number;
    expression: string;
    showValue: boolean;
    isNew?: boolean;
    mergedInto?: boolean;
    mergeInfo?: { expr1: string; expr2: string };
    pendingPrediction?: boolean;
    educationEnabled?: boolean;
}

export const Tile: React.FC<TileProps> = ({ value, expression, showValue, isNew, mergedInto, mergeInfo, pendingPrediction, educationEnabled }) => {
    let classes = `tile tile-${value > 2048 ? 'super' : value}`;
    if (isNew) classes += ' tile-new';
    if (mergedInto) classes += ' tile-merged';

    const formatExpr = (e: string) => e.includes('+') || e.includes('-') || e.includes('×') || e.includes('÷') ? `(${e})` : e;

    return (
        <div className={classes}>
            {pendingPrediction ? (
                <div className="tile-expression" style={{ animation: 'pulse 1s infinite' }}>?</div>
            ) : (
                <>
                    <div className="tile-expression">{expression}</div>
                    {showValue && <div className="tile-value-subtext">(= {value})</div>}
                    
                    {mergedInto && mergeInfo && !educationEnabled && (
                        <div className="tile-merge-equation-overlay">
                            {formatExpr(mergeInfo.expr1)} + {formatExpr(mergeInfo.expr2)} = {value}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
