import { HfInference } from '@huggingface/inference';
import type { ReviewResult, CodeComment, CodeSubmission, CommentType } from "@shared/schema";
import { performBasicAnalysis } from "./codeAnalysis";

// Default model for code review
const HF_MODEL = "meta-llama/Llama-2-70b-chat-hf"; // A powerful open-source model for code analysis
// Fallback model if the primary model is not available
const FALLBACK_HF_MODEL = "codellama/CodeLlama-34b-Instruct-hf"; // Alternative model for code analysis
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
<s>[INST]
You are an elite code reviewer for ${language} code who specializes in providing comprehensive, accurate analysis. ${focusInstructions}

Please review the following code and return ONLY a JSON response with your analysis:
\`\`\`${language}
${code}
\`\`\`

IMPORTANT INSTRUCTIONS:
1. Your ENTIRE response must be valid JSON that can be parsed by JSON.parse()
2. DO NOT include any explanation, greeting, markdown formatting, or additional text
3. DO NOT repeat the code in your response unless in the improvedCode field
4. NEVER wrap your JSON in code blocks or quotation marks
5. Your response must match EXACTLY the format below

JSON FORMAT:
{
  "metrics": {
    "overall": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "maintainability": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "performance": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) },
    "security": { "grade": "A-F with plus/minus", "score": 0-100, "change": percentage change (optional) }
  },
  "comments": [
    { 
      "line": line number (integer), 
      "text": "detailed explanation of the issue", 
      "type": "error|warning|suggestion|info",
      "suggestion": "code suggestion to fix (optional)"
    }
  ],
  "improvedCode": "Improved version of the entire code with all suggestions applied",
  "keyImprovements": ["list of key improvements made", "maximum 6 items"],
  "issues": {
    "critical": number of critical issues (integer),
    "warnings": number of warnings (integer),
    "info": number of informational items (integer),
    "types": [
      {
        "name": "issue category name",
        "description": "brief description of the issue category",
        "severity": "high|medium|low"
      }
    ]
  }
}

The output should be ONLY the JSON with no introduction and no explanation. The JSON must be valid and parsable.
[/INST]</s>
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
        max_new_tokens: 4096,
        temperature: 0.1,
        top_p: 0.95,
        top_k: 40,
        repetition_penalty: 1.1,
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
      
      // Attempt to extract code analysis from non-JSON response
      if (jsonText.length > 100) {
        console.log("Attempting to create a synthetic result from non-JSON response...");
        return createSyntheticResultFromText(jsonText, model);
      }
      
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
    
    // Check if it's a model access error (often related to permissions for the model)
    if (error.message && error.message.includes("You don't have access to")) {
      console.error("Model access error: You don't have permission to use this model. Using fallback analysis instead.");
      console.error("Tip: You may need to visit huggingface.co and accept the model's terms of use with your account.");
    }
    
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
    
    // Try fallback model if the primary model fails
    console.log(`Primary model (${HF_MODEL}) failed, trying fallback model (${FALLBACK_HF_MODEL})...`);
    const fallbackResult = await callHuggingFaceWithRetry(prompt, FALLBACK_HF_MODEL);
    
    if (fallbackResult) {
      console.log("Successfully got analysis from fallback model");
      return fallbackResult;
    }
    
    // If both models fail, fallback to basic analysis
    console.log("All Hugging Face models failed, falling back to basic analysis");
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

// Create a result from non-JSON text response (when the model doesn't return JSON)
function createSyntheticResultFromText(text: string, modelName: string): ReviewResult {
  console.log(`Creating synthetic result from model ${modelName} text output...`);
  
  // Extract any lines that might be comments
  const lines = text.split('\n');
  const comments: CodeComment[] = [];
  let currentLine = 1;
  let improvedCode = '';
  
  // Try to identify if this is code (check for imports, functions, classes, etc.)
  const isCodeResponse = text.includes('import ') || 
                        text.includes('function ') || 
                        text.includes('class ') || 
                        text.includes('const ') || 
                        text.includes('let ');
  
  if (isCodeResponse) {
    improvedCode = text; // The model returned code, use it as improved code
    
    // Add a comment explaining the situation
    comments.push({
      line: 1,
      text: "The model provided an improved version of your code instead of a detailed analysis.",
      type: "info"
    });
  } else {
    // Try to extract comments from the text response
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) {
        currentLine++;
        continue;
      }
      
      // Try to identify issues, warnings, etc.
      let type: CommentType = "info";
      if (trimmedLine.toLowerCase().includes('error') || 
          trimmedLine.toLowerCase().includes('critical') ||
          trimmedLine.toLowerCase().includes('severe')) {
        type = "error";
      } else if (trimmedLine.toLowerCase().includes('warning') ||
                trimmedLine.toLowerCase().includes('caution') ||
                trimmedLine.toLowerCase().includes('consider')) {
        type = "warning";
      } else if (trimmedLine.toLowerCase().includes('suggest') ||
                trimmedLine.toLowerCase().includes('recommend') ||
                trimmedLine.toLowerCase().includes('improvement')) {
        type = "suggestion";
      }
      
      // Add comment if the line has enough content
      if (trimmedLine.length > 20) {
        comments.push({
          line: currentLine,
          text: trimmedLine,
          type
        });
      }
      
      currentLine++;
    }
  }
  
  // Determine metrics based on comments
  const criticalCount = comments.filter(c => c.type === "error").length;
  const warningCount = comments.filter(c => c.type === "warning").length;
  const infoCount = comments.filter(c => c.type === "info" || c.type === "suggestion").length;
  
  // Generate grade
  let grade = "B-";
  let score = 80;
  
  if (isCodeResponse) {
    grade = "B+";
    score = 85;
  } else if (criticalCount > 2) {
    grade = "C+";
    score = 75;
  } else if (warningCount > 5) {
    grade = "B-";
    score = 80;
  }
  
  return {
    metrics: {
      overall: { grade, score },
      maintainability: { grade, score },
      performance: { grade, score: score - 5 },
      security: { grade, score: score - 5 }
    },
    comments: comments.length > 0 ? comments : [
      {
        line: 1,
        text: "The analysis model provided a non-standard response. Basic analysis has been provided instead.",
        type: "info"
      }
    ],
    improvedCode: improvedCode || undefined,
    issues: {
      critical: criticalCount,
      warnings: warningCount,
      info: infoCount,
      types: [
        {
          name: "Model Response Issue",
          description: `The ${modelName} model didn't return a valid JSON response. Limited analysis available.`,
          severity: "medium"
        }
      ]
    },
    keyImprovements: isCodeResponse ? 
      ["Improved code structure", "Enhanced readability", "Fixed potential issues"] :
      ["Consider security best practices", "Improve error handling", "Enhance code organization"]
  };
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