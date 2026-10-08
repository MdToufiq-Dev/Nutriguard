import { llmService } from '../services/llmService.js';

/**
 * Simple evaluation harness for LLM responses
 */
async function runEvals() {
  const testCases = [
    {
      prompt: 'What is a healthy breakfast containing oats?',
      expectedKeywords: ['oats', 'healthy', 'fiber']
    },
    {
      prompt: 'Is an apple a good snack?',
      expectedKeywords: ['yes', 'apple', 'healthy']
    }
  ];

  console.log(`Starting evaluation with provider: ${llmService.provider}`);

  for (const testCase of testCases) {
    console.log(`\nPrompt: ${testCase.prompt}`);
    try {
      const response = await llmService.chat([{ role: 'user', content: testCase.prompt }]);
      const content = response.content.toLowerCase();
      console.log(`Response: ${response.content}`);

      const passed = testCase.expectedKeywords.every(keyword => content.includes(keyword.toLowerCase()));
      console.log(`Result: ${passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`Error during evaluation: ${error.message}`);
    }
  }
}

runEvals().catch(console.error);
