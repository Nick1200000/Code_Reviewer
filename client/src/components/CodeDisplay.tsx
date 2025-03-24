import { useState, useEffect, useRef } from "react";
import { CodeComment } from "@shared/schema";

interface CodeDisplayProps {
  code: string;
  language: string;
  comments: CodeComment[];
}

export default function CodeDisplay({ code, language, comments }: CodeDisplayProps) {
  const [highlightedCode, setHighlightedCode] = useState<JSX.Element[]>([]);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSyntaxHighlighter = async () => {
      // Load highlight.js dynamically
      const hljs = await import('highlight.js');
      await import('highlight.js/styles/atom-one-dark.css');
      
      // Load specific language if needed
      try {
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
        if (lineComments.length > 0) {
          const highestSeverity = lineComments.reduce((highest, comment) => {
            if (comment.type === 'error') return 'error';
            if (highest !== 'error' && comment.type === 'warning') return 'warning';
            if (highest !== 'error' && highest !== 'warning' && comment.type === 'suggestion') return 'suggestion';
            return highest;
          }, 'info');
          
          switch (highestSeverity) {
            case 'error': bgColorClass = 'bg-red-50'; break;
            case 'warning': bgColorClass = 'bg-yellow-50'; break;
            case 'suggestion': bgColorClass = 'bg-yellow-50'; break;
            case 'info': bgColorClass = 'bg-blue-50'; break;
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
          <tr key={lineNumber} id={`line-${lineNumber}`} className={bgColorClass}>
            <td className="py-1 pl-4 pr-0 line-number select-none text-right text-gray-500 pr-3 min-w-10">
              {lineNumber}
            </td>
            <td className="py-1 px-2 font-mono text-xs relative">
              <pre>
                <code dangerouslySetInnerHTML={{ __html: highlightedLine || line }} />
              </pre>
              {lineComments.map((comment, i) => {
                let commentClass = 'text-blue-800 bg-blue-100 border-blue-200';
                if (comment.type === 'error') {
                  commentClass = 'text-red-800 bg-red-100 border-red-200';
                } else if (comment.type === 'warning') {
                  commentClass = 'text-yellow-800 bg-yellow-100 border-yellow-200';
                } else if (comment.type === 'suggestion') {
                  commentClass = 'text-yellow-800 bg-yellow-100 border-yellow-200';
                }
                
                return (
                  <div key={i} className={`review-comment p-2 text-xs border ${commentClass}`}>
                    <span className="font-medium">{comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}:</span> {comment.text}
                    {comment.suggestion && (
                      <div className="mt-1">
                        <code className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs">{comment.suggestion}</code>
                      </div>
                    )}
                  </div>
                );
              })}
            </td>
          </tr>
        );
      });

      setHighlightedCode(result);
    };

    loadSyntaxHighlighter();
  }, [code, language, comments]);

  return (
    <div 
      ref={codeContainerRef} 
      className="lg:flex-1 overflow-auto border rounded-md"
      style={{ maxHeight: '600px' }}
    >
      <div className="bg-gray-50">
        <table className="min-w-full">
          <tbody>
            {highlightedCode}
          </tbody>
        </table>
      </div>
    </div>
  );
}
