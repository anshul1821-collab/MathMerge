import { generateExpression } from './mathGen';
import type { OperatorType } from './levels';

export type TileData = {
    id: string;
    value: number;
    expression: string;
    mergedInto?: boolean;
    isNew?: boolean;
    mergeInfo?: { expr1: string; expr2: string };
    pendingPrediction?: boolean;
};

export type BoardState = (TileData | null)[][];

export function getEmptyCells(board: BoardState) {
    const empty = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!board[r][c]) empty.push({ r, c });
        }
    }
    return empty;
}

export function spawnTile(board: BoardState, ops: OperatorType[]): BoardState {
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) return board;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    
    const newBoard = board.map(row => [...row]);
    newBoard[cell.r][cell.c] = {
        id: Math.random().toString(36).substring(2, 9),
        value,
        expression: generateExpression(value, ops),
        isNew: true
    };
    return newBoard;
}

export function initializeBoard(ops: OperatorType[]): BoardState {
    let board: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
    board = spawnTile(board, ops);
    board = spawnTile(board, ops);
    return board;
}

export function slide(board: BoardState, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', ops: OperatorType[], predictCheck?: (e1: string, e2: string) => boolean) {
    let score = 0;
    let moved = false;
    let newBoard: BoardState = board.map(row => row.map(cell => cell ? { ...cell, isNew: false, mergedInto: false } : null));
    let predictionTarget: TileData | null = null;

    const rotateLeft = (b: BoardState) => {
        const res: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                res[3 - c][r] = b[r][c];
            }
        }
        return res;
    };
    const rotateRight = (b: BoardState) => {
        const res: BoardState = Array(4).fill(null).map(() => Array(4).fill(null));
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                res[c][3 - r] = b[r][c];
            }
        }
        return res;
    };

    if (direction === 'UP') newBoard = rotateLeft(newBoard);
    else if (direction === 'DOWN') newBoard = rotateRight(newBoard);
    else if (direction === 'RIGHT') {
        newBoard = rotateRight(rotateRight(newBoard));
    }

    // Now slide left
    for (let r = 0; r < 4; r++) {
        let row = newBoard[r].filter(c => c !== null) as TileData[];
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i].value === row[i+1].value) {
                row[i].value *= 2;
                row[i].mergeInfo = { expr1: row[i].expression, expr2: row[i+1].expression };
                
                if (predictCheck && predictCheck(row[i].expression, row[i+1].expression) && !predictionTarget) {
                    row[i].pendingPrediction = true;
                    row[i].expression = '?';
                    predictionTarget = { ...row[i] };
                } else {
                    row[i].expression = generateExpression(row[i].value, ops);
                }
                
                row[i].mergedInto = true;
                score += row[i].value;
                row.splice(i + 1, 1);
            }
        }
        const newRow: (TileData | null)[] = [...row];
        while (newRow.length < 4) newRow.push(null);
        
        for(let c=0; c<4; c++){
            if(newBoard[r][c]?.id !== newRow[c]?.id) moved = true;
        }
        newBoard[r] = newRow;
    }

    // Rotate back
    if (direction === 'UP') newBoard = rotateRight(newBoard);
    else if (direction === 'DOWN') newBoard = rotateLeft(newBoard);
    else if (direction === 'RIGHT') {
        newBoard = rotateRight(rotateRight(newBoard));
    }

    if (moved) {
        newBoard = spawnTile(newBoard, ops);
    }

    return { newBoard, score, moved, predictionTarget };
}

export function isGameOver(board: BoardState) {
    if (getEmptyCells(board).length > 0) return false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const val = board[r][c]?.value;
            if (
                (c < 3 && board[r][c+1]?.value === val) ||
                (r < 3 && board[r+1][c]?.value === val)
            ) {
                return false;
            }
        }
    }
    return true;
}

export function hasWon(board: BoardState, targetValue: number) {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c]?.value === targetValue) return true;
        }
    }
    return false;
}
