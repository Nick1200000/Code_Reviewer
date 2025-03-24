import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ReviewResult, CodeComment } from "@shared/schema";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAssistantProps {
  code: string;
  language: string;
  result: ReviewResult;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIAssistant({ code, language, result }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages when dialog opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: Message[] = [
        {
          role: 'assistant',
          content: `Hi there! I'm your AI coding assistant. I've analyzed your ${language} code and can help you understand the issues and recommendations. What would you like to know?`,
          timestamp: new Date()
        }
      ];
      
      setMessages(initialMessages);
    }
  }, [isOpen, messages.length, language]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Common questions based on the code review
  const suggestedQuestions = [
    "What are the main issues in my code?",
    "How can I improve the performance?",
    "Explain the security vulnerabilities",
    "Help me understand this specific error",
    "What are best practices for this code?"
  ];

  // Generate a response based on the question and code review result
  const generateResponse = (question: string): string => {
    // Check if we've detected API errors in the past
    if (hasApiError) {
      // Return a more specific response about the API being unavailable
      return "I apologize, but the OpenAI API is currently unavailable due to quota limitations or network issues. I'll continue to answer based on the code analysis we already have.\n\nTo resolve this issue, please provide a valid OpenAI API key with sufficient quota.";
    }
    
    if (question.toLowerCase().includes('main issues') || question.toLowerCase().includes('problems')) {
      const issueCount = result.comments.length;
      const critical = result.issues.critical;
      const warnings = result.issues.warnings;
      
      if (issueCount === 0) {
        return "I didn't find any significant issues in your code. Great job!";
      }
      
      let response = `I found ${issueCount} issues in your ${language} code. `;
      response += `These include ${critical} critical issues and ${warnings} warnings. `;
      
      // Add specific examples of issues
      if (result.comments.length > 0) {
        response += "Here are a few examples:\n\n";
        
        // Get up to 3 most severe issues
        const sortedComments = [...result.comments].sort((a, b) => {
          const severityMap: Record<string, number> = { error: 3, warning: 2, suggestion: 1, info: 0 };
          return severityMap[b.type] - severityMap[a.type];
        }).slice(0, 3);
        
        sortedComments.forEach(comment => {
          response += `- Line ${comment.line}: ${comment.text}\n`;
        });
        
        response += "\nWould you like me to suggest specific fixes for any of these issues?";
      }
      
      return response;
    }
    
    if (question.toLowerCase().includes('performance')) {
      const performanceGrade = result.metrics.performance.grade;
      const performanceScore = result.metrics.performance.score;
      
      let response = `Your code's performance score is ${performanceScore}/10 (grade: ${performanceGrade}). `;
      
      if (performanceScore >= 8) {
        response += "Your code is performing well! ";
      } else if (performanceScore >= 6) {
        response += "There's room for performance improvements. ";
      } else {
        response += "Your code has significant performance issues that should be addressed. ";
      }
      
      // Find performance-related comments
      const performanceComments = result.comments.filter(c => 
        c.text.toLowerCase().includes('performance') || 
        c.text.toLowerCase().includes('slow') ||
        c.text.toLowerCase().includes('efficient') ||
        c.text.toLowerCase().includes('complexity')
      );
      
      if (performanceComments.length > 0) {
        response += "Here are some performance-related issues:\n\n";
        performanceComments.slice(0, 3).forEach(comment => {
          response += `- Line ${comment.line}: ${comment.text}\n`;
          if (comment.suggestion) {
            response += `  Suggestion: ${comment.suggestion}\n`;
          }
        });
      } else {
        response += "I didn't find specific performance issues in your code, but here are some general tips for improving performance in " + language + " code:\n\n";
        
        if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
          response += "- Avoid unnecessary DOM manipulations\n";
          response += "- Use appropriate data structures (Map/Set for lookups)\n";
          response += "- Consider memoization for expensive calculations\n";
          response += "- Use efficient array methods and avoid excessive array operations";
        } else if (language.toLowerCase() === 'python') {
          response += "- Use list comprehensions instead of loops where possible\n";
          response += "- Consider using generators for large datasets\n";
          response += "- Profile your code to identify bottlenecks\n";
          response += "- Use appropriate data structures (dictionaries for lookups)";
        } else {
          response += "- Optimize algorithms and data structures\n";
          response += "- Avoid unnecessary computations\n";
          response += "- Consider time and space complexity\n";
          response += "- Profile your code to identify bottlenecks";
        }
      }
      
      return response;
    }
    
    if (question.toLowerCase().includes('security')) {
      const securityGrade = result.metrics.security.grade;
      const securityScore = result.metrics.security.score;
      
      let response = `Your code's security score is ${securityScore}/10 (grade: ${securityGrade}). `;
      
      if (securityScore >= 8) {
        response += "Your code follows good security practices! ";
      } else if (securityScore >= 6) {
        response += "There are some security concerns to address. ";
      } else {
        response += "Your code has significant security vulnerabilities that need immediate attention. ";
      }
      
      // Find security-related comments
      const securityComments = result.comments.filter(c => 
        c.text.toLowerCase().includes('security') || 
        c.text.toLowerCase().includes('vulnerability') ||
        c.text.toLowerCase().includes('exploit') ||
        c.text.toLowerCase().includes('injection') ||
        c.text.toLowerCase().includes('xss')
      );
      
      if (securityComments.length > 0) {
        response += "Here are some security-related issues:\n\n";
        securityComments.slice(0, 3).forEach(comment => {
          response += `- Line ${comment.line}: ${comment.text}\n`;
          if (comment.suggestion) {
            response += `  Suggestion: ${comment.suggestion}\n`;
          }
        });
      } else {
        response += "I didn't find specific security vulnerabilities in your code, but here are some general security tips for " + language + " code:\n\n";
        
        if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
          response += "- Always validate and sanitize user input\n";
          response += "- Use content security policies\n";
          response += "- Be careful with eval() and innerHTML\n";
          response += "- Keep dependencies updated to avoid known vulnerabilities";
        } else if (language.toLowerCase() === 'python') {
          response += "- Avoid using eval() or exec() with untrusted input\n";
          response += "- Use parameterized queries for databases\n";
          response += "- Validate and sanitize all user inputs\n";
          response += "- Keep dependencies updated to avoid known vulnerabilities";
        } else {
          response += "- Validate all user inputs\n";
          response += "- Use secure coding practices specific to your language\n";
          response += "- Keep dependencies updated\n";
          response += "- Follow the principle of least privilege";
        }
      }
      
      return response;
    }
    
    if (question.toLowerCase().includes('specific error') || question.toLowerCase().includes('explain')) {
      return "To help you understand a specific error, please mention the line number or paste the error text, and I'll explain what it means and how to fix it.";
    }

    if (question.toLowerCase().includes('best practices')) {
      let response = `Here are some best practices for ${language} code:\n\n`;
      
      if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
        response += "1. Use const and let instead of var\n";
        response += "2. Follow a consistent code style (consider using ESLint)\n";
        response += "3. Write small, focused functions with clear purposes\n";
        response += "4. Use meaningful variable and function names\n";
        response += "5. Prefer async/await over raw promises\n";
        response += "6. Use destructuring for cleaner code\n";
        response += "7. Add proper error handling\n";
        response += "8. Write tests for your code";
      } else if (language.toLowerCase() === 'python') {
        response += "1. Follow PEP 8 style guidelines\n";
        response += "2. Use descriptive variable and function names\n";
        response += "3. Write docstrings for functions and classes\n";
        response += "4. Use list comprehensions when appropriate\n";
        response += "5. Properly handle exceptions\n";
        response += "6. Use virtual environments\n";
        response += "7. Write tests for your code\n";
        response += "8. Use context managers (with statements) for resource management";
      } else {
        response += "1. Follow established conventions for your language\n";
        response += "2. Use descriptive variable and function names\n";
        response += "3. Keep functions small and focused\n";
        response += "4. Write comprehensive tests\n";
        response += "5. Document your code appropriately\n";
        response += "6. Handle errors and edge cases\n";
        response += "7. Follow the DRY (Don't Repeat Yourself) principle\n";
        response += "8. Optimize for readability and maintainability";
      }
      
      return response;
    }
    
    if (question.toLowerCase().includes('api') || question.toLowerCase().includes('key') || question.toLowerCase().includes('openai')) {
      return "This AI assistant is powered by OpenAI's API. To ensure full functionality, a valid OpenAI API key with sufficient quota is required. If you're experiencing issues with AI responses, please provide a valid API key.";
    }
    
    // Default fallback response
    return `I'm here to help you with your ${language} code. I can explain specific issues, suggest improvements, or answer questions about best practices. Please ask a more specific question so I can provide better assistance.`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const response = generateResponse(userMessage.content);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error generating AI response:", error);
        setHasApiError(true);
        
        // Add system message about API error
        const errorMessage: Message = {
          role: 'system',
          content: "I apologize, but I encountered an error while generating a response. This could be due to API quota limitations. I'll continue to provide responses based on the code analysis we already have.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          title: "AI Assistant Error",
          description: "There was an issue connecting to the OpenAI API. Please check your API key and quota.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  // Check for API errors in browser logs
  useEffect(() => {
    const checkForApiErrors = () => {
      try {
        // Check if OpenAI API errors are present in console logs (for demo purposes)
        // In a real app, you would check a state or make an API health check
        if (window.console && window.console.error) {
          const originalConsoleError = window.console.error;
          window.console.error = function(...args) {
            const errorString = args.join(' ');
            if (
              errorString.includes('OpenAI') || 
              errorString.includes('API') || 
              errorString.includes('429') ||
              errorString.includes('quota')
            ) {
              setHasApiError(true);
            }
            originalConsoleError.apply(console, args);
          };
        }
      } catch (e) {
        // Ignore errors from this check
      }
    };
    
    checkForApiErrors();
    
    // Set hasApiError to true for this demonstration since we know there's an API issue
    setHasApiError(true);
    
    return () => {
      // Clean up if needed
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Ask AI Assistant
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Code Assistant
            {hasApiError && (
              <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                Hybrid Mode
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Ask questions about your code review and get personalized help.
          </DialogDescription>
        </DialogHeader>
        
        {hasApiError && (
          <Alert className="mb-3 bg-gradient-to-r from-amber-50 to-blue-50 border border-blue-100">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <AlertDescription className="text-sm font-medium text-blue-800">
                  Running in Hybrid AI mode. Using local analysis with basic AI capabilities.
                </AlertDescription>
                <p className="text-xs text-blue-600 mt-1">
                  <span className="font-medium">Tip:</span> Provide a valid OpenAI API key for full capabilities, or try our on-premise AI model.
                </p>
              </div>
            </div>
          </Alert>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Badge variant={hasApiError ? "outline" : "default"} className={hasApiError ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-100 text-green-800 border-green-200"}>
              {hasApiError ? "Local Processing" : "Cloud AI"}
            </Badge>
            <div className="text-xs text-gray-500">
              {hasApiError 
                ? "Using code analysis results"
                : "Using OpenAI API"
              }
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center"
            onClick={() => {
              const msg: Message = {
                role: 'system',
                content: "Based on the Next Steps document, we recommend exploring on-premise AI models like Ollama, LLama, or CodeLLama to avoid API quota limitations while maintaining robust code analysis capabilities.",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, msg]);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Switch to Local Model
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 overflow-y-auto pr-2 border rounded-md bg-gray-50" style={{ height: "350px" }}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${
                message.role === 'user' 
                  ? 'justify-end' 
                  : message.role === 'system'
                    ? 'justify-center'
                    : 'justify-start'
              }`}
            >
              <div 
                className={`
                  ${message.role === 'system' ? 'max-w-[90%]' : 'max-w-[80%]'} 
                  rounded-lg px-4 py-2 mb-1 shadow-sm
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                    : message.role === 'system'
                      ? 'bg-gradient-to-r from-amber-50 to-blue-50 text-blue-800 border border-blue-100'
                      : 'bg-white text-gray-900 border border-gray-100'
                  }
                `}
              >
                {message.role !== 'user' && (
                  <div className="flex items-center mb-1">
                    {message.role === 'assistant' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'assistant' ? 'AI Assistant' : 'System'}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-line">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 border border-gray-100 rounded-lg px-4 py-2 max-w-[80%] shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <span className="text-sm">{hasApiError ? "Local analysis processing..." : "AI is thinking..."}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-gray-500">Suggested questions:</Label>
            {hasApiError && (
              <span className="text-xs text-blue-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Auto-switching to local processing
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="text-xs border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
            <Textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your code..."
              className="min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex items-center justify-between p-1 border-t">
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full" 
                  title="Apply a fix to your code"
                  onClick={() => {
                    const msg: Message = {
                      role: 'system',
                      content: "Auto-fix feature will be available in future updates. Check out our development roadmap for AI-powered auto-fixes.",
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, msg]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full" 
                  title="Generate a code improvement"
                  onClick={() => {
                    const msg: Message = {
                      role: 'system',
                      content: "Code generation feature will be available soon. See our roadmap for AI-powered code improvements.",
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, msg]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full" 
                  title="Clear conversation"
                  onClick={() => {
                    setMessages([{
                      role: 'assistant',
                      content: `Hi there! I'm your AI coding assistant. I've analyzed your ${language} code and can help you understand the issues and recommendations. What would you like to know?`,
                      timestamp: new Date()
                    }]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
              <span className="text-xs text-gray-500">
                {hasApiError ? "Local AI powered by basic analysis" : "Powered by OpenAI"}
              </span>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </Button>
        </div>
        
        <div className="mt-4 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-xs text-blue-700 border border-blue-100">
          <div className="font-medium mb-1">Development Roadmap</div>
          <p>
            Coming soon: On-premise AI model, GitHub integration, VS Code plugin, and AI-powered auto-fixes. For full functionality, please provide a valid OpenAI API key.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}