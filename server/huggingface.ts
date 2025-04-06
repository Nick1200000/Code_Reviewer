import { HfInference } from '@huggingface/inference';
import type { ReviewResult, CodeComment, CodeSubmission } from "@shared/schema";
import { performBasicAnalysis } from "./codeAnalysis";

// Default model for code review
const HF_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"; // A powerful open-source model
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Sleep function for retry delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get prompt for code review
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

IMPORTANT: Your response must be valid JSON only, with no other text before or after.
`;
}

// Call Hugging Face with retry logic
async function callHuggingFaceWithRetry(
  prompt: string,
  model: string,
  retryCount = 0
): Promise<ReviewResult | null> {
  try {
    console.log(`Attempting HuggingFace API call with model: ${model}, retry: ${retryCount}`);
    
    const response = await hf.textGeneration({
      model: model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.1,
        return_full_text: false
      }
    });

    if (!response.generated_text) {
      throw new Error("Empty response from Hugging Face API");
    }

    // Extract JSON from the response
    let jsonText = response.generated_text.trim();
    
    // If the response contains markdown code blocks, extract the content
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    }

    try {
      return JSON.parse(jsonText) as ReviewResult;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.log("Response content:", jsonText);
      throw new Error("Invalid JSON response");
    }
  } catch (error: any) {
    // Check if it's a rate limit error
    const isRateLimitError = error.status === 429;
    
    // If we have retries left and it's a rate limit error, retry
    if (retryCount < MAX_RETRIES && isRateLimitError) {
      console.log(`Rate limit hit, retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return callHuggingFaceWithRetry(prompt, model, retryCount + 1);
    }
    
    // If all retries failed or it's a non-retriable error
    console.error(`API call failed after retries or non-retriable error:`, error);
    return null;
  }
}

// Main function to analyze code
export async function analyzeCodeWithHuggingFace(submission: CodeSubmission): Promise<ReviewResult> {
  try {
    const prompt = getPromptForCodeReview(submission);
    
    // Try to get a result from Hugging Face
    const huggingFaceResult = await callHuggingFaceWithRetry(prompt, HF_MODEL);
    
    if (huggingFaceResult) {
      console.log("Successfully got analysis from Hugging Face");
      return huggingFaceResult;
    }
    
    // If Hugging Face analysis failed, fallback to basic analysis
    console.log("Hugging Face analysis failed, falling back to basic analysis");
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