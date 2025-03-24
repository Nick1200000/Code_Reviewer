import { CodeSubmission, CodeComment, type ReviewResult } from "@shared/schema";

// Performs basic static analysis on code
export function performBasicAnalysis(submission: CodeSubmission): CodeComment[] {
  const { language, code } = submission;
  const comments: CodeComment[] = [];
  const lines = code.split('\n');
  
  // Basic empty check
  if (!code.trim()) {
    comments.push({
      line: 1,
      text: "Code is empty",
      type: "error"
    });
    return comments;
  }
  
  // Check for common issues based on language
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      comments.push(...analyzeJavaScript(lines));
      break;
    case 'python':
      comments.push(...analyzePython(lines));
      break;
    case 'java':
      comments.push(...analyzeJava(lines));
      break;
    case 'c++':
      comments.push(...analyzeCpp(lines));
      break;
    default:
      // Generic analysis for other languages
      comments.push(...analyzeGeneric(lines));
  }
  
  return comments;
}

function analyzeJavaScript(lines: string[]): CodeComment[] {
  const comments: CodeComment[] = [];
  
  lines.forEach((line, index) => {
    // Check for console.log statements
    if (line.includes('console.log')) {
      comments.push({
        line: index + 1,
        text: "Consider removing debug console.log statements in production code",
        type: "warning"
      });
    }
    
    // Check for var usage
    if (line.includes('var ')) {
      comments.push({
        line: index + 1,
        text: "Consider using 'let' or 'const' instead of 'var'",
        type: "suggestion",
        suggestion: line.replace('var ', 'const ')
      });
    }
    
    // Check for potential equality errors
    if (line.includes(' == ') && !line.includes(' === ')) {
      comments.push({
        line: index + 1,
        text: "Using loose equality (==) may lead to unexpected behavior. Consider using strict equality (===)",
        type: "warning",
        suggestion: line.replace(' == ', ' === ')
      });
    }
  });
  
  return comments;
}

function analyzePython(lines: string[]): CodeComment[] {
  const comments: CodeComment[] = [];
  
  lines.forEach((line, index) => {
    // Check for print statements
    if (line.includes('print(')) {
      comments.push({
        line: index + 1,
        text: "Consider using logging instead of print statements in production code",
        type: "suggestion"
      });
    }
    
    // Check for mutable default arguments
    if (line.match(/def\s+\w+\([^)]*=\s*\[\s*\][^)]*\)/)) {
      comments.push({
        line: index + 1,
        text: "Using mutable default arguments (empty list) can lead to unexpected behavior",
        type: "warning"
      });
    }
    
    // Check for concatenation vs format strings
    if (line.includes(' + ') && line.match(/['"].*['"] \+ /)) {
      comments.push({
        line: index + 1,
        text: "Consider using f-strings for string formatting instead of concatenation",
        type: "suggestion"
      });
    }
  });
  
  return comments;
}

function analyzeJava(lines: string[]): CodeComment[] {
  const comments: CodeComment[] = [];
  
  lines.forEach((line, index) => {
    // Check for System.out.println
    if (line.includes('System.out.println')) {
      comments.push({
        line: index + 1,
        text: "Consider using a logging framework instead of System.out.println in production code",
        type: "suggestion"
      });
    }
    
    // Check for null checks
    if (line.includes(' == null')) {
      comments.push({
        line: index + 1,
        text: "Consider using Optional<> to avoid null checks",
        type: "suggestion"
      });
    }
  });
  
  return comments;
}

function analyzeCpp(lines: string[]): CodeComment[] {
  const comments: CodeComment[] = [];
  
  lines.forEach((line, index) => {
    // Check for using namespace std
    if (line.includes('using namespace std;')) {
      comments.push({
        line: index + 1,
        text: "Avoid using 'using namespace std' in header files as it can lead to name conflicts",
        type: "warning"
      });
    }
    
    // Check for raw pointers
    if (line.match(/\w+\s*\*\s*\w+/)) {
      comments.push({
        line: index + 1,
        text: "Consider using smart pointers (std::shared_ptr, std::unique_ptr) instead of raw pointers",
        type: "suggestion"
      });
    }
  });
  
  return comments;
}

function analyzeGeneric(lines: string[]): CodeComment[] {
  const comments: CodeComment[] = [];
  
  // Check for very long lines
  lines.forEach((line, index) => {
    if (line.length > 100) {
      comments.push({
        line: index + 1,
        text: "Line is very long (over 100 characters). Consider breaking it up for readability",
        type: "suggestion"
      });
    }
    
    // Check for trailing whitespace
    if (line.match(/\s+$/)) {
      comments.push({
        line: index + 1,
        text: "Line contains trailing whitespace",
        type: "info",
        suggestion: line.trimEnd()
      });
    }
  });
  
  return comments;
}

// Merge AI analysis with static analysis
export function mergeAnalysisResults(
  aiResult: ReviewResult, 
  staticComments: CodeComment[]
): ReviewResult {
  // Create a map of existing comments by line to avoid duplicates
  const commentsByLine = new Map<number, Set<string>>();
  
  aiResult.comments.forEach(comment => {
    if (!commentsByLine.has(comment.line)) {
      commentsByLine.set(comment.line, new Set());
    }
    commentsByLine.get(comment.line)?.add(comment.text);
  });
  
  // Add static analysis comments if they don't duplicate
  staticComments.forEach(comment => {
    if (!commentsByLine.has(comment.line) || 
        !commentsByLine.get(comment.line)?.has(comment.text)) {
      aiResult.comments.push(comment);
      
      // Update the issues count based on the comment type
      if (comment.type === 'error') {
        aiResult.issues.critical += 1;
      } else if (comment.type === 'warning') {
        aiResult.issues.warnings += 1;
      } else if (comment.type === 'info') {
        aiResult.issues.info += 1;
      }
    }
  });
  
  // Sort comments by line number
  aiResult.comments.sort((a, b) => a.line - b.line);
  
  return aiResult;
}
