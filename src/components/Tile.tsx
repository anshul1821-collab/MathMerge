import React from 'react';

interface TileProps {
    value: number;
    expression: string;
    showValue: boolean;
    isNew?: boolean;
    mergedInto?: boolean;
}

export const Tile: React.FC<TileProps> = ({ value, expression, showValue, isNew, mergedInto }) => {
    let classes = `tile tile-${value > 2048 ? 'super' : value}`;
    if (isNew) classes += ' tile-new';
    if (mergedInto) classes += ' tile-merged';

    return (
        <div className={classes}>
            <div className="tile-expression">{expression}</div>
            {showValue && <div className="tile-value-subtext">(= {value})</div>}
        </div>
    );
};
