/**
 * MoneyMentor AI
 * Feature: AI Financial Coach
 * Test Case: Validate chat input
 */

function validateChatMessage(message: string): boolean {
    return message.trim().length > 0;
  }
  
  // Test 1: Valid message
  console.assert(
    validateChatMessage("What is compound interest?") === true,
    "Valid chat message should pass validation"
  );
  
  // Test 2: Empty message
  console.assert(
    validateChatMessage("") === false,
    "Empty chat message should fail validation"
  );
  
  console.log("chat.test.ts passed");