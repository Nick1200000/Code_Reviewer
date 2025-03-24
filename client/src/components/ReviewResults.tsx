import { useState } from "react";
import { ReviewResult } from "@shared/schema";
import CodeDisplay from "./CodeDisplay";
import CodeQualitySummary from "./CodeQualitySummary";
import AIRecommendations from "./AIRecommendations";
import IssuesBreakdown from "./IssuesBreakdown";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  downloadTextReport, 
  downloadPdfReport 
} from "@/lib/reportGenerator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleTextReport = () => {
    try {
      downloadTextReport(code, language, reviewType, result);
      toast({
        title: "Report downloaded",
        description: "Your code review report has been downloaded as a text file.",
      });
    } catch (error) {
      console.error("Failed to download text report:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePdfReport = async () => {
    try {
      await downloadPdfReport(code, language, reviewType, result);
      toast({
        title: "PDF Report",
        description: "Your PDF report is being prepared. If prompted, please allow popups.",
      });
    } catch (error) {
      console.error("Failed to download PDF report:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try the text report option instead.",
        variant: "destructive",
      });
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleTextReport}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Text Format (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePdfReport}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>PDF Format</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
