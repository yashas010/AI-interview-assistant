import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Clock, User, RotateCcw, Trash2, TestTube, Loader2 } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectHasIncompleteSession } from '../store/selectors';
import { testAIIntegration } from '../utils/testAI';
import { listAvailableModels } from '../utils/testModels';

interface WelcomeBackModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartNew: () => void;
  onClose: () => void;
}

export function WelcomeBackModal({ isOpen, onResume, onStartNew, onClose }: WelcomeBackModalProps) {
  const hasIncompleteSession = useAppSelector(selectHasIncompleteSession);
  const [isTestingAI, setIsTestingAI] = React.useState(false);
  const [testResults, setTestResults] = React.useState<any>(null);

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setTestResults(null);
    
    try {
      console.log('🔍 First, let\'s find a working model...');
      const modelTest = await listAvailableModels();
      
      if (modelTest && modelTest.success) {
        console.log('✅ Found working model:', modelTest.workingModel);
        setTestResults({
          success: true,
          workingModel: modelTest.workingModel,
          response: modelTest.response
        });
      } else {
        setTestResults({
          success: false,
          error: modelTest?.error || 'No working models found'
        });
      }
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsTestingAI(false);
    }
  };

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
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Upload your resume and start your interview when you're ready.
              </p>
            </div>
            
            {/* AI Test Section */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TestTube className="h-4 w-4 text-blue-600" />
                Test AI Integration
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Test if Gemini AI is working properly for question generation and answer evaluation.
              </p>
              
              <Button 
                onClick={handleTestAI} 
                disabled={isTestingAI}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isTestingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing AI Connection...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test AI Services
                  </>
                )}
              </Button>
              
              {testResults && (
                <div className={`mt-3 p-3 rounded text-sm ${
                  testResults.success 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {testResults.success ? (
                    <div>
                      <p className="font-medium">✅ AI Connection Working!</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• Working Model: {testResults.workingModel}</li>
                        <li>• API Response: {testResults.response?.substring(0, 50)}...</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">❌ AI Test Failed</p>
                      <p className="text-xs mt-1">Error: {testResults.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
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