import type { OperatorType } from './levels';

export function generateExpression(targetValue: number, ops: OperatorType[]): string {
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a = 0;
    let b = 0;

    switch (op) {
        case 'ADD':
            b = Math.floor(Math.random() * (targetValue - 1)) + 1;
            if (b >= targetValue) b = Math.floor(targetValue / 2);
            a = targetValue - b;
            return `${a} + ${b}`;
        case 'SUB':
            b = Math.floor(Math.random() * targetValue) + 1;
            a = targetValue + b;
            return `${a} - ${b}`;
        case 'MUL':
            const factors = [];
            for (let i = 1; i <= targetValue; i++) {
                if (targetValue % i === 0) factors.push(i);
            }
            a = factors[Math.floor(Math.random() * factors.length)];
            b = targetValue / a;
            return `${a} × ${b}`;
        case 'DIV':
            b = Math.floor(Math.random() * 5) + 2; 
            a = targetValue * b;
            return `${a} ÷ ${b}`;
        case 'SQUARE':
            // E.g., 8 = 3^2 - 1. We need to express targetValue as x^2 + y or x^2 - y.
            // Let's find the nearest square.
            const nearestRoot = Math.round(Math.sqrt(targetValue));
            const square = nearestRoot * nearestRoot;
            const diff = Math.abs(targetValue - square);
            if (diff === 0) return `${nearestRoot}²`;
            if (square > targetValue) return `${nearestRoot}² - ${diff}`;
            return `${nearestRoot}² + ${diff}`;
        case 'SQRT':
            // targetValue = sqrt(a). So a = targetValue^2
            a = targetValue * targetValue;
            return `√${a}`;
        case 'ALGEBRA':
            // "2x = a", where x is targetValue. We just display "a / 2" ? No, the game is evaluating expressions.
            // The value is the solution to the equation. But how to display an equation where the value is x?
            // "Solve: 2x = 16" -> The player must know this evaluates to 8.
            // To make it fit the format, we can return a string like "x: 2x=16".
            const coeff = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
            a = targetValue * coeff;
            return `x: ${coeff}x=${a}`;
    }
    return targetValue.toString();
}
