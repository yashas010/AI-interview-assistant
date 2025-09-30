import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Upload, Send, Clock, User, Phone, Mail } from 'lucide-react';
import { ResumeUpload } from './ResumeUpload';
import { ChatMessage } from './ChatMessage';
import { Timer } from './Timer';

export function IntervieweeTab() {
  const [currentStep, setCurrentStep] = React.useState('upload'); // upload, info, interview, completed
  const [currentQuestion, setCurrentQuestion] = React.useState(1);
  const totalQuestions = 6;
  
  // Mock data for different states
  const candidateInfo = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567"
  };

  const messages = [
    {
      id: 1,
      type: 'ai',
      content: "Hello! I see you've uploaded your resume. Let me ask you a few questions about React. Are you ready to begin?",
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'user',
      content: "Yes, I'm ready to start the interview.",
      timestamp: new Date()
    },
    {
      id: 3,
      type: 'ai',
      content: "Great! Here's your first question (Easy - 20 seconds):\n\nWhat is the difference between useState and useEffect hooks in React?",
      timestamp: new Date(),
      difficulty: 'Easy',
      timeLimit: 20
    }
  ];

  if (currentStep === 'upload') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="mb-4">Welcome to AI Interview Assistant</h1>
            <p className="text-muted-foreground">
              Please upload your resume to get started. We support PDF and DOCX files.
            </p>
          </div>
          <ResumeUpload onUploadComplete={() => setCurrentStep('info')} />
        </div>
      </div>
    );
  }

  if (currentStep === 'info') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">Name</label>
              <Input value={candidateInfo.name} placeholder="Enter your full name" />
            </div>
            <div>
              <label className="block mb-2">Email</label>
              <Input value={candidateInfo.email} placeholder="Enter your email" />
            </div>
            <div>
              <label className="block mb-2">Phone</label>
              <Input placeholder="Enter your phone number" />
            </div>
            <Button 
              className="w-full" 
              onClick={() => setCurrentStep('interview')}
            >
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'interview') {
    return (
      <div className="h-full flex flex-col">
        {/* Header with progress and info */}
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
              <Timer timeLeft={15} totalTime={20} />
              <Badge variant="secondary">
                Question {currentQuestion} of {totalQuestions}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progress</span>
              <span>{currentQuestion}/{totalQuestions}</span>
            </div>
            <Progress value={(currentQuestion / totalQuestions) * 100} />
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Type your answer here..." 
              className="flex-1"
            />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            Current difficulty: <Badge variant="outline" className="ml-1">Easy</Badge>
            • Time remaining: 15 seconds
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'completed') {
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
                <div className="text-3xl">85/100</div>
                <Badge variant="secondary" className="mt-2">Strong Performance</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}