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
    <div className="lg:w-96 lg:ml-6 mt-6 lg:mt-0">
      <div className="flex items-center mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1.5 rounded-md shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <h4 className="font-semibold text-base ml-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          AI Recommendations
        </h4>
      </div>
      
      <div className="rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden">
        {result.improvedCode && (
          <div className="border-b border-gray-200">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 flex items-center">
              <div className="p-1.5 bg-white rounded-full shadow-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="font-medium text-sm text-indigo-900">Improved Implementation</h5>
            </div>
            <div className="p-4">
              <pre className="text-xs rounded-md overflow-x-auto bg-gray-900 p-3 shadow-inner">
                <code dangerouslySetInnerHTML={{ __html: highlightedImprovedCode }} />
              </pre>
            </div>
          </div>
        )}
        
        {result.keyImprovements && result.keyImprovements.length > 0 && (
          <div>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 flex items-center border-b border-gray-200">
              <div className="p-1.5 bg-white rounded-full shadow-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="font-medium text-sm text-emerald-900">Key Improvements</h5>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm text-gray-700">
                {result.keyImprovements.map((improvement, index) => (
                  <li key={index} className="flex items-start bg-gradient-to-r from-gray-50 to-white p-3 rounded-md border border-gray-100">
                    <div className="p-1 bg-emerald-100 rounded-full mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="leading-tight">{improvement}</span>
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
