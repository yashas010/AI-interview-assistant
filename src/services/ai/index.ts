// Main AI Service integration
export { checkAIAvailability, AIServiceError } from './gemini';
export { QuestionGenerator } from './questionGenerator';
export { AnswerEvaluator } from './answerEvaluator';

// Import types for internal use
import type { InterviewQuestion, Answer } from '../../store/types';

// Re-export types for convenience
export type { InterviewQuestion, Answer } from '../../store/types';

// AI Service Status
export interface AIServiceStatus {
  available: boolean;
  model: string;
  lastChecked: string;
  error?: string;
}

// Main AI Service class
export class AIService {
  private static instance: AIService;
  private status: AIServiceStatus = {
    available: false,
    model: 'gemini-pro',
    lastChecked: new Date().toISOString(),
  };

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Check if AI services are available
  async checkAvailability(): Promise<AIServiceStatus> {
    try {
      const { checkAIAvailability } = await import('./gemini');
      const available = await checkAIAvailability();
      
      this.status = {
        available,
        model: 'gemini-pro',
        lastChecked: new Date().toISOString(),
      };
      
      if (!available) {
        this.status.error = 'AI service connection failed';
      }
      
    } catch (error) {
      this.status = {
        available: false,
        model: 'gemini-pro',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
    
    return this.status;
  }

  // Get current AI service status
  getStatus(): AIServiceStatus {
    return { ...this.status };
  }

  // Generate interview questions
  async generateQuestions(): Promise<InterviewQuestion[]> {
    const { QuestionGenerator } = await import('./questionGenerator');
    return QuestionGenerator.generateQuestionsWithFallback();
  }

  // Evaluate an answer
  async evaluateAnswer(
    question: InterviewQuestion,
    answer: string,
    timeSpent: number
  ): Promise<{ score: number; feedback: string }> {
    const { AnswerEvaluator } = await import('./answerEvaluator');
    const evaluation = await AnswerEvaluator.evaluateAnswerWithFallback(
      question,
      answer,
      timeSpent
    );
    
    return {
      score: evaluation.score,
      feedback: evaluation.feedback,
    };
  }

  // Generate candidate summary
  async generateSummary(candidateName: string, answers: Answer[]): Promise<string> {
    const { AnswerEvaluator } = await import('./answerEvaluator');
    return AnswerEvaluator.generateCandidateSummary(candidateName, answers);
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();