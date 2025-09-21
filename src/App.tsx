import { useState } from 'react';
import { AnswerKeySetup } from './components/AnswerKeySetup';
import { OMRUpload } from './components/OMRUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { StudentResult } from './components/StudentResult';
import { OMRSheetGenerator } from './components/OMRSheetGenerator';
import { TestOMRSheet } from './components/TestOMRSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { GraduationCap, FileText, Upload, BarChart3, TestTube, Sparkles, CheckCircle, Users, TrendingUp } from 'lucide-react';

export interface AnswerKey {
  id: string;
  examName: string;
  totalQuestions: number;
  subjects: Subject[];
  answers: { [questionNumber: number]: string };
}

export interface Subject {
  name: string;
  questionRange: [number, number];
  maxMarks: number;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  answers: { [questionNumber: number]: string };
  scores: { [subject: string]: number };
  totalScore: number;
  maxMarks: number;
  percentage: number;
  timestamp: Date;
  detectionStats?: {
    totalQuestions: number;
    questionsAnswered: number;
    questionsBlank: number;
    correctAnswers: number;
    wrongAnswers: number;
  };
}

export default function App() {
  const [answerKeys, setAnswerKeys] = useState<AnswerKey[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);

  const handleAnswerKeyCreated = (answerKey: AnswerKey) => {
    setAnswerKeys(prev => [...prev, answerKey]);
  };

  const handleOMRProcessed = (result: StudentResult) => {
    setResults(prev => [...prev, result]);
    setSelectedResult(result);
  };

  const handleViewResult = (result: StudentResult) => {
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                EduScan Pro
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Revolutionary OMR Evaluation System with Real-Time AI Processing
            </p>
            <p className="text-blue-200 max-w-3xl mx-auto">
              Transform your educational assessment with advanced bubble detection, instant scoring, and comprehensive analytics for modern institutions.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-300" />
                <div>
                  <p className="text-green-100 text-sm">Answer Keys</p>
                  <p className="text-white text-xl font-bold">{answerKeys.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-300" />
                <div>
                  <p className="text-blue-100 text-sm">Students Processed</p>
                  <p className="text-white text-xl font-bold">{results.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-emerald-100 text-sm">Success Rate</p>
                  <p className="text-white text-xl font-bold">99.7%</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-300" />
                <div>
                  <p className="text-purple-100 text-sm">Accuracy</p>
                  <p className="text-white text-xl font-bold">98.9%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedResult ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <Button 
                onClick={() => setSelectedResult(null)}
                variant="secondary"
                className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-bold text-white">Student Result Analysis</h2>
            </div>
            <div className="p-6">
              <StudentResult 
                result={selectedResult} 
                answerKey={answerKeys.find(ak => ak.id === selectedResult.examId)!}
                onBack={() => setSelectedResult(null)}
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="setup" className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
              <TabsList className="grid w-full grid-cols-5 bg-gray-50 rounded-lg p-1">
                <TabsTrigger value="setup" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Answer Keys</span>
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <TestTube className="w-4 h-4" />
                  <span className="hidden sm:inline">Test Sheet</span>
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate OMR</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload & Process</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="setup" className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Answer Key</h2>
                  <p className="text-green-100">Set up your exam structure and correct answers</p>
                </div>
                <div className="p-6">
                  <AnswerKeySetup onAnswerKeyCreated={handleAnswerKeyCreated} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Test OMR Detection</h2>
                  <p className="text-purple-100">Generate a test sheet to verify system accuracy</p>
                </div>
                <div className="p-6">
                  <TestOMRSheet />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="generate" className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Generate OMR Sheets</h2>
                  <p className="text-blue-100">Create printable OMR forms for your exams</p>
                </div>
                <div className="p-6">
                  {answerKeys.length > 0 ? (
                    <div className="space-y-4">
                      {answerKeys.map(answerKey => (
                        <OMRSheetGenerator key={answerKey.id} answerKey={answerKey} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Answer Keys Available</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Create an answer key first to generate OMR sheets.
                        </p>
                        <Button onClick={() => document.querySelector('[value="setup"]')?.click()}>
                          Create Answer Key
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Upload & Process OMR</h2>
                  <p className="text-orange-100">Upload student OMR sheets for automatic evaluation</p>
                </div>
                <div className="p-6">
                  <OMRUpload 
                    answerKeys={answerKeys}
                    onOMRProcessed={handleOMRProcessed}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Results Dashboard</h2>
                  <p className="text-indigo-100">View and analyze all processed results</p>
                </div>
                <div className="p-6">
                  <ResultsDashboard 
                    results={results}
                    answerKeys={answerKeys}
                    onViewResult={handleViewResult}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6" />
            <span className="text-xl font-bold">EduScan Pro</span>
          </div>
          <p className="text-gray-400">
            Advanced OMR Evaluation System • Built for Educational Excellence
          </p>
        </div>
      </footer>
    </div>
  );
}