import { ReviewResult } from "@shared/schema";
import { useEffect, useState } from "react";

interface AIRecommendationsProps {
  result: ReviewResult;
  language: string;
}

export default function AIRecommendations({ result, language }: AIRecommendationsProps) {
  const [highlightedImprovedCode, setHighlightedImprovedCode] = useState<string>("");

  useEffect(() => {
    const loadSyntaxHighlighter = async () => {
      if (!result.improvedCode) return;
      
      // Load highlight.js dynamically
      const hljs = await import('highlight.js');
      await import('highlight.js/styles/atom-one-dark.css');
      
      try {
        // Try to highlight with the specific language
        const highlighted = hljs.default.highlight(result.improvedCode, {
          language: language.toLowerCase()
        }).value;
        setHighlightedImprovedCode(highlighted);
      } catch (e) {
        // Fallback to auto-detection
        const highlighted = hljs.default.highlightAuto(result.improvedCode).value;
        setHighlightedImprovedCode(highlighted);
      }
    };

    loadSyntaxHighlighter();
  }, [result.improvedCode, language]);
  
  if (!result) return null;

  return (
    <div className="lg:w-80 lg:ml-6 mt-6 lg:mt-0">
      <h4 className="font-medium text-base mb-3">AI Recommendations</h4>
      <div className="rounded-md bg-white border border-gray-200">
        {result.improvedCode && (
          <div className="p-4 border-b border-gray-200 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <div>
              <h5 className="font-medium text-sm text-gray-900">Improved Implementation</h5>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: highlightedImprovedCode }} />
              </pre>
            </div>
          </div>
        )}
        
        {result.keyImprovements && result.keyImprovements.length > 0 && (
          <div className="p-4 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-sm text-gray-900">Key Improvements</h5>
              <ul className="mt-2 text-xs text-gray-600 space-y-2">
                {result.keyImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
