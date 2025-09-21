import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Eye, Download, Search, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
import { StudentResult, AnswerKey } from '../App';

interface ResultsDashboardProps {
  results: StudentResult[];
  answerKeys: AnswerKey[];
  onViewResult: (result: StudentResult) => void;
}

export function ResultsDashboard({ results, answerKeys, onViewResult }: ResultsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');

  const filteredResults = results.filter(result => {
    const matchesSearch = result.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'all' || result.examId === selectedExam;
    return matchesSearch && matchesExam;
  });

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string): string => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-500 text-white';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-500 text-white';
    if (grade === 'C') return 'bg-yellow-500 text-black';
    if (grade === 'D') return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const exportAllResults = () => {
    if (filteredResults.length === 0) {
      alert('No results to export');
      return;
    }

    const csvContent = [
      'Student ID,Student Name,Exam,Total Score,Max Marks,Percentage,Grade,Timestamp',
      ...filteredResults.map(result => {
        const answerKey = answerKeys.find(ak => ak.id === result.examId);
        return `${result.studentId},${result.studentName},${answerKey?.examName || 'Unknown'},${result.totalScore},${result.maxMarks},${result.percentage}%,${getGrade(result.percentage)},${result.timestamp.toISOString()}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalStudents = results.length;
  const averagePercentage = results.length > 0 ? 
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
  const topScore = results.length > 0 ? 
    Math.max(...results.map(r => r.percentage)) : 0;
  const passRate = results.length > 0 ? 
    (results.filter(r => r.percentage >= 40).length / results.length) * 100 : 0;

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
          <p className="text-muted-foreground text-center">
            Process some OMR sheets to see results and analytics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{topScore.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Highest Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{passRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Results Overview</CardTitle>
          <CardDescription>View and manage all processed OMR results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  {answerKeys.map(key => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.examName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={exportAllResults} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => {
                const answerKey = answerKeys.find(ak => ak.id === result.examId);
                const grade = getGrade(result.percentage);
                
                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{result.studentName}</div>
                        <div className="text-sm text-muted-foreground">{result.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{answerKey?.examName || 'Unknown'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {result.totalScore} / {result.maxMarks}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{result.percentage}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getGradeColor(grade)} border-0`}>
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => onViewResult(result)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results match your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}