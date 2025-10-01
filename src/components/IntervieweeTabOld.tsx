import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Upload, Send, Clock, User, Phone, Mail, Loader2, FileText, Check } from 'lucide-react';
import { ResumeUpload } from './ResumeUpload';
import { ChatMessage } from './ChatMessage';
import { Timer } from './Timer';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { generateInterviewQuestions, processResumeFile, evaluateCandidateAnswer } from '../store/thunks';
import { startNewSession, nextQuestion, setResumeData, updateTimeRemaining, completeSession } from '../store/slices/interviewSlice';
import { addCandidate, addAnswer } from '../store/slices/candidatesSlice';

export function IntervieweeTab() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    currentSession,
    resumeData,
    isProcessingResume,
    isGeneratingQuestions,
    isEvaluatingAnswer,
    error
  } = useAppSelector((state) => state.interview);

  // Local state
  const [currentStep, setCurrentStep] = React.useState<'upload' | 'info' | 'interview' | 'completed'>('upload');
  const [candidateInfo, setCandidateInfo] = React.useState({
    name: '',
    email: '',
    phone: ''
  });
  const [currentAnswer, setCurrentAnswer] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{
    id: number;
    type: 'ai' | 'user';
    content: string;
    timestamp: Date;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    timeLimit?: number;
  }>>([]);

  // Timer state
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [timerActive, setTimerActive] = React.useState(false);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      await dispatch(processResumeFile(file)).unwrap();
      setCurrentStep('info');
    } catch (error) {
      console.error('Failed to upload resume:', error);
    }
  };

  // Handle candidate info form
  const handleInfoSubmit = () => {
    if (!candidateInfo.name || !candidateInfo.email || !candidateInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Update candidate info
    setCandidateInfo(prev => ({
      ...prev,
      ...resumeData
    }));

    // Start interview
    startInterview();
  };

  // Start the interview process
  const startInterview = async () => {
    try {
      // Generate questions using AI
      const questions = await dispatch(generateInterviewQuestions()).unwrap();
      
      // Create candidate record
      const candidateId = `candidate_${Date.now()}`;
      dispatch(addCandidate({
        name: candidateInfo.name,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        score: 0,
        status: 'in-progress',
        summary: '',
        answers: []
      }));

      // Start interview session
      dispatch(startNewSession({
        candidateId,
        questions
      }));

      // Add initial AI message
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hello ${candidateInfo.name}! I've reviewed your resume. Let's begin the technical interview for the Full Stack Developer position. You'll have 6 questions total: 2 Easy (20s each), 2 Medium (60s each), and 2 Hard (120s each). Are you ready to start?`,
          timestamp: new Date()
        }
      ]);

      setCurrentStep('interview');
    } catch (error) {
      console.error('Failed to start interview:', error);
    }
  };

  // Send the first question
  const sendFirstQuestion = () => {
    if (!currentSession?.questions[0]) return;

    const firstQuestion = currentSession.questions[0];
    setMessages(prev => [...prev, 
      {
        id: 2,
        type: 'user',
        content: "Yes, I'm ready to start!",
        timestamp: new Date()
      },
      {
        id: 3,
        type: 'ai',
        content: `Great! Here's your first question (${firstQuestion.difficulty.toUpperCase()} - ${firstQuestion.timeLimit} seconds):\n\n${firstQuestion.question}`,
        timestamp: new Date(),
        difficulty: firstQuestion.difficulty.charAt(0).toUpperCase() + firstQuestion.difficulty.slice(1) as 'Easy' | 'Medium' | 'Hard',
        timeLimit: firstQuestion.timeLimit
      }
    ]);

    // Start timer
    setTimeLeft(firstQuestion.timeLimit);
    setTimerActive(true);
  };

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (!currentSession || !currentAnswer.trim()) return;

    const currentQ = currentSession.questions[currentSession.currentQuestionIndex];
    const timeSpent = currentQ.timeLimit - timeLeft;

    try {
      // Add user message
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        content: currentAnswer,
        timestamp: new Date()
      }]);

      // Stop timer
      setTimerActive(false);

      // Evaluate answer with AI
      const { evaluation } = await dispatch(evaluateCandidateAnswer({
        question: currentQ,
        answer: currentAnswer,
        timeSpent
      })).unwrap();

      // Add answer to candidate record
      dispatch(addAnswer({
        candidateId: currentSession.candidateId,
        answer: {
          questionId: currentQ.id,
          question: currentQ.question,
          answer: currentAnswer,
          difficulty: currentQ.difficulty,
          timeLimit: currentQ.timeLimit,
          timeSpent,
          aiScore: evaluation.score,
          feedback: evaluation.feedback
        }
      }));

      // Show AI feedback
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: `Thank you for your answer! ${evaluation.feedback}`,
        timestamp: new Date()
      }]);

      // Clear answer input
      setCurrentAnswer('');

      // Move to next question or complete
      if (currentSession.currentQuestionIndex < currentSession.totalQuestions - 1) {
        setTimeout(() => {
          dispatch(nextQuestion());
          sendNextQuestion();
        }, 2000);
      } else {
        setTimeout(() => {
          dispatch(completeSession());
          setCurrentStep('completed');
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  // Send next question
  const sendNextQuestion = () => {
    if (!currentSession) return;
    
    const nextQ = currentSession.questions[currentSession.currentQuestionIndex + 1];
    if (!nextQ) return;

    setMessages(prev => [...prev, {
      id: Date.now() + 2,
      type: 'ai',
      content: `Here's your next question (${nextQ.difficulty.toUpperCase()} - ${nextQ.timeLimit} seconds):\n\n${nextQ.question}`,
      timestamp: new Date(),
      difficulty: nextQ.difficulty.charAt(0).toUpperCase() + nextQ.difficulty.slice(1) as 'Easy' | 'Medium' | 'Hard',
      timeLimit: nextQ.timeLimit
    }]);

    setTimeLeft(nextQ.timeLimit);
    setTimerActive(true);
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            // Auto-submit on timeout
            if (currentStep === 'interview') {
              handleAnswerSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, currentStep]);

  // Update candidate info when resume data changes
  React.useEffect(() => {
    if (resumeData) {
      setCandidateInfo(prev => ({
        ...prev,
        name: resumeData.name || prev.name,
        email: resumeData.email || prev.email,
        phone: resumeData.phone || prev.phone
      }));
    }
  }, [resumeData]);

  // Upload step
  if (currentStep === 'upload') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome to AI Interview</CardTitle>
              <CardDescription>Upload your resume to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUpload 
                onUploadComplete={() => setCurrentStep('info')}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Info completion step
  if (currentStep === 'info') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Information</CardTitle>
              <CardDescription>Please fill in any missing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={candidateInfo.name} 
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={candidateInfo.email}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={candidateInfo.phone}
                  onChange={(e) => setCandidateInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number" 
                />
              </div>
              <Button 
                onClick={handleInfoSubmit} 
                className="w-full"
                disabled={isGeneratingQuestions}
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Interview step
  if (currentStep === 'interview') {
    const currentQuestionNum = currentSession?.currentQuestionIndex ?? 0;
    const totalQuestions = currentSession?.totalQuestions ?? 6;
    const progress = ((currentQuestionNum + 1) / totalQuestions) * 100;

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{candidateInfo.name}</span>
              </div>
              <Badge variant="outline">Full Stack Developer</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Timer timeLeft={timeLeft} totalTime={currentSession?.questions[currentQuestionNum]?.timeLimit || 0} />
              <Badge variant="secondary">
                Question {currentQuestionNum + 1} of {totalQuestions}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progress</span>
              <span>{currentQuestionNum + 1}/{totalQuestions}</span>
            </div>
            <Progress value={progress} />
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {/* Show start button if no questions sent yet */}
          {messages.length === 1 && (
            <div className="text-center">
              <Button onClick={sendFirstQuestion}>
                Begin Interview
              </Button>
            </div>
          )}
        </div>

        {/* Input area */}
        {messages.length > 1 && currentSession && (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input 
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..." 
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnswerSubmit();
                  }
                }}
                disabled={!timerActive || isEvaluatingAnswer}
              />
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!timerActive || !currentAnswer.trim() || isEvaluatingAnswer}
              >
                {isEvaluatingAnswer ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              Current difficulty: <Badge variant="outline" className="ml-1">
                {currentSession.questions[currentQuestionNum]?.difficulty || 'N/A'}
              </Badge>
              • Time remaining: {timeLeft} seconds
            </div>
          </div>
        )}
      </div>
    );
  }

  // Completed step
  if (currentStep === 'completed') {
    const candidate = useAppSelector(state => 
      state.candidates.candidates.find(c => c.id === currentSession?.candidateId)
    );
    
    const totalScore = candidate?.answers.reduce((sum, answer) => sum + answer.aiScore, 0) || 0;
    const averageScore = candidate?.answers.length ? Math.round(totalScore / candidate.answers.length) : 0;

    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Interview Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <p className="text-muted-foreground">
                Thank you for completing the interview. Your responses have been recorded and will be reviewed shortly.
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="mb-2">Your Score</h3>
                <div className="text-3xl">{averageScore}/100</div>
                <Badge variant="secondary" className="mt-2">
                  {averageScore >= 80 ? 'Excellent' : averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}