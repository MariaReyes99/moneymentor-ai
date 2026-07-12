/**
 * MoneyMentor AI
 * Feature: Savings Plan Generator
 */

function calculateMonthlySavings(
  targetAmount: number,
  months: number
): number {
  return targetAmount / months;
}

console.assert(
  calculateMonthlySavings(1200, 12) === 100,
  "Monthly savings calculation should be correct"
);

console.log("plan.test.ts passed");