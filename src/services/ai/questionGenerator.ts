import { model, makeAIRequest, AIServiceError } from './gemini';
import { InterviewQuestion } from '../../store/types';

// Question generation prompts
const QUESTION_GENERATION_PROMPT = `
You are an expert technical interviewer for Full Stack Developer positions focusing on React and Node.js.

Generate exactly 6 interview questions with the following structure:
- 2 Easy questions (20 seconds each): React basics, JavaScript fundamentals
- 2 Medium questions (60 seconds each): Node.js, APIs, Database concepts  
- 2 Hard questions (120 seconds each): System design, Architecture, Advanced concepts

Requirements:
- Questions should test practical knowledge, not just theory
- Include a mix of coding concepts, problem-solving, and architecture
- Make questions specific to Full Stack development with React/Node.js
- Ensure progressive difficulty from Easy to Hard

Return ONLY a valid JSON array in this exact format:
[
  {
    "id": "q1",
    "question": "What is the difference between useState and useEffect hooks in React?",
    "difficulty": "easy",
    "timeLimit": 20
  },
  {
    "id": "q2", 
    "question": "Explain how you would handle form validation in React.",
    "difficulty": "easy",
    "timeLimit": 20
  },
  {
    "id": "q3",
    "question": "How would you implement authentication in a Node.js API?", 
    "difficulty": "medium",
    "timeLimit": 60
  },
  {
    "id": "q4",
    "question": "Describe how you would optimize database queries in a Node.js application.",
    "difficulty": "medium", 
    "timeLimit": 60
  },
  {
    "id": "q5",
    "question": "Design a scalable real-time chat application architecture using React and Node.js.",
    "difficulty": "hard",
    "timeLimit": 120
  },
  {
    "id": "q6",
    "question": "How would you handle microservices communication and error handling in a distributed system?",
    "difficulty": "hard",
    "timeLimit": 120
  }
]

Generate 6 new unique questions following this structure.
`;

// Interface for generated questions response
interface GeneratedQuestionsResponse {
  questions: InterviewQuestion[];
  generatedAt: string;
}

// Question generator service
export class QuestionGenerator {
  // Generate a full set of 6 interview questions
  static async generateInterviewQuestions(): Promise<GeneratedQuestionsResponse> {
    try {
      const result = await makeAIRequest(async () => {
        const response = await model.generateContent(QUESTION_GENERATION_PROMPT);
        return response.response.text();
      }, 'generate_questions');

      // Parse the JSON response
      const cleanedResponse = result.trim();
      let parsedQuestions;
      
      try {
        parsedQuestions = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Try to extract JSON from response if it contains extra text
        const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new AIServiceError(
            'Failed to parse AI response as JSON',
            'PARSE_ERROR',
            true
          );
        }
      }

      // Validate the response structure
      if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 6) {
        throw new AIServiceError(
          'AI generated invalid number of questions',
          'INVALID_RESPONSE',
          true
        );
      }

      // Validate each question
      const questions: InterviewQuestion[] = parsedQuestions.map((q, index) => {
        if (!q.question || !q.difficulty || typeof q.timeLimit !== 'number') {
          throw new AIServiceError(
            `Invalid question structure at index ${index}`,
            'INVALID_QUESTION',
            true
          );
        }

        return {
          id: q.id || `q${index + 1}`,
          question: q.question,
          difficulty: q.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
          timeLimit: q.timeLimit,
        };
      });

      // Verify difficulty distribution
      const difficulties = questions.map(q => q.difficulty);
      const easyCount = difficulties.filter(d => d === 'easy').length;
      const mediumCount = difficulties.filter(d => d === 'medium').length;
      const hardCount = difficulties.filter(d => d === 'hard').length;

      if (easyCount !== 2 || mediumCount !== 2 || hardCount !== 2) {
        console.warn('Question difficulty distribution not optimal:', {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount
        });
      }

      return {
        questions,
        generatedAt: new Date().toISOString(),
      };

    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      throw new AIServiceError(
        `Question generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GENERATION_FAILED',
        true
      );
    }
  }

  // Generate a fallback set of questions if AI is unavailable
  static getFallbackQuestions(): InterviewQuestion[] {
    return [
      {
        id: 'fallback_q1',
        question: 'What is the difference between useState and useEffect hooks in React?',
        difficulty: 'easy',
        timeLimit: 20,
      },
      {
        id: 'fallback_q2',
        question: 'Explain the concept of props drilling and how you would solve it.',
        difficulty: 'easy',
        timeLimit: 20,
      },
      {
        id: 'fallback_q3',
        question: 'How would you implement JWT authentication in a Node.js Express application?',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'fallback_q4',
        question: 'Describe how you would optimize React application performance.',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'fallback_q5',
        question: 'Design a scalable file upload system for a web application.',
        difficulty: 'hard',
        timeLimit: 120,
      },
      {
        id: 'fallback_q6',
        question: 'How would you implement real-time features in a React/Node.js application?',
        difficulty: 'hard',
        timeLimit: 120,
      },
    ];
  }

  // Generate questions with fallback handling
  static async generateQuestionsWithFallback(): Promise<InterviewQuestion[]> {
    try {
      const result = await this.generateInterviewQuestions();
      return result.questions;
    } catch (error) {
      console.warn('Using fallback questions due to AI service error:', error);
      return this.getFallbackQuestions();
    }
  }
}