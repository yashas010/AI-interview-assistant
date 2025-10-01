import { model, makeAIRequest, AIServiceError } from './gemini';
import { Answer, InterviewQuestion } from '../../store/types';

// Answer evaluation response interface
interface AnswerEvaluationResult {
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  evaluatedAt: string;
}

// Answer evaluator service
export class AnswerEvaluator {
  // Evaluate a single answer
  static async evaluateAnswer(
    question: InterviewQuestion,
    answer: string,
    timeSpent: number
  ): Promise<AnswerEvaluationResult> {
    const evaluationPrompt = `
You are an expert technical interviewer evaluating a Full Stack Developer candidate's answer.

QUESTION (${question.difficulty.toUpperCase()} - ${question.timeLimit}s limit):
${question.question}

CANDIDATE'S ANSWER:
${answer}

TIME SPENT: ${timeSpent} seconds (out of ${question.timeLimit} seconds)

Evaluate this answer based on:
1. Technical accuracy and correctness
2. Depth of knowledge demonstrated  
3. Practical understanding vs theoretical knowledge
4. Communication clarity
5. Time management (considering difficulty level)

For ${question.difficulty} level questions:
${question.difficulty === 'easy' ? '- Expect clear basic understanding and correct fundamentals' : 
  question.difficulty === 'medium' ? '- Expect practical experience and implementation details' : 
  '- Expect system thinking, trade-offs, and architectural considerations'}

Return ONLY a valid JSON object in this exact format:
{
  "score": 85,
  "feedback": "Good understanding of the concepts with practical examples. Could improve on error handling details.",
  "strengths": ["Clear explanation", "Good examples", "Understands core concepts"],
  "improvements": ["Add error handling details", "Mention performance considerations"]
}

Score Guidelines:
- 90-100: Exceptional answer, demonstrates senior-level understanding
- 75-89: Good answer, shows solid understanding with minor gaps
- 60-74: Adequate answer, basic understanding but missing important details  
- 40-59: Below expectations, significant gaps in knowledge
- 0-39: Poor answer, fundamental misunderstandings or no relevant content

Evaluate objectively and provide constructive feedback.
`;

    try {
      const result = await makeAIRequest(async () => {
        const response = await model.generateContent(evaluationPrompt);
        return response.response.text();
      }, 'evaluate_answer');

      // Parse the JSON response
      const cleanedResponse = result.trim();
      let evaluation;

      try {
        evaluation = JSON.parse(cleanedResponse);
      } catch (parseError) {
        // Try to extract JSON from response if it contains extra text
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluation = JSON.parse(jsonMatch[0]);
        } else {
          throw new AIServiceError(
            'Failed to parse answer evaluation response',
            'PARSE_ERROR',
            true
          );
        }
      }

      // Validate the response structure
      if (
        typeof evaluation.score !== 'number' ||
        typeof evaluation.feedback !== 'string' ||
        !Array.isArray(evaluation.strengths) ||
        !Array.isArray(evaluation.improvements)
      ) {
        throw new AIServiceError(
          'AI returned invalid evaluation structure',
          'INVALID_EVALUATION',
          true
        );
      }

      // Normalize score to 0-100 range
      const normalizedScore = Math.max(0, Math.min(100, Math.round(evaluation.score)));

      return {
        score: normalizedScore,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        evaluatedAt: new Date().toISOString(),
      };

    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        `Answer evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EVALUATION_FAILED',
        true
      );
    }
  }

  // Generate fallback evaluation when AI is unavailable
  static generateFallbackEvaluation(
    question: InterviewQuestion,
    answer: string,
    timeSpent: number
  ): AnswerEvaluationResult {
    // Simple heuristic scoring when AI is unavailable
    let score = 50; // Base score

    // Answer length heuristic (not perfect but reasonable fallback)
    const answerLength = answer.trim().length;
    if (answerLength > 200) score += 15;
    else if (answerLength > 100) score += 10;
    else if (answerLength > 50) score += 5;

    // Time management heuristic
    const timeRatio = timeSpent / question.timeLimit;
    if (timeRatio > 0.8) score -= 10; // Used most of the time
    else if (timeRatio < 0.3) score += 5; // Quick and confident

    // Difficulty adjustment
    if (question.difficulty === 'easy') score += 10;
    else if (question.difficulty === 'hard') score -= 5;

    // Basic keyword detection for technical terms
    const technicalKeywords = [
      'function', 'component', 'react', 'node', 'javascript', 'typescript',
      'api', 'database', 'sql', 'nosql', 'mongodb', 'express', 'async',
      'promise', 'callback', 'event', 'state', 'props', 'hook', 'middleware'
    ];

    const foundKeywords = technicalKeywords.filter(keyword =>
      answer.toLowerCase().includes(keyword)
    );

    score += Math.min(foundKeywords.length * 3, 20);

    // Ensure score is within bounds
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score: finalScore,
      feedback: `Automatic evaluation (AI unavailable). Answer provided covers key concepts with reasonable depth. Consider adding more technical details and examples.`,
      strengths: ['Provided relevant answer', 'Used appropriate terminology'],
      improvements: ['Add more technical details', 'Include specific examples', 'Consider edge cases'],
      evaluatedAt: new Date().toISOString(),
    };
  }

  // Evaluate answer with fallback handling
  static async evaluateAnswerWithFallback(
    question: InterviewQuestion,
    answer: string,
    timeSpent: number
  ): Promise<AnswerEvaluationResult> {
    try {
      return await this.evaluateAnswer(question, answer, timeSpent);
    } catch (error) {
      console.warn('Using fallback evaluation due to AI service error:', error);
      return this.generateFallbackEvaluation(question, answer, timeSpent);
    }
  }

  // Generate final candidate summary
  static async generateCandidateSummary(
    candidateName: string,
    answers: Answer[]
  ): Promise<string> {
    if (answers.length === 0) {
      return 'No answers provided for evaluation.';
    }

    const summaryPrompt = `
Generate a concise professional summary for candidate: ${candidateName}

Interview Performance:
${answers.map((answer, index) => `
Question ${index + 1} (${answer.difficulty}): ${answer.question}
Answer: ${answer.answer}
Score: ${answer.aiScore}/100
Time: ${answer.timeSpent}s / ${answer.timeLimit}s
`).join('\n')}

Overall Score: ${Math.round(answers.reduce((sum, a) => sum + a.aiScore, 0) / answers.length)}/100

Generate a 2-3 sentence professional summary highlighting:
- Overall technical competency level
- Key strengths demonstrated
- Areas for improvement
- Hiring recommendation (Strong Hire / Hire / No Hire)

Return only the summary text, no JSON formatting.
`;

    try {
      const result = await makeAIRequest(async () => {
        const response = await model.generateContent(summaryPrompt);
        return response.response.text();
      }, 'generate_summary');

      return result.trim();

    } catch (error) {
      // Fallback summary generation
      const avgScore = Math.round(answers.reduce((sum, a) => sum + a.aiScore, 0) / answers.length);
      const competencyLevel = avgScore >= 80 ? 'Strong' : avgScore >= 65 ? 'Good' : avgScore >= 50 ? 'Adequate' : 'Below expectations';
      const recommendation = avgScore >= 75 ? 'Hire' : avgScore >= 60 ? 'Consider' : 'No Hire';

      return `${candidateName} demonstrated ${competencyLevel.toLowerCase()} technical competency with an overall score of ${avgScore}/100. Showed understanding of core concepts with room for improvement in advanced topics. Recommendation: ${recommendation}.`;
    }
  }
}