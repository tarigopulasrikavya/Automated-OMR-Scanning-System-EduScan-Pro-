import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Printer } from 'lucide-react';

export function TestOMRSheet() {
  const generateTestSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test OMR Sheet</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
        .omr-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .student-info { display: flex; gap: 30px; margin-bottom: 20px; }
        .info-field { display: flex; align-items: center; gap: 10px; }
        .info-field label { font-weight: bold; min-width: 100px; }
        .info-field .line { border-bottom: 1px solid #000; width: 200px; height: 20px; }
        .questions-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-top: 30px; }
        .question-block { border: 1px solid #ccc; padding: 15px; }
        .question-header { font-weight: bold; text-align: center; margin-bottom: 10px; background: #f0f0f0; padding: 5px; }
        .options { display: flex; justify-content: space-around; }
        .option { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .bubble { width: 20px; height: 20px; border: 2px solid #000; border-radius: 50%; cursor: pointer; }
        .bubble:hover { background: #f0f0f0; }
        .instructions { margin: 20px 0; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; }
        .instructions h3 { margin-top: 0; color: #333; }
        .instructions ul { margin: 10px 0; padding-left: 20px; }
        .instructions li { margin: 5px 0; }
        @media print {
          body { margin: 10px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="omr-header">
        <h1>TEST OMR EVALUATION SHEET</h1>
        <p><strong>Sample Mathematics Exam - 20 Questions</strong></p>
      </div>

      <div class="student-info">
        <div class="info-field">
          <label>Student ID:</label>
          <div class="line"></div>
        </div>
        <div class="info-field">
          <label>Student Name:</label>
          <div class="line"></div>
        </div>
        <div class="info-field">
          <label>Date:</label>
          <div class="line"></div>
        </div>
      </div>

      <div class="instructions">
        <h3>📋 INSTRUCTIONS FOR TESTING:</h3>
        <ul>
          <li><strong>Fill bubbles completely</strong> with a dark pen or pencil</li>
          <li><strong>Test answers:</strong> Q1=B, Q2=A, Q3=C, Q4=D, Q5=A, Q6=B, Q7=C, Q8=D, Q9=A, Q10=B</li>
          <li><strong>Try different patterns:</strong> Fill some correctly, some incorrectly, and leave some blank</li>
          <li><strong>Photo quality:</strong> Take a clear, well-lit photo without shadows</li>
          <li><strong>Upload to system</strong> and verify detection accuracy</li>
        </ul>
      </div>

      <div class="questions-grid">
        ${Array.from({ length: 20 }, (_, i) => {
          const qNum = i + 1;
          return `
            <div class="question-block">
              <div class="question-header">Question ${qNum}</div>
              <div class="options">
                <div class="option">
                  <div class="bubble" onclick="fillBubble(this)"></div>
                  <label>A</label>
                </div>
                <div class="option">
                  <div class="bubble" onclick="fillBubble(this)"></div>
                  <label>B</label>
                </div>
                <div class="option">
                  <div class="bubble" onclick="fillBubble(this)"></div>
                  <label>C</label>
                </div>
                <div class="option">
                  <div class="bubble" onclick="fillBubble(this)"></div>
                  <label>D</label>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 30px; text-align: center; border-top: 2px solid #000; padding-top: 20px;">
        <p><strong>END OF TEST SHEET</strong></p>
        <p style="font-size: 12px; color: #666;">
          This is a test sheet for OMR evaluation system. Fill bubbles completely and take a clear photo to upload.
        </p>
      </div>

      <script>
        function fillBubble(bubble) {
          // Clear other bubbles in the same question
          const questionBlock = bubble.closest('.question-block');
          const allBubbles = questionBlock.querySelectorAll('.bubble');
          allBubbles.forEach(b => b.style.backgroundColor = 'white');
          
          // Fill the clicked bubble
          bubble.style.backgroundColor = 'black';
        }
      </script>
    </body>
    </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Test OMR Sheet Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Generate a test OMR sheet to verify the accuracy of our detection system:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Sample Questions:</strong> 20 Math questions with answer key provided</li>
            <li><strong>Test Pattern:</strong> Fill some correctly (Q1=B, Q2=A, Q3=C, etc.)</li>
            <li><strong>Verification:</strong> Leave some blank, mark some wrong to test detection</li>
            <li><strong>Photo Upload:</strong> Take clear photo and upload to verify results</li>
          </ul>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={generateTestSheet} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Generate Test Sheet
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Print Current Page
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">🧪 How to Test:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Generate and print the test sheet</li>
            <li>Fill bubbles with a dark pen (follow provided answer key)</li>
            <li>Take a clear, well-lit photo of the completed sheet</li>
            <li>Upload to the system and compare detected vs actual answers</li>
            <li>Verify blank questions are marked as wrong</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}