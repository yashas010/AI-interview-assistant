import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  onUploadComplete: () => void;
  onFileSelect?: (file: File) => void;
}

export function ResumeUpload({ onUploadComplete, onFileSelect }: ResumeUploadProps) {
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [fileName, setFileName] = React.useState('');
  const [extractedData, setExtractedData] = React.useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Call the file handler if provided
    if (onFileSelect) {
      onFileSelect(file);
    }

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadStatus('processing');
          
          // Simulate processing
          setTimeout(() => {
            setExtractedData({
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+1 (555) 123-4567'
            });
            setUploadStatus('success');
          }, 2000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleContinue = () => {
    onUploadComplete();
  };

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          {uploadStatus === 'idle' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <Upload className="h-12 w-12" />
              </div>
              <h3 className="mb-2">Upload Your Resume</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your resume here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: PDF, DOCX (Max 10MB)
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-blue-600 mb-4">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="mb-2">Uploading Resume</h3>
              <p className="text-muted-foreground mb-4">{fileName}</p>
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          )}

          {uploadStatus === 'processing' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-yellow-600 mb-4">
                <div className="animate-spin">⚙️</div>
              </div>
              <h3 className="mb-2">Processing Resume</h3>
              <p className="text-muted-foreground mb-4">
                Extracting information from your resume...
              </p>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-green-600 mb-4">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h3 className="mb-2">Resume Processed Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                We've extracted the following information:
              </p>
              
              <div className="text-left max-w-md mx-auto space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Name:</span>
                  <span>{extractedData.name}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Email:</span>
                  <span>{extractedData.email}</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>Phone:</span>
                  <span>{extractedData.phone}</span>
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full">
                Continue to Interview
              </Button>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-600 mb-4">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h3 className="mb-2">Upload Failed</h3>
              <p className="text-muted-foreground mb-4">
                There was an error processing your resume. Please try again.
              </p>
              <Button onClick={() => setUploadStatus('idle')} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadStatus === 'idle' && (
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Tip: Make sure your resume includes your contact information for the best experience</p>
        </div>
      )}
    </div>
  );
}