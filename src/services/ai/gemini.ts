import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
const modelName = (import.meta.env.VITE_GEMINI_MODEL as string) || 'models/gemini-2.5-flash';

if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel({ model: modelName });

// AI Service Configuration
export const AI_CONFIG = {
  model: modelName,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  requestTimeout: 30000, // 30 seconds
  
  // Rate limiting (Gemini Pro limits - free tier)
  rateLimits: {
    requestsPerMinute: 60, // Gemini Pro has higher limits
    requestsPerDay: 1000,
  },
} as const;

// Error types for AI operations
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

// Rate limiting helper
class RateLimiter {
  private requestTimes: number[] = [];
  
  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    return this.requestTimes.length < AI_CONFIG.rateLimits.requestsPerMinute;
  }
  
  recordRequest(): void {
    this.requestTimes.push(Date.now());
  }
  
  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requestTimes);
    const waitTime = (oldestRequest + 60 * 1000) - Date.now();
    return Math.max(0, waitTime);
  }
}

export const rateLimiter = new RateLimiter();

// Generic AI request wrapper with error handling and retries
export async function makeAIRequest<T>(
  requestFn: () => Promise<T>,
  context: string
): Promise<T> {
  // Check rate limiting
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new AIServiceError(
      `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
      'RATE_LIMIT_EXCEEDED',
      true
    );
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      rateLimiter.recordRequest();
      
      const result = await Promise.race([
        requestFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), AI_CONFIG.requestTimeout)
        )
      ]);
      
      return result;
      
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || 
            error.message.includes('PERMISSION_DENIED')) {
          throw new AIServiceError(
            `AI API authentication failed: ${error.message}`,
            'AUTH_ERROR',
            false
          );
        }
        
        if (error.message.includes('QUOTA_EXCEEDED')) {
          throw new AIServiceError(
            'AI API quota exceeded. Please try again later.',
            'QUOTA_EXCEEDED',
            true
          );
        }
      }
      
      // Wait before retry
      if (attempt < AI_CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryDelay * attempt));
      }
    }
  }
  
  throw new AIServiceError(
    `AI request failed after ${AI_CONFIG.maxRetries} attempts: ${lastError?.message}`,
    'REQUEST_FAILED',
    false
  );
}

// Utility to check if AI is available
export async function checkAIAvailability(): Promise<boolean> {
  try {
    await makeAIRequest(async () => {
      const result = await model.generateContent('Test connection');
      return result.response.text();
    }, 'health_check');
    
    return true;
  } catch (error) {
    console.warn('AI service not available:', error);
    return false;
  }
}