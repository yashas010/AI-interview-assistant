import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Clock, User, RotateCcw, Trash2 } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectHasIncompleteSession } from '../store/selectors';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartNew: () => void;
  onClose: () => void;
}

export function WelcomeBackModal({ isOpen, onResume, onStartNew, onClose }: WelcomeBackModalProps) {
  const hasIncompleteSession = useAppSelector(selectHasIncompleteSession);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-600" />
            Welcome to AI Interview Assistant
          </DialogTitle>
          <DialogDescription>
            {hasIncompleteSession 
              ? "We found an unfinished interview session. You can continue where you left off or start a new interview."
              : "Ready to start your AI-powered interview? Let's get started!"
            }
          </DialogDescription>
        </DialogHeader>

        {hasIncompleteSession ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">Previous Session</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Session in progress
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Full Stack Developer
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Upload your resume and start your interview when you're ready.
            </p>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {hasIncompleteSession && (
            <Button variant="outline" onClick={onStartNew} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Start New Interview
            </Button>
          )}
          <Button onClick={hasIncompleteSession ? onResume : onStartNew} className="flex items-center gap-2">
            {hasIncompleteSession ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Continue Interview
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Start Interview
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}