import { useState } from "react";
import { ReviewResult } from "@shared/schema";
import CodeDisplay from "./CodeDisplay";
import CodeQualitySummary from "./CodeQualitySummary";
import AIRecommendations from "./AIRecommendations";
import IssuesBreakdown from "./IssuesBreakdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ReviewResultsProps {
  code: string;
  language: string;
  reviewType: string;
  result: ReviewResult;
}

export default function ReviewResults({ code, language, reviewType, result }: ReviewResultsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyFixedCode = () => {
    if (!result.improvedCode) {
      toast({
        title: "No improved code available",
        description: "There is no improved code to copy.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(result.improvedCode).then(
      () => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Improved code has been copied to clipboard.",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast({
          title: "Copy failed",
          description: "Failed to copy code to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  const handleDownloadReport = () => {
    // Create a report text
    const reportDate = new Date().toLocaleString();
    let reportContent = `AI Code Review Report - ${reportDate}\n\n`;
    reportContent += `Language: ${language}\n`;
    reportContent += `Review Type: ${reviewType}\n\n`;
    
    reportContent += `Overall Quality: ${result.metrics.overall.grade}\n`;
    reportContent += `Maintainability: ${result.metrics.maintainability.grade}\n`;
    reportContent += `Performance: ${result.metrics.performance.grade}\n`;
    reportContent += `Security: ${result.metrics.security.grade}\n\n`;
    
    reportContent += `Issues Found:\n`;
    reportContent += `- Critical: ${result.issues.critical}\n`;
    reportContent += `- Warnings: ${result.issues.warnings}\n`;
    reportContent += `- Info: ${result.issues.info}\n\n`;
    
    reportContent += `Comments:\n`;
    result.comments.forEach(comment => {
      reportContent += `Line ${comment.line} - ${comment.type.toUpperCase()}: ${comment.text}\n`;
      if (comment.suggestion) {
        reportContent += `  Suggestion: ${comment.suggestion}\n`;
      }
      reportContent += `\n`;
    });
    
    if (result.improvedCode) {
      reportContent += `Improved Code:\n\n${result.improvedCode}\n\n`;
    }
    
    if (result.keyImprovements) {
      reportContent += `Key Improvements:\n`;
      result.keyImprovements.forEach(improvement => {
        reportContent += `- ${improvement}\n`;
      });
    }
    
    // Create and download the file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded",
      description: "Your code review report has been downloaded.",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Review Results</h3>
          <div className="flex space-x-3">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {language}
            </span>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {reviewType}
            </span>
          </div>
        </div>
      </div>
      
      {/* Code Quality Summary */}
      <CodeQualitySummary metrics={result.metrics} />
      
      {/* Code Analysis */}
      <div className="px-6 py-5">
        <div className="flex flex-col lg:flex-row">
          {/* Code with Inline Comments (Left Side) */}
          <div className="lg:flex-1 overflow-auto" style={{ maxHeight: '600px' }}>
            <h4 className="font-medium text-base mb-3">Code Analysis</h4>
            <CodeDisplay
              code={code}
              language={language}
              comments={result.comments}
            />
          </div>
          
          {/* AI Recommendations (Right Side) */}
          <AIRecommendations result={result} language={language} />
        </div>
        
        {/* Issues Breakdown */}
        <IssuesBreakdown issues={result.issues} />
      </div>
      
      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-wrap gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleDownloadReport}
            className="inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Report
          </Button>
          <Button 
            variant="secondary"
            onClick={handleCopyFixedCode}
            disabled={!result.improvedCode}
            className="inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            {copied ? "Copied!" : "Copy Fixed Code"}
          </Button>
        </div>
        <Button 
          variant="outline"
          className="inline-flex items-center"
          onClick={() => {
            toast({
              title: "AI Assistant",
              description: "AI Assistant functionality is coming soon!",
            });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Ask AI Assistant
        </Button>
      </div>
    </div>
  );
}
