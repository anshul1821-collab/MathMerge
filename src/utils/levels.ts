export type OperatorType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'SQUARE' | 'SQRT' | 'ALGEBRA';

export interface LevelConfig {
    level: number;
    targetValue: number;
    ops: OperatorType[];
}

export const LEVELS: LevelConfig[] = [
    { level: 1, targetValue: 32, ops: ['ADD'] },
    { level: 2, targetValue: 64, ops: ['ADD', 'SUB'] },
    { level: 3, targetValue: 128, ops: ['ADD', 'SUB'] },
    { level: 4, targetValue: 128, ops: ['MUL'] },
    { level: 5, targetValue: 256, ops: ['ADD', 'SUB', 'MUL'] },
    { level: 6, targetValue: 256, ops: ['DIV'] },
    { level: 7, targetValue: 512, ops: ['MUL', 'DIV'] },
    { level: 8, targetValue: 512, ops: ['ADD', 'SUB', 'MUL', 'DIV'] },
    { level: 9, targetValue: 1024, ops: ['ADD', 'SUB', 'MUL', 'DIV'] },
    { level: 10, targetValue: 1024, ops: ['SQUARE'] }, // Introduces exponents
    { level: 11, targetValue: 2048, ops: ['SQUARE', 'ADD', 'SUB'] },
    { level: 12, targetValue: 2048, ops: ['SQRT'] }, // Introduces roots
    { level: 13, targetValue: 2048, ops: ['SQRT', 'MUL', 'DIV'] },
    { level: 14, targetValue: 4096, ops: ['ALGEBRA'] }, // Introduces basic linear equations
    { level: 15, targetValue: 4096, ops: ['ALGEBRA', 'ADD', 'SUB'] },
    { level: 16, targetValue: 4096, ops: ['ALGEBRA', 'MUL', 'DIV'] },
    { level: 17, targetValue: 8192, ops: ['ALGEBRA', 'SQUARE'] },
    { level: 18, targetValue: 8192, ops: ['ALGEBRA', 'SQRT'] },
    { level: 19, targetValue: 16384, ops: ['ALGEBRA', 'SQUARE', 'SQRT'] },
    { level: 20, targetValue: 16384, ops: ['ADD', 'SUB', 'MUL', 'DIV', 'SQUARE', 'SQRT', 'ALGEBRA'] },
];
