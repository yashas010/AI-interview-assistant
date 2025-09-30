import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { ArrowLeft, Download, Mail, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: 'completed' | 'in-progress' | 'pending';
  interviewDate: Date;
  summary: string;
  position: string;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  timeSpent: number;
  score: number;
  feedback: string;
}

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
}

export function CandidateDetail({ candidate, onBack }: CandidateDetailProps) {
  // TODO: Get questions data from Redux store
  const questions: Question[] = []; // Will be populated from Redux store

  const averageScore = Math.round(questions.reduce((sum, q) => sum + q.score, 0) / questions.length);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1>Candidate Details</h1>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="mb-2">{candidate.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {candidate.phone}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{candidate.position}</Badge>
                <Badge className={candidate.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {candidate.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="border-b p-6">
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2 text-blue-600">{averageScore}/100</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2 text-green-600">{questions.length}</div>
              <p className="text-sm text-muted-foreground">Questions Answered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2 text-yellow-600">
                {Math.round(questions.reduce((sum, q) => sum + q.timeSpent, 0) / 60)}m
              </div>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2 text-purple-600">
                {candidate.interviewDate.toLocaleDateString()}
              </div>
              <p className="text-sm text-muted-foreground">Interview Date</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Summary */}
      <div className="border-b p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 AI Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{candidate.summary}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 mb-1">Strong Areas</div>
                <div className="text-sm text-muted-foreground">React Hooks, State Management</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-yellow-600 mb-1">Improvement Areas</div>
                <div className="text-sm text-muted-foreground">Performance Optimization</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-1">Recommendation</div>
                <div className="text-sm text-muted-foreground">Strong Hire</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions and Answers */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="mb-6">Interview Questions & Responses</h3>
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Question {question.id}</Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {question.timeSpent}s / {question.timeLimit}s
                      </div>
                    </div>
                    <CardTitle className="text-base mb-3">{question.question}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl ${getScoreColor(question.score)}`}>
                      {question.score}/100
                    </div>
                    {question.score >= 80 ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mx-auto mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mx-auto mt-1" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2">Candidate Response:</h4>
                    <p className="text-muted-foreground p-3 bg-muted rounded-lg">
                      {question.answer}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2">AI Feedback:</h4>
                    <p className="text-muted-foreground p-3 bg-blue-50 rounded-lg">
                      {question.feedback}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span>Time Efficiency: </span>
                      <Progress 
                        value={(question.timeSpent / question.timeLimit) * 100} 
                        className="w-24 h-2"
                      />
                      <span>{Math.round((question.timeSpent / question.timeLimit) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}