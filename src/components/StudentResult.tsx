import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Download, CheckCircle, XCircle } from 'lucide-react';
import { StudentResult as StudentResultType, AnswerKey } from '../App';

interface StudentResultProps {
  result: StudentResultType;
  answerKey: AnswerKey;
  onBack: () => void;
}

export function StudentResult({ result, answerKey, onBack }: StudentResultProps) {
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
    if (grade === 'A+' || grade === 'A') return 'bg-green-500';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-500';
    if (grade === 'C') return 'bg-yellow-500';
    if (grade === 'D') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const exportResult = () => {
    const csvContent = [
      'Student ID,Student Name,Exam,Subject,Score,Max Marks,Percentage',
      ...answerKey.subjects.map(subject => 
        `${result.studentId},${result.studentName},${answerKey.examName},${subject.name},${result.scores[subject.name]},${subject.maxMarks},${((result.scores[subject.name] / subject.maxMarks) * 100).toFixed(1)}%`
      ),
      `${result.studentId},${result.studentName},${answerKey.examName},Total,${result.totalScore},${result.maxMarks},${result.percentage}%`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.studentId}_${answerKey.examName}_result.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const grade = getGrade(result.percentage);
  const correctAnswers = Object.keys(result.answers).filter(q => 
    result.answers[parseInt(q)] === answerKey.answers[parseInt(q)]
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button onClick={exportResult} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Result
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium">{result.studentId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="font-medium">{result.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exam</p>
              <p className="font-medium">{answerKey.examName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processed</p>
              <p className="font-medium">{result.timestamp.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white ${getGradeColor(grade)} mb-2`}>
                <span className="text-xl font-bold">{grade}</span>
              </div>
              <p className="text-2xl font-bold">{result.percentage}%</p>
              <p className="text-sm text-muted-foreground">
                {result.totalScore} / {result.maxMarks} marks
              </p>
            </div>
            <Progress value={result.percentage} className="w-full" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {correctAnswers} correct • {answerKey.totalQuestions - correctAnswers} wrong/blank
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Correct Answers</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {correctAnswers}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Wrong/Blank Answers</span>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {answerKey.totalQuestions - correctAnswers}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Questions Attempted</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {Object.keys(result.answers).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Overall Accuracy</span>
              <Badge variant="outline">
                {((correctAnswers / answerKey.totalQuestions) * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>Detailed breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {answerKey.subjects.map(subject => {
                const subjectScore = result.scores[subject.name];
                const subjectPercentage = (subjectScore / subject.maxMarks) * 100;
                const questionsInSubject = subject.questionRange[1] - subject.questionRange[0] + 1;
                let correctInSubject = 0;
                
                for (let q = subject.questionRange[0]; q <= subject.questionRange[1]; q++) {
                  if (result.answers[q] === answerKey.answers[q]) {
                    correctInSubject++;
                  }
                }

                return (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{subject.name}</h4>
                      <div className="text-right">
                        <p className="font-bold">{subjectScore} / {subject.maxMarks}</p>
                        <p className="text-sm text-muted-foreground">{subjectPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress value={subjectPercentage} className="w-full" />
                    <p className="text-xs text-muted-foreground">
                      Questions {subject.questionRange[0]}-{subject.questionRange[1]} 
                      • {correctInSubject}/{questionsInSubject} correct
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Answer Sheet Review</CardTitle>
            <CardDescription>Your responses vs correct answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto">
              {Array.from({ length: answerKey.totalQuestions }, (_, i) => {
                const questionNumber = i + 1;
                const studentAnswer = result.answers[questionNumber];
                const correctAnswer = answerKey.answers[questionNumber];
                const isCorrect = studentAnswer === correctAnswer;

                const isBlank = !studentAnswer;
                let bgColor, borderColor, textColor, icon;
                
                // Blank answers are considered WRONG since student missed the question
                if (isCorrect && !isBlank) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-200';
                  textColor = 'text-green-700';
                  icon = <CheckCircle className="w-3 h-3" />;
                } else {
                  // Both wrong answers AND blank answers are marked as incorrect
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                  textColor = 'text-red-700';
                  icon = <XCircle className="w-3 h-3" />;
                }

                return (
                  <div
                    key={questionNumber}
                    className={`p-2 rounded text-center text-sm border ${bgColor} ${borderColor} ${textColor}`}
                  >
                    <div className="font-medium">Q{questionNumber}</div>
                    <div className="flex items-center justify-center mt-1">
                      {icon}
                    </div>
                    <div className="text-xs mt-1">
                      <div>You: {studentAnswer || '-'}</div>
                      <div>Ans: {correctAnswer}</div>
                      {isBlank && (
                        <div className="text-red-600 font-medium">BLANK</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}