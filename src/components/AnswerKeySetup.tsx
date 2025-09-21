import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { AnswerKey, Subject } from '../App';

interface AnswerKeySetupProps {
  onAnswerKeyCreated: (answerKey: AnswerKey) => void;
}

export function AnswerKeySetup({ onAnswerKeyCreated }: AnswerKeySetupProps) {
  const [examName, setExamName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: 'Mathematics', questionRange: [1, 20], maxMarks: 40 },
    { name: 'Physics', questionRange: [21, 35], maxMarks: 30 },
    { name: 'Chemistry', questionRange: [36, 50], maxMarks: 30 }
  ]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const addSubject = () => {
    const lastSubject = subjects[subjects.length - 1];
    const nextStart = lastSubject ? lastSubject.questionRange[1] + 1 : 1;
    setSubjects(prev => [...prev, {
      name: '',
      questionRange: [nextStart, nextStart + 9],
      maxMarks: 20
    }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof Subject, value: any) => {
    setSubjects(prev => prev.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    ));
  };

  const setAnswerForQuestion = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const generateRandomAnswers = () => {
    const options = ['A', 'B', 'C', 'D'];
    const newAnswers: { [key: number]: string } = {};
    for (let i = 1; i <= totalQuestions; i++) {
      newAnswers[i] = options[Math.floor(Math.random() * options.length)];
    }
    setAnswers(newAnswers);
  };

  const createAnswerKey = () => {
    if (!examName.trim()) {
      alert('Please enter exam name');
      return;
    }

    if (subjects.some(s => !s.name.trim())) {
      alert('Please fill all subject names');
      return;
    }

    const answerKey: AnswerKey = {
      id: Date.now().toString(),
      examName: examName.trim(),
      totalQuestions,
      subjects,
      answers
    };

    onAnswerKeyCreated(answerKey);
    
    // Reset form
    setExamName('');
    setAnswers({});
    alert(`Answer key for "${answerKey.examName}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Answer Key</CardTitle>
          <CardDescription>Set up the answer key before processing OMR sheets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Physics Mid-term 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalQuestions">Total Questions</Label>
              <Input
                id="totalQuestions"
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                min="1"
                max="200"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Subjects Configuration</h3>
              <Button onClick={addSubject} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>

            {subjects.map((subject, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      value={subject.name}
                      onChange={(e) => updateSubject(index, 'name', e.target.value)}
                      placeholder="Subject name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Question</Label>
                    <Input
                      type="number"
                      value={subject.questionRange[0]}
                      onChange={(e) => updateSubject(index, 'questionRange', [Number(e.target.value), subject.questionRange[1]])}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Question</Label>
                    <Input
                      type="number"
                      value={subject.questionRange[1]}
                      onChange={(e) => updateSubject(index, 'questionRange', [subject.questionRange[0], Number(e.target.value)])}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Marks</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={subject.maxMarks}
                        onChange={(e) => updateSubject(index, 'maxMarks', Number(e.target.value))}
                        min="1"
                      />
                      {subjects.length > 1 && (
                        <Button
                          onClick={() => removeSubject(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3>Answer Key</h3>
              <Button onClick={generateRandomAnswers} variant="outline" size="sm">
                Generate Random Answers
              </Button>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const questionNumber = i + 1;
                return (
                  <div key={questionNumber} className="space-y-1">
                    <Label className="text-xs">Q{questionNumber}</Label>
                    <Select
                      value={answers[questionNumber] || ''}
                      onValueChange={(value) => setAnswerForQuestion(questionNumber, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <div className="text-sm text-muted-foreground">
              Answers filled: {Object.keys(answers).length} / {totalQuestions}
            </div>
          </div>

          <Button 
            onClick={createAnswerKey} 
            className="w-full"
            disabled={Object.keys(answers).length !== totalQuestions}
          >
            Create Answer Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}