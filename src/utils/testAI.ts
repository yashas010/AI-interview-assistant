// Test utility to verify AI integration
import { aiService } from '../services/ai';

export async function testAIIntegration() {
  console.log('🧪 Testing AI Integration...');
  
  try {
    // Test 1: Check AI availability
    console.log('1. Checking AI availability...');
    const status = await aiService.checkAvailability();
    console.log('✅ AI Status:', status);
    
    if (status.available) {
      // Test 2: Generate sample questions  
      console.log('2. Testing question generation...');
      const questions = await aiService.generateQuestions();
      console.log('✅ Generated questions:', questions.length);
      console.log('Sample question:', questions[0]);
      
      // Test 3: Test answer evaluation
      console.log('3. Testing answer evaluation...');
      const testAnswer = "React hooks allow functional components to use state and lifecycle methods. useState manages component state while useEffect handles side effects like API calls.";
      
      const evaluation = await aiService.evaluateAnswer(
        questions[0],
        testAnswer,
        15
      );
      console.log('✅ Answer evaluation:', evaluation);
      
      return {
        success: true,
        status,
        questionsGenerated: questions.length,
        sampleEvaluation: evaluation,
      };
    } else {
      return {
        success: false,
        error: status.error || 'AI service not available',
        status,
      };
    }
    
  } catch (error) {
    console.error('❌ AI Integration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}