import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { IntervieweeTab } from './components/IntervieweeTab';
import { InterviewerTab } from './components/InterviewerTab';
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { MessageSquare, BarChart3 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setActiveTab, setShowWelcomeModal } from './store/slices/appSlice';
import { clearSession } from './store/slices/interviewSlice';
import { selectActiveTab, selectShowWelcomeModal } from './store/selectors';

export default function App() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const showWelcomeModal = useAppSelector(selectShowWelcomeModal);

  const handleResumeSession = () => {
    dispatch(setShowWelcomeModal(false));
    dispatch(setActiveTab('interviewee'));
  };

  const handleStartNew = () => {
    dispatch(clearSession()); // Clear any existing session
    dispatch(setShowWelcomeModal(false));
    dispatch(setActiveTab('interviewee'));
  };

  return (
    <div className="h-screen bg-background">
      <WelcomeBackModal
        isOpen={showWelcomeModal}
        onResume={handleResumeSession}
        onStartNew={handleStartNew}
        onClose={() => dispatch(setShowWelcomeModal(false))}
      />

      <Tabs value={activeTab} onValueChange={(value: string) => dispatch(setActiveTab(value as 'interviewee' | 'interviewer'))} className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground">🤖</span>
                </div>
                <div>
                  <h1 className="text-lg">AI Interview Assistant</h1>
                  <p className="text-xs text-muted-foreground">Powered by AI • Real-time Assessment</p>
                </div>
              </div>

              <TabsList className="grid w-96 grid-cols-2">
                <TabsTrigger value="interviewee" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Interviewee
                </TabsTrigger>
                <TabsTrigger value="interviewer" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Interviewer
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="interviewee" className="h-full m-0">
            <IntervieweeTab />
          </TabsContent>
          
          <TabsContent value="interviewer" className="h-full m-0">
            <InterviewerTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}