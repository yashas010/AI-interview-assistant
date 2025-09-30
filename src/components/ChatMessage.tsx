import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Bot, User, Clock } from 'lucide-react';

interface Message {
  id: number;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  timeLimit?: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.type === 'ai';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={isAI ? 'bg-blue-100' : 'bg-green-100'}>
          {isAI ? <Bot className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-green-600" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex-1 ${isAI ? '' : 'flex flex-col items-end'}`}>
        <div className={`max-w-3xl rounded-lg p-4 ${
          isAI 
            ? 'bg-muted text-foreground' 
            : 'bg-primary text-primary-foreground ml-12'
        }`}>
          {message.difficulty && (
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getDifficultyColor(message.difficulty)}>
                {message.difficulty}
              </Badge>
              {message.timeLimit && (
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {message.timeLimit} seconds
                </div>
              )}
            </div>
          )}
          
          <div className="prose prose-sm max-w-none text-inherit">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className={index === 0 ? 'mt-0' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isAI ? '' : 'mr-2'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}