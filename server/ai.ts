import OpenAI from "openai";
import type { ReviewResult, CodeComment, CodeSubmission } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

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

export async function analyzeCode(submission: CodeSubmission): Promise<ReviewResult> {
  try {
    const prompt = getPromptForCodeReview(submission);
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
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

    const result = JSON.parse(content) as ReviewResult;
    return result;
    
  } catch (error) {
    console.error("Error analyzing code:", error);
    
    // Return a fallback result with an error message
    return {
      metrics: {
        overall: { grade: "N/A", score: 0 },
        maintainability: { grade: "N/A", score: 0 },
        performance: { grade: "N/A", score: 0 },
        security: { grade: "N/A", score: 0 }
      },
      comments: [
        {
          line: 1,
          text: "Error analyzing code. Please try again later.",
          type: "error"
        }
      ],
      issues: {
        critical: 1,
        warnings: 0,
        info: 0,
        types: [
          {
            name: "API Error",
            description: "Failed to analyze code due to an API error",
            severity: "high"
          }
        ]
      }
    };
  }
}
