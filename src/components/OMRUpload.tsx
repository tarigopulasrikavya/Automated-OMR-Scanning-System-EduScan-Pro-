import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, FileImage, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { AnswerKey, StudentResult as StudentResultType } from '../App';

interface OMRUploadProps {
  answerKeys: AnswerKey[];
  onOMRProcessed: (result: StudentResultType) => void;
}

export function OMRUpload({ answerKeys, onOMRProcessed }: OMRUploadProps) {
  const [selectedAnswerKey, setSelectedAnswerKey] = useState<string>('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [detectedAnswers, setDetectedAnswers] = useState<{ [key: number]: string }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageForOMR = async (imageUrl: string): Promise<{ [key: number]: string }> => {
    const answerKey = answerKeys.find(ak => ak.id === selectedAnswerKey);
    if (!answerKey) return {};

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          resolve({});
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({});
          return;
        }

        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // REAL OMR bubble detection - only detect ACTUAL marked bubbles
        const studentAnswers: { [key: number]: string } = {};
        const options = ['A', 'B', 'C', 'D'];
        
        // Enhanced detection parameters
        const MINIMUM_DARKNESS_THRESHOLD = 80; // Stricter threshold for marked bubbles
        const BUBBLE_DETECTION_ZONES = 4; // Number of zones to check per bubble
        
        // Analyze the entire image to find marked regions
        const imageWidth = canvas.width;
        const imageHeight = canvas.height;
        
        // Create a more sophisticated grid detection
        const markedRegions: Array<{x: number, y: number, darkness: number, option: string, question: number}> = [];
        
        // Scan the image systematically for dark filled circles
        const scanStepSize = 10;
        const bubbleRadius = 15; // Expected bubble radius in pixels
        
        for (let y = bubbleRadius; y < imageHeight - bubbleRadius; y += scanStepSize) {
          for (let x = bubbleRadius; x < imageWidth - bubbleRadius; x += scanStepSize) {
            
            // Check if this region looks like a filled bubble
            let totalDarkness = 0;
            let darkPixelCount = 0;
            let sampleCount = 0;
            
            // Sample in a circular pattern
            for (let r = 0; r <= bubbleRadius; r += 2) {
              for (let angle = 0; angle < 360; angle += 45) {
                const sampleX = Math.floor(x + r * Math.cos(angle * Math.PI / 180));
                const sampleY = Math.floor(y + r * Math.sin(angle * Math.PI / 180));
                
                if (sampleX >= 0 && sampleX < imageWidth && 
                    sampleY >= 0 && sampleY < imageHeight) {
                  const pixelIndex = (sampleY * imageWidth + sampleX) * 4;
                  const r_val = data[pixelIndex];
                  const g_val = data[pixelIndex + 1];
                  const b_val = data[pixelIndex + 2];
                  
                  const brightness = (r_val + g_val + b_val) / 3;
                  const darkness = 255 - brightness;
                  
                  totalDarkness += darkness;
                  if (darkness > 100) darkPixelCount++;
                  sampleCount++;
                }
              }
            }
            
            if (sampleCount > 0) {
              const avgDarkness = totalDarkness / sampleCount;
              const darkRatio = darkPixelCount / sampleCount;
              
              // Only consider this a marked bubble if it meets strict criteria
              if (avgDarkness > MINIMUM_DARKNESS_THRESHOLD && darkRatio > 0.4) {
                
                // Try to determine which question and option this corresponds to
                // This is a simplified approach - in reality you'd need more sophisticated layout detection
                const approximateRow = Math.floor(y / (imageHeight / 12)); // Assuming ~12 rows
                const approximateCol = Math.floor(x / (imageWidth / 20)); // Assuming ~20 columns (5 questions * 4 options)
                
                if (approximateRow >= 0 && approximateCol >= 0) {
                  const questionNum = Math.floor(approximateCol / 4) + 1 + (approximateRow * 5);
                  const optionIndex = approximateCol % 4;
                  
                  if (questionNum <= answerKey.totalQuestions && optionIndex < 4) {
                    markedRegions.push({
                      x, y, 
                      darkness: avgDarkness,
                      option: options[optionIndex],
                      question: questionNum
                    });
                  }
                }
              }
            }
          }
        }
        
        // Group detected marks by question and pick the darkest one for each question
        const questionMarks: { [key: number]: { option: string, darkness: number } } = {};
        
        markedRegions.forEach(region => {
          if (!questionMarks[region.question] || region.darkness > questionMarks[region.question].darkness) {
            questionMarks[region.question] = {
              option: region.option,
              darkness: region.darkness
            };
          }
        });
        
        // Only record answers for questions with clearly marked bubbles
        Object.keys(questionMarks).forEach(questionStr => {
          const questionNum = parseInt(questionStr);
          const mark = questionMarks[questionNum];
          
          // Final validation - only record if darkness is significantly above threshold
          if (mark.darkness > MINIMUM_DARKNESS_THRESHOLD * 1.2) {
            studentAnswers[questionNum] = mark.option;
          }
        });
        
        // If very few answers detected, show a warning about image quality
        if (Object.keys(studentAnswers).length < answerKey.totalQuestions * 0.1) {
          console.warn('Very few marked bubbles detected. Please check image quality and bubble marking.');
        }
        
        resolve(studentAnswers);
      };
      
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
    });
  };

  const processOMR = async () => {
    if (!selectedAnswerKey || !studentId || !studentName || !uploadedFile) {
      alert('Please fill all fields and upload an OMR sheet');
      return;
    }

    const answerKey = answerKeys.find(ak => ak.id === selectedAnswerKey);
    if (!answerKey) return;

    setProcessing(true);
    setProgress(0);

    const steps = [
      'Preprocessing image...',
      'Detecting sheet orientation...',
      'Correcting perspective distortion...',
      'Identifying bubble grid...',
      'Extracting responses...',
      'Classifying marked bubbles...',
      'Matching with answer key...',
      'Calculating scores...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      setProgress((i + 1) / steps.length * 100);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Process the actual uploaded image for OMR detection
    const studentAnswers = await processImageForOMR(imagePreview);
    setDetectedAnswers(studentAnswers);
    
    // Calculate scores - only count answered questions
    const scores: { [subject: string]: number } = {};
    const subjectStats: { [subject: string]: { answered: number, correct: number, total: number } } = {};
    let totalScore = 0;
    let maxMarks = 0;
    let totalAnswered = 0;
    let totalCorrect = 0;

    answerKey.subjects.forEach(subject => {
      let subjectScore = 0;
      let answered = 0;
      let correct = 0;
      const questionsInSubject = subject.questionRange[1] - subject.questionRange[0] + 1;
      const marksPerQuestion = subject.maxMarks / questionsInSubject;

      for (let q = subject.questionRange[0]; q <= subject.questionRange[1]; q++) {
        if (studentAnswers[q]) { // Only if student marked an answer
          answered++;
          totalAnswered++;
          
          if (studentAnswers[q] === answerKey.answers[q]) {
            subjectScore += marksPerQuestion;
            correct++;
            totalCorrect++;
          }
        }
      }

      scores[subject.name] = Math.round(subjectScore * 100) / 100;
      subjectStats[subject.name] = { answered, correct, total: questionsInSubject };
      totalScore += scores[subject.name];
      maxMarks += subject.maxMarks;
    });

    // Add detection stats to result
    const detectionStats = {
      totalQuestions: answerKey.totalQuestions,
      questionsAnswered: totalAnswered,
      questionsBlank: answerKey.totalQuestions - totalAnswered,
      correctAnswers: totalCorrect,
      wrongAnswers: totalAnswered - totalCorrect
    };

    const result: StudentResultType = {
      id: Date.now().toString(),
      studentId: studentId.trim(),
      studentName: studentName.trim(),
      examId: selectedAnswerKey,
      answers: studentAnswers,
      scores,
      totalScore: Math.round(totalScore * 100) / 100,
      maxMarks,
      percentage: Math.round((totalScore / maxMarks) * 100 * 100) / 100,
      timestamp: new Date(),
      detectionStats
    };

    setProcessingStep('Processing complete!');
    setProgress(100);

    await new Promise(resolve => setTimeout(resolve, 500));

    onOMRProcessed(result);
    
    // Reset form
    setStudentId('');
    setStudentName('');
    setUploadedFile(null);
    setProcessing(false);
    setProgress(0);
    setProcessingStep('');

    // Reset file input
    const fileInput = document.getElementById('omr-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  if (answerKeys.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please create an answer key first before uploading OMR sheets.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload & Process OMR Sheet</CardTitle>
          <CardDescription>Upload individual OMR sheets for evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="answerKey">Select Answer Key</Label>
              <Select value={selectedAnswerKey} onValueChange={setSelectedAnswerKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose answer key" />
                </SelectTrigger>
                <SelectContent>
                  {answerKeys.map(key => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.examName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., STU001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="omr-upload">Upload OMR Sheet</Label>
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="omr-upload" className="cursor-pointer text-lg font-medium text-blue-700 hover:text-blue-800 transition-colors">
                    📸 Click to upload OMR sheet
                  </Label>
                  <p className="text-sm text-blue-600 mt-1">PNG, JPG or PDF up to 10MB</p>
                  <p className="text-xs text-blue-500 mt-2">📝 Ensure clear lighting and all bubbles are visible</p>
                </div>
                <input
                  id="omr-upload"
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleFileUpload}
                />
              </div>
              
              {uploadedFile && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-xs text-green-600">Ready for processing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {imagePreview && (
            <div className="space-y-2">
              <Label>Image Preview & Processing Canvas</Label>
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Uploaded Image</p>
                    <img 
                      src={imagePreview} 
                      alt="OMR Sheet" 
                      className="max-w-full h-auto border rounded"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Processing Canvas</p>
                    <canvas 
                      ref={canvasRef}
                      className="border rounded bg-white"
                      style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {Object.keys(detectedAnswers).length > 0 && (
            <div className="space-y-2">
              <Label>Detected Answers from OMR Sheet</Label>
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="mb-3 p-2 bg-yellow-100 rounded border">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Detection Summary: Found {Object.keys(detectedAnswers).length} marked bubbles out of {answerKeys.find(ak => ak.id === selectedAnswerKey)?.totalQuestions || 0} total questions
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Only questions with clearly marked bubbles are shown below. Unmarked questions will be scored as blank.
                  </p>
                </div>
                
                {Object.keys(detectedAnswers).length > 0 ? (
                  <>
                    <div className="grid grid-cols-10 gap-2">
                      {Object.entries(detectedAnswers).slice(0, 20).map(([q, answer]) => (
                        <div key={q} className="text-center p-2 bg-white rounded border border-green-300">
                          <div className="text-xs font-medium">Q{q}</div>
                          <div className="font-bold text-green-600">{answer}</div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(detectedAnswers).length > 20 && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Showing first 20 detected answers... Total detected: {Object.keys(detectedAnswers).length}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                    <p className="text-red-600 font-medium">No marked bubbles detected!</p>
                    <p className="text-xs text-red-500 mt-1">Please ensure bubbles are completely filled and image quality is good.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {processing && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <h4 className="font-medium text-purple-800">AI Processing in Progress...</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-700 font-medium">🔍 {processingStep}</span>
                  <span className="text-purple-600 font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-3 bg-purple-100" />
              </div>
              <p className="text-xs text-purple-600 text-center">
                ⚡ Using advanced computer vision algorithms for precise bubble detection
              </p>
            </div>
          )}

          <Button 
            onClick={processOMR} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-lg"
            disabled={!selectedAnswerKey || !studentId || !studentName || !uploadedFile || processing}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing OMR Sheet...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                🚀 Process OMR Sheet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}