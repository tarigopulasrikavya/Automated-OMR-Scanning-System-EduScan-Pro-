import { useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Download } from 'lucide-react';
import { AnswerKey } from '../App';

interface OMRSheetGeneratorProps {
  answerKey: AnswerKey;
}

export function OMRSheetGenerator({ answerKey }: OMRSheetGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateOMRSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 proportions)
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(answerKey.examName, width / 2, 60);

    // Instructions
    ctx.font = '14px Arial';
    ctx.fillText('Mark your answers by completely filling the circles', width / 2, 90);

    // Student info section
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Student ID: _______________', 50, 130);
    ctx.fillText('Student Name: _______________', 300, 130);

    // OMR Grid
    const startY = 170;
    const questionsPerRow = 5;
    const questionSpacing = 150;
    const bubbleSize = 20;
    const bubbleSpacing = 30;

    ctx.font = 'bold 14px Arial';
    
    for (let q = 1; q <= answerKey.totalQuestions; q++) {
      const row = Math.floor((q - 1) / questionsPerRow);
      const col = (q - 1) % questionsPerRow;
      
      const x = 60 + col * questionSpacing;
      const y = startY + row * 60;

      // Question number
      ctx.fillText(`${q}.`, x - 20, y + 15);

      // Option bubbles (A, B, C, D)
      const options = ['A', 'B', 'C', 'D'];
      for (let i = 0; i < options.length; i++) {
        const bubbleX = x + i * bubbleSpacing;
        const bubbleY = y;

        // Draw bubble circle
        ctx.beginPath();
        ctx.arc(bubbleX + bubbleSize/2, bubbleY + bubbleSize/2, bubbleSize/2 - 2, 0, 2 * Math.PI);
        ctx.stroke();

        // Option label
        ctx.font = '12px Arial';
        ctx.fillText(options[i], bubbleX + bubbleSize/2 - 4, bubbleY - 5);
        ctx.font = 'bold 14px Arial';
      }
    }

    // Subject sections
    let currentY = startY + Math.ceil(answerKey.totalQuestions / questionsPerRow) * 60 + 50;
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Subject Breakdown:', 50, currentY);
    
    answerKey.subjects.forEach((subject, index) => {
      currentY += 25;
      ctx.font = '14px Arial';
      ctx.fillText(
        `${subject.name}: Questions ${subject.questionRange[0]}-${subject.questionRange[1]} (${subject.maxMarks} marks)`,
        70,
        currentY
      );
    });

    // Add timing marks for better scanning
    ctx.fillStyle = 'black';
    const markSize = 10;
    // Corner marks
    ctx.fillRect(20, 20, markSize, markSize);
    ctx.fillRect(width - 30, 20, markSize, markSize);
    ctx.fillRect(20, height - 30, markSize, markSize);
    ctx.fillRect(width - 30, height - 30, markSize, markSize);
  };

  const downloadOMRSheet = () => {
    generateOMRSheet();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${answerKey.examName.replace(/\s+/g, '_')}_OMR_Sheet.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OMR Sheet Generator</CardTitle>
        <CardDescription>Generate printable OMR sheets for this exam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>• Total Questions: {answerKey.totalQuestions}</p>
          <p>• Subjects: {answerKey.subjects.map(s => s.name).join(', ')}</p>
        </div>
        
        <Button onClick={downloadOMRSheet} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Download OMR Sheet Template
        </Button>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="border rounded-lg p-2 bg-muted/30">
            <canvas 
              ref={canvasRef}
              className="border rounded bg-white w-full"
              style={{ maxHeight: '400px' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}