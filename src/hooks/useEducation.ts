import { useState, useEffect, useCallback } from 'react';

export interface EducationStats {
    highestNumber: number;
    totalMerges: number;
    correctChallenges: number;
    totalChallenges: number;
    streaks: {
        add: number;
        sub: number;
        mul: number;
        div: number;
    };
    badges: {
        additionAce: boolean;
        subtractionSniper: boolean;
        multiplicationMaster: boolean;
        divisionDynamo: boolean;
        predictionPro: boolean;
    };
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
    streaks: {
        add: 0, sub: 0, mul: 0, div: 0
    },
    badges: {
        additionAce: false,
        subtractionSniper: false,
        multiplicationMaster: false,
        divisionDynamo: false,
        predictionPro: false,
    },
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

    const registerChallengeAnswer = useCallback((correct: boolean, expr: string = '') => {
        setStats(prev => {
            const newStats = {
                ...prev,
                totalChallenges: prev.totalChallenges + 1,
                correctChallenges: prev.correctChallenges + (correct ? 1 : 0),
                streaks: { ...prev.streaks },
                badges: { ...prev.badges }
            };

            if (correct) {
                if (expr.includes('+')) newStats.streaks.add += 1;
                else if (expr.includes('-')) newStats.streaks.sub += 1;
                else if (expr.includes('×')) newStats.streaks.mul += 1;
                else if (expr.includes('÷')) newStats.streaks.div += 1;

                if (newStats.streaks.add >= 10) newStats.badges.additionAce = true;
                if (newStats.streaks.sub >= 10) newStats.badges.subtractionSniper = true;
                if (newStats.streaks.mul >= 10) newStats.badges.multiplicationMaster = true;
                if (newStats.streaks.div >= 10) newStats.badges.divisionDynamo = true;
                if (newStats.correctChallenges >= 20) newStats.badges.predictionPro = true;
            } else {
                if (expr.includes('+')) newStats.streaks.add = 0;
                else if (expr.includes('-')) newStats.streaks.sub = 0;
                else if (expr.includes('×')) newStats.streaks.mul = 0;
                else if (expr.includes('÷')) newStats.streaks.div = 0;
            }

            return newStats;
        });
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
