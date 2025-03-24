import { useState, useEffect, useRef } from "react";
import { CodeComment } from "@shared/schema";

interface CodeDisplayProps {
  code: string;
  language: string;
  comments: CodeComment[];
}

export default function CodeDisplay({ code, language, comments }: CodeDisplayProps) {
  const [highlightedCode, setHighlightedCode] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSyntaxHighlighter = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load highlight.js dynamically
        const hljs = await import('highlight.js');
        await import('highlight.js/styles/atom-one-dark.css');
        
        // Load specific language if needed
        try {
          // @vite-ignore
          if (language.toLowerCase() !== 'javascript' && language.toLowerCase() !== 'python') {
            await import(`highlight.js/lib/languages/${language.toLowerCase()}`);
          }
        } catch (e) {
          console.warn(`Language module for ${language} not available, using autodetect`);
        }

        // Split code into lines for display
        const lines = code.split('\n');
        
        // Create comment map by line
        const commentsByLine = new Map<number, CodeComment[]>();
        comments.forEach(comment => {
          if (!commentsByLine.has(comment.line)) {
            commentsByLine.set(comment.line, []);
          }
          commentsByLine.get(comment.line)?.push(comment);
        });

        // Generate highlighted code with line numbers and comments
        const result = lines.map((line, index) => {
          const lineNumber = index + 1;
          const lineComments = commentsByLine.get(lineNumber) || [];
          
          // Determine background color based on comment type
          let bgColorClass = '';
          let borderLeftClass = '';
          
          if (lineComments.length > 0) {
            const highestSeverity = lineComments.reduce((highest, comment) => {
              if (comment.type === 'error') return 'error';
              if (highest !== 'error' && comment.type === 'warning') return 'warning';
              if (highest !== 'error' && highest !== 'warning' && comment.type === 'suggestion') return 'suggestion';
              return highest;
            }, 'info');
            
            switch (highestSeverity) {
              case 'error': 
                bgColorClass = 'bg-red-50'; 
                borderLeftClass = 'border-l-4 border-red-500';
                break;
              case 'warning': 
                bgColorClass = 'bg-yellow-50'; 
                borderLeftClass = 'border-l-4 border-yellow-500';
                break;
              case 'suggestion': 
                bgColorClass = 'bg-yellow-50'; 
                borderLeftClass = 'border-l-4 border-yellow-400';
                break;
              case 'info': 
                bgColorClass = 'bg-blue-50'; 
                borderLeftClass = 'border-l-4 border-blue-400';
                break;
            }
          }

          // Highlight the code
          let highlightedLine;
          try {
            highlightedLine = hljs.default.highlight(line, { language: language.toLowerCase() }).value;
          } catch (e) {
            highlightedLine = hljs.default.highlightAuto(line).value;
          }
          
          return (
            <tr key={lineNumber} id={`line-${lineNumber}`} className={`${bgColorClass} ${borderLeftClass} hover:bg-gray-100`}>
              <td className="py-1 pl-2 pr-3 line-number select-none text-right text-gray-500 min-w-10 border-r border-gray-200">
                {lineNumber}
              </td>
              <td className="py-1 px-2 font-mono text-xs relative">
                <pre className="whitespace-pre">
                  <code dangerouslySetInnerHTML={{ __html: highlightedLine || line }} />
                </pre>
                {lineComments.length > 0 && (
                  <div className="mt-1 space-y-2">
                    {lineComments.map((comment, i) => {
                      let commentClass = 'text-blue-800 bg-blue-100 border-blue-200';
                      let iconColor = 'text-blue-500';
                      let icon = (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      
                      if (comment.type === 'error') {
                        commentClass = 'text-red-800 bg-red-100 border-red-200';
                        iconColor = 'text-red-500';
                        icon = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        );
                      } else if (comment.type === 'warning') {
                        commentClass = 'text-yellow-800 bg-yellow-100 border-yellow-200';
                        iconColor = 'text-yellow-500';
                        icon = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        );
                      } else if (comment.type === 'suggestion') {
                        commentClass = 'text-yellow-800 bg-yellow-100 border-yellow-200';
                        iconColor = 'text-yellow-500';
                        icon = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        );
                      }
                      
                      return (
                        <div key={i} className={`review-comment p-2 text-xs border rounded-md shadow-sm ${commentClass}`}>
                          <div className="flex items-start">
                            <span className={`flex-shrink-0 mt-0.5 ${iconColor}`}>{icon}</span>
                            <div>
                              <div className="font-medium">{comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}:</div>
                              <p>{comment.text}</p>
                              {comment.suggestion && (
                                <div className="mt-2 p-1.5 bg-gray-800 text-white rounded text-xs overflow-x-auto">
                                  <code>{comment.suggestion}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </td>
            </tr>
          );
        });

        setHighlightedCode(result);
        setIsLoading(false);
      } catch (e) {
        console.error("Error highlighting code:", e);
        setError("Failed to highlight code. Please try again.");
        setIsLoading(false);
      }
    };

    loadSyntaxHighlighter();
  }, [code, language, comments]);

  if (isLoading) {
    return (
      <div className="lg:flex-1 overflow-auto border rounded-md bg-gray-50 flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center p-6">
          <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading syntax highlighting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:flex-1 overflow-auto border rounded-md bg-red-50 flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center p-6">
          <svg className="h-10 w-10 text-red-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={codeContainerRef} 
      className="lg:flex-1 overflow-auto border rounded-md"
      style={{ maxHeight: '600px' }}
    >
      <div className="bg-gray-50">
        <table className="min-w-full border-collapse">
          <tbody>
            {highlightedCode}
          </tbody>
        </table>
      </div>
    </div>
  );
}
