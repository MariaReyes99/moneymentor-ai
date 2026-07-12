/**
 * MoneyMentor AI
 * Feature: Input Validation
 */

function isFutureYear(year: number): boolean {
    return year > 2026;
  }
  
  console.assert(
    isFutureYear(2027) === true,
    "Future year should be valid"
  );
  
  console.assert(
    isFutureYear(2025) === false,
    "Past year should be invalid"
  );
  
  console.log("validation.test.ts passed");