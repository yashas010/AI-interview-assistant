import { createAsyncThunk } from '@reduxjs/toolkit';
import { QuestionGenerator } from '../services/ai/questionGenerator';
import { AnswerEvaluator } from '../services/ai/answerEvaluator';
import { InterviewQuestion } from './types';

// Thunk to generate interview questions using AI
export const generateInterviewQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const questions = await QuestionGenerator.generateQuestionsWithFallback();
      return questions;
    } catch (error) {
      console.error('Failed to generate questions:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate questions');
    }
  }
);

// Thunk to evaluate candidate's answer using AI
export const evaluateCandidateAnswer = createAsyncThunk(
  'interview/evaluateAnswer',
  async (
    {
      question,
      answer,
      timeSpent
    }: {
      question: InterviewQuestion;
      answer: string;
      timeSpent: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const evaluation = await AnswerEvaluator.evaluateAnswer(question, answer, timeSpent);
      return {
        questionId: question.id,
        evaluation
      };
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to evaluate answer');
    }
  }
);

// Thunk to process resume file and extract data
export const processResumeFile = createAsyncThunk(
  'interview/processResume',
  async (file: File, { rejectWithValue }) => {
    try {
      // For now, return basic file info - we'll implement full parsing later
      const resumeData = {
        name: '',
        email: '',
        phone: '',
        extractedText: `File: ${file.name} (${file.size} bytes)`
      };

      return resumeData;
    } catch (error) {
      console.error('Failed to process resume:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process resume file');
    }
  }
);