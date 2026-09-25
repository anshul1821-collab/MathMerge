import type { EducationStats } from '../hooks/useEducation';

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

export function getAdaptiveLevelConfig(stats: EducationStats): LevelConfig {
    let ops: OperatorType[] = ['ADD'];
    const acc = stats.totalChallenges > 0 ? stats.correctChallenges / stats.totalChallenges : 1;
    
    if (stats.correctChallenges >= 5 && acc >= 0.5) ops.push('SUB');
    if (stats.correctChallenges >= 10 && acc >= 0.6) ops.push('MUL');
    if (stats.correctChallenges >= 15 && acc >= 0.6) ops.push('DIV');
    if (stats.correctChallenges >= 25 && acc >= 0.7) ops.push('SQUARE');
    if (stats.correctChallenges >= 35 && acc >= 0.7) ops.push('ALGEBRA');

    let targetValue = 64;
    if (stats.totalMerges > 50) targetValue = 128;
    if (stats.totalMerges > 150) targetValue = 256;
    if (stats.totalMerges > 300) targetValue = 512;
    if (stats.totalMerges > 500) targetValue = 1024;
    if (stats.totalMerges > 1000) targetValue = 2048;

    return { level: -1, targetValue, ops };
}
