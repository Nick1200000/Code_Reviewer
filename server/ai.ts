import OpenAI from "openai";
import type { ReviewResult, CodeComment, CodeSubmission } from "@shared/schema";
import { performBasicAnalysis } from "./codeAnalysis";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";
// Fallback to GPT-3.5 Turbo if GPT-4 is not available or quota exceeded
const FALLBACK_MODEL = "gpt-3.5-turbo";
// Max retries for API calls
const MAX_RETRIES = 2;
// Delay between retries (in ms)
const RETRY_DELAY = 1000;

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" 
});

function getPromptForCodeReview(submission: CodeSubmission): string {
  const { language, reviewType, code } = submission;
  
  let focusInstructions = "";
  if (reviewType === "Syntax Only") {
    focusInstructions = "Focus primarily on syntax errors and coding style issues.";
  } else if (reviewType === "Security Focus") {
    focusInstructions = "Focus primarily on security vulnerabilities and best practices.";
  } else if (reviewType === "Performance Focus") {
    focusInstructions = "Focus primarily on performance optimizations and issues.";
  }

  return `
You are an expert code reviewer for ${language} code. ${focusInstructions}

Please review the following code and provide a detailed analysis:
\`\`\`${language}
${code}
\`\`\`

Analyze the code for:
1. Syntax errors and bugs
2. Style issues and best practices
3. Performance concerns
4. Security vulnerabilities
5. Code structure and organization

Generate a JSON response with the following format:
{
  "metrics": {
    "overall": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "maintainability": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "performance": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "security": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) }
  },
  "comments": [
    { 
      "line": line number, 
      "text": "detailed explanation of the issue", 
      "type": "error|warning|suggestion|info",
      "suggestion": "code suggestion to fix (optional)"
    }
  ],
  "improvedCode": "Improved version of the entire code with all suggestions applied",
  "keyImprovements": ["list of key improvements made", "maximum 6 items"],
  "issues": {
    "critical": number of critical issues,
    "warnings": number of warnings,
    "info": number of informational items,
    "types": [
      {
        "name": "issue category name",
        "description": "brief description of the issue category",
        "severity": "high|medium|low"
      }
    ]
  }
}
`;
}

// Sleep function for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Attempt to call OpenAI API with retry logic
async function callOpenAIWithRetry(
  prompt: string, 
  currentModel: string, 
  retryCount = 0
): Promise<ReviewResult | null> {
  try {
    console.log(`Attempting API call with model: ${currentModel}, retry: ${retryCount}`);
    
    const response = await openai.chat.completions.create({
      model: currentModel,
      messages: [
        { 
          role: "system", 
          content: "You are an AI code reviewer expert. Always respond in the exact JSON format requested."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    return JSON.parse(content) as ReviewResult;
  } catch (error: any) {
    // Check if it's a rate limit or quota error
    const isRateLimitError = error.status === 429;
    const isQuotaError = error.code === "insufficient_quota";
    
    // If we have retries left, and it's a rate limit error, retry
    if (retryCount < MAX_RETRIES && isRateLimitError && !isQuotaError) {
      console.log(`Rate limit hit, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return callOpenAIWithRetry(prompt, currentModel, retryCount + 1);
    }
    
    // If we're using the primary model and hit a quota error, try the fallback model
    if (currentModel === OPENAI_MODEL && (isRateLimitError || isQuotaError)) {
      console.log(`Quota or rate limit issue with primary model, trying fallback model: ${FALLBACK_MODEL}`);
      return callOpenAIWithRetry(prompt, FALLBACK_MODEL, 0);
    }
    
    // If all retries failed or it's a non-retriable error
    console.error(`API call failed after retries or non-retriable error:`, error);
    return null;
  }
}

export async function analyzeCode(submission: CodeSubmission): Promise<ReviewResult> {
  try {
    const prompt = getPromptForCodeReview(submission);
    
    // Try to get a result from OpenAI
    const openAIResult = await callOpenAIWithRetry(prompt, OPENAI_MODEL);
    
    if (openAIResult) {
      console.log("Successfully got analysis from OpenAI");
      return openAIResult;
    }
    
    // If OpenAI analysis failed, fallback to basic analysis
    console.log("OpenAI analysis failed, falling back to basic analysis");
    const basicComments = performBasicAnalysis(submission);
    
    return generateFallbackResult(basicComments, submission.language);
    
  } catch (error) {
    console.error("Complete error in analysis process:", error);
    
    // Last resort fallback - basic static analysis
    try {
      const basicComments = performBasicAnalysis(submission);
      return generateFallbackResult(basicComments, submission.language);
    } catch (innerError) {
      console.error("Even basic analysis failed:", innerError);
      // Return a generic fallback result
      return generateFallbackResult([], submission.language);
    }
  }
}

// Generate a fallback result using basic analysis
function generateFallbackResult(comments: CodeComment[], language: string): ReviewResult {
  // Count issues by type
  const criticalCount = comments.filter(c => c.type === "error").length;
  const warningCount = comments.filter(c => c.type === "warning").length;
  const infoCount = comments.filter(c => c.type === "info" || c.type === "suggestion").length;
  
  // Generate grade based on issues
  const totalIssues = criticalCount + warningCount + infoCount;
  let grade = "C";
  let score = 70;
  
  if (criticalCount === 0 && warningCount === 0) {
    grade = "A-";
    score = 90;
  } else if (criticalCount === 0 && warningCount <= 2) {
    grade = "B+";
    score = 85;
  } else if (criticalCount <= 1 && totalIssues <= 5) {
    grade = "B-";
    score = 80;
  } else if (criticalCount >= 3) {
    grade = "D+";
    score = 65;
  }
  
  return {
    metrics: {
      overall: { grade, score },
      maintainability: { grade, score },
      performance: { grade: "C+", score: 75 },
      security: { grade: "C", score: 70 }
    },
    comments,
    issues: {
      critical: criticalCount,
      warnings: warningCount,
      info: infoCount,
      types: [
        {
          name: "Analysis Limitations",
          description: "Limited analysis due to API constraints. Only basic issues detected.",
          severity: "medium"
        },
        {
          name: "Static Analysis",
          description: `Basic ${language} code analysis performed without semantic understanding.`,
          severity: "medium"
        }
      ]
    },
    keyImprovements: [
      "Fix identified syntax errors",
      "Address style inconsistencies",
      "Review code structure",
      "Consider security implications",
      "Ensure proper error handling"
    ]
  };
}
