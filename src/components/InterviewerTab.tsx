import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Eye, Download, Filter, ChevronRight } from 'lucide-react';
import { CandidateDetail } from './CandidateDetail';

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

export function InterviewerTab() {
  const [selectedCandidate, setSelectedCandidate] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('score');
  const [filterStatus, setFilterStatus] = React.useState('all');

  // TODO: Get candidates data from Redux store
  const candidates: Candidate[] = []; // Will be populated from Redux store

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (selectedCandidate) {
    const candidate = candidates.find(c => c.id === selectedCandidate);
    return (
      <CandidateDetail 
        candidate={candidate!} 
        onBack={() => setSelectedCandidate(null)} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1>Interview Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and review candidate interviews
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Sort by Score</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl">5</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl">3</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl">85</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl">1</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="mb-1">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Position</p>
                      <Badge variant="outline">{candidate.position}</Badge>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className={`text-xl ${getScoreColor(candidate.score)}`}>
                        {candidate.status === 'completed' ? `${candidate.score}/100` : '-'}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Interview Date</p>
                      <p className="text-sm">
                        {candidate.interviewDate.toLocaleDateString()}
                      </p>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {candidate.summary && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>AI Summary:</strong> {candidate.summary}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}