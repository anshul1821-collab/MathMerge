import { useState, useEffect, useCallback } from 'react';

export interface EducationStats {
    highestNumber: number;
    totalMerges: number;
    correctChallenges: number;
    totalChallenges: number;
    conceptsUnlocked: {
        addition: boolean;
        subtraction: boolean;
        multiplication: boolean;
        division: boolean;
        doubling: boolean;
        powersOf2: boolean;
    };
}

const DEFAULT_STATS: EducationStats = {
    highestNumber: 0,
    totalMerges: 0,
    correctChallenges: 0,
    totalChallenges: 0,
    conceptsUnlocked: {
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
        doubling: false,
        powersOf2: false,
    }
};

export function useEducation() {
    const [stats, setStats] = useState<EducationStats>(() => {
        const saved = localStorage.getItem('numberFusionLearning');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return DEFAULT_STATS;
            }
        }
        return DEFAULT_STATS;
    });

    useEffect(() => {
        localStorage.setItem('numberFusionLearning', JSON.stringify(stats));
    }, [stats]);

    const registerMerge = useCallback((mergedValue: number, expr1: string = '', expr2: string = '') => {
        setStats(prev => {
            const newStats = { 
                ...prev, 
                totalMerges: prev.totalMerges + 1,
                conceptsUnlocked: { ...prev.conceptsUnlocked }
            };
            
            if (mergedValue > newStats.highestNumber) {
                newStats.highestNumber = mergedValue;
            }
            
            const combinedExpr = expr1 + expr2;
            if (combinedExpr.includes('+')) newStats.conceptsUnlocked.addition = true;
            if (combinedExpr.includes('-')) newStats.conceptsUnlocked.subtraction = true;
            if (combinedExpr.includes('×')) newStats.conceptsUnlocked.multiplication = true;
            if (combinedExpr.includes('÷')) newStats.conceptsUnlocked.division = true;

            if (mergedValue >= 16) newStats.conceptsUnlocked.doubling = true;
            if (mergedValue >= 128) newStats.conceptsUnlocked.powersOf2 = true;
            
            return newStats;
        });
    }, []);

    const registerChallengeAnswer = useCallback((correct: boolean) => {
        setStats(prev => ({
            ...prev,
            totalChallenges: prev.totalChallenges + 1,
            correctChallenges: prev.correctChallenges + (correct ? 1 : 0)
        }));
    }, []);

    const resetStats = useCallback(() => {
        setStats(DEFAULT_STATS);
    }, []);

    return {
        stats,
        registerMerge,
        registerChallengeAnswer,
        resetStats
    };
}
