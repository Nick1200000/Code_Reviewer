import { ReviewResult, CodeComment } from "@shared/schema";

// Helper function to get a text representation of a grade
function getGradeDescription(grade: string): string {
  switch (grade) {
    case 'A+': return 'Excellent';
    case 'A': return 'Very Good';
    case 'B+': return 'Good';
    case 'B': return 'Above Average';
    case 'C+': return 'Average';
    case 'C': return 'Below Average';
    case 'D': return 'Poor';
    case 'F': return 'Failing';
    default: return grade;
  }
}

// Helper function to format date
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper to group comments by type
function groupCommentsByType(comments: CodeComment[]): Record<string, CodeComment[]> {
  const grouped: Record<string, CodeComment[]> = {
    error: [],
    warning: [],
    suggestion: [],
    info: []
  };

  comments.forEach(comment => {
    if (grouped[comment.type]) {
      grouped[comment.type].push(comment);
    } else {
      grouped.info.push(comment);
    }
  });

  return grouped;
}

// Generate a text report for download
export function generateTextReport(
  code: string,
  language: string,
  reviewType: string,
  result: ReviewResult
): string {
  const date = formatDate(new Date());
  const groupedComments = groupCommentsByType(result.comments);
  
  let report = `
=======================================
     CODE REVIEW REPORT
=======================================
Date: ${date}
Language: ${language}
Review Type: ${reviewType}

--------------------------------------
QUALITY METRICS
--------------------------------------
Overall: ${result.metrics.overall.grade} (${getGradeDescription(result.metrics.overall.grade)})
Maintainability: ${result.metrics.maintainability.grade} (${getGradeDescription(result.metrics.maintainability.grade)})
Performance: ${result.metrics.performance.grade} (${getGradeDescription(result.metrics.performance.grade)})
Security: ${result.metrics.security.grade} (${getGradeDescription(result.metrics.security.grade)})

--------------------------------------
ISSUES SUMMARY
--------------------------------------
Critical Issues: ${result.issues.critical}
Warnings: ${result.issues.warnings}
Informational: ${result.issues.info}

--------------------------------------
KEY IMPROVEMENTS
--------------------------------------
${result.keyImprovements?.map(improvement => `- ${improvement}`).join('\n') || 'No specific improvements listed.'}

--------------------------------------
DETAILED COMMENTS
--------------------------------------
`;

  // Add errors
  if (groupedComments.error.length > 0) {
    report += '\nERRORS:\n';
    groupedComments.error.forEach(comment => {
      report += `Line ${comment.line}: ${comment.text}\n`;
      if (comment.suggestion) {
        report += `Suggestion: ${comment.suggestion}\n`;
      }
      report += '\n';
    });
  }

  // Add warnings
  if (groupedComments.warning.length > 0) {
    report += '\nWARNINGS:\n';
    groupedComments.warning.forEach(comment => {
      report += `Line ${comment.line}: ${comment.text}\n`;
      if (comment.suggestion) {
        report += `Suggestion: ${comment.suggestion}\n`;
      }
      report += '\n';
    });
  }

  // Add suggestions
  if (groupedComments.suggestion.length > 0) {
    report += '\nSUGGESTIONS:\n';
    groupedComments.suggestion.forEach(comment => {
      report += `Line ${comment.line}: ${comment.text}\n`;
      if (comment.suggestion) {
        report += `Suggestion: ${comment.suggestion}\n`;
      }
      report += '\n';
    });
  }

  // Add informational comments
  if (groupedComments.info.length > 0) {
    report += '\nINFORMATIONAL:\n';
    groupedComments.info.forEach(comment => {
      report += `Line ${comment.line}: ${comment.text}\n`;
      if (comment.suggestion) {
        report += `Suggestion: ${comment.suggestion}\n`;
      }
      report += '\n';
    });
  }

  // Add the code itself
  report += `
--------------------------------------
REVIEWED CODE
--------------------------------------
Language: ${language}
`;

  const codeLines = code.split('\n');
  codeLines.forEach((line, index) => {
    report += `${String(index + 1).padStart(4, ' ')} | ${line}\n`;
  });

  return report;
}

// Download the report as a text file
export function downloadTextReport(
  code: string,
  language: string,
  reviewType: string,
  result: ReviewResult
): void {
  const reportText = generateTextReport(code, language, reviewType, result);
  const blob = new Blob([reportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `code-review-${language}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate HTML that can be used for PDF conversion
export function generateHtmlForPdf(
  code: string,
  language: string,
  reviewType: string,
  result: ReviewResult
): string {
  const date = formatDate(new Date());
  const groupedComments = groupCommentsByType(result.comments);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Code Review Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #2563eb;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        .metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .metric-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          flex: 1;
          min-width: 150px;
        }
        .grade {
          font-size: 24px;
          font-weight: bold;
        }
        .grade-A\\+, .grade-A {
          color: #059669;
        }
        .grade-B\\+, .grade-B {
          color: #65a30d;
        }
        .grade-C\\+, .grade-C {
          color: #eab308;
        }
        .grade-D {
          color: #f97316;
        }
        .grade-F {
          color: #ef4444;
        }
        .issues-summary {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .issue-box {
          flex: 1;
          text-align: center;
          padding: 10px;
          border-radius: 8px;
        }
        .critical {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .warning {
          background-color: #fef3c7;
          color: #92400e;
        }
        .info {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .comments-section {
          margin-top: 30px;
        }
        .comment {
          border-left: 4px solid #ddd;
          padding: 10px;
          margin-bottom: 15px;
        }
        .error {
          border-left-color: #ef4444;
        }
        .warning {
          border-left-color: #f59e0b;
        }
        .suggestion {
          border-left-color: #10b981;
        }
        .info {
          border-left-color: #3b82f6;
        }
        .suggestion-code {
          background-color: #f3f4f6;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
        }
        .code-section {
          margin-top: 30px;
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
        }
        .code-line {
          font-family: monospace;
          white-space: pre;
          line-height: 1.5;
        }
        .line-number {
          color: #94a3b8;
          padding-right: 15px;
          text-align: right;
          user-select: none;
          min-width: 40px;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Code Review Report</h1>
        <p>Generated on: ${date}</p>
        <p>Language: ${language} | Review Type: ${reviewType}</p>
      </div>

      <h2>Quality Metrics</h2>
      <div class="metrics">
        <div class="metric-card">
          <h3>Overall</h3>
          <div class="grade grade-${result.metrics.overall.grade}">${result.metrics.overall.grade}</div>
          <p>${getGradeDescription(result.metrics.overall.grade)}</p>
        </div>
        <div class="metric-card">
          <h3>Maintainability</h3>
          <div class="grade grade-${result.metrics.maintainability.grade}">${result.metrics.maintainability.grade}</div>
          <p>${getGradeDescription(result.metrics.maintainability.grade)}</p>
        </div>
        <div class="metric-card">
          <h3>Performance</h3>
          <div class="grade grade-${result.metrics.performance.grade}">${result.metrics.performance.grade}</div>
          <p>${getGradeDescription(result.metrics.performance.grade)}</p>
        </div>
        <div class="metric-card">
          <h3>Security</h3>
          <div class="grade grade-${result.metrics.security.grade}">${result.metrics.security.grade}</div>
          <p>${getGradeDescription(result.metrics.security.grade)}</p>
        </div>
      </div>

      <h2>Issues Summary</h2>
      <div class="issues-summary">
        <div class="issue-box critical">
          <h3>Critical</h3>
          <div style="font-size: 24px; font-weight: bold;">${result.issues.critical}</div>
        </div>
        <div class="issue-box warning">
          <h3>Warnings</h3>
          <div style="font-size: 24px; font-weight: bold;">${result.issues.warnings}</div>
        </div>
        <div class="issue-box info">
          <h3>Info</h3>
          <div style="font-size: 24px; font-weight: bold;">${result.issues.info}</div>
        </div>
      </div>

      <h2>Key Improvements</h2>
      <ul>
        ${result.keyImprovements?.map(improvement => `<li>${improvement}</li>`).join('') || '<li>No specific improvements listed.</li>'}
      </ul>
  `;

  // Add comments sections
  html += `<div class="comments-section">`;

  // Add errors
  if (groupedComments.error.length > 0) {
    html += `<h2>Errors</h2>`;
    groupedComments.error.forEach(comment => {
      html += `
        <div class="comment error">
          <p><strong>Line ${comment.line}:</strong> ${comment.text}</p>
          ${comment.suggestion ? `<div class="suggestion-code">${comment.suggestion}</div>` : ''}
        </div>
      `;
    });
  }

  // Add warnings
  if (groupedComments.warning.length > 0) {
    html += `<h2>Warnings</h2>`;
    groupedComments.warning.forEach(comment => {
      html += `
        <div class="comment warning">
          <p><strong>Line ${comment.line}:</strong> ${comment.text}</p>
          ${comment.suggestion ? `<div class="suggestion-code">${comment.suggestion}</div>` : ''}
        </div>
      `;
    });
  }

  // Add suggestions
  if (groupedComments.suggestion.length > 0) {
    html += `<h2>Suggestions</h2>`;
    groupedComments.suggestion.forEach(comment => {
      html += `
        <div class="comment suggestion">
          <p><strong>Line ${comment.line}:</strong> ${comment.text}</p>
          ${comment.suggestion ? `<div class="suggestion-code">${comment.suggestion}</div>` : ''}
        </div>
      `;
    });
  }

  // Add info
  if (groupedComments.info.length > 0) {
    html += `<h2>Information</h2>`;
    groupedComments.info.forEach(comment => {
      html += `
        <div class="comment info">
          <p><strong>Line ${comment.line}:</strong> ${comment.text}</p>
          ${comment.suggestion ? `<div class="suggestion-code">${comment.suggestion}</div>` : ''}
        </div>
      `;
    });
  }

  html += `</div>`;

  // Add the code section
  html += `
    <h2>Reviewed Code</h2>
    <div class="code-section">
  `;

  const codeLines = code.split('\n');
  codeLines.forEach((line, index) => {
    const lineNumber = index + 1;
    html += `
      <div class="code-line">
        <span class="line-number">${lineNumber}</span>${line}
      </div>
    `;
  });

  html += `
    </div>
    </body>
    </html>
  `;

  return html;
}

// Use browser capabilities to convert HTML to PDF and download it
export async function downloadPdfReport(
  code: string,
  language: string,
  reviewType: string,
  result: ReviewResult
): Promise<void> {
  try {
    // Generate HTML for PDF
    const htmlContent = generateHtmlForPdf(code, language, reviewType, result);
    
    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open a new window with the generated HTML content
    const printWindow = window.open(url, '_blank');
    
    // Wait for the window to load
    if (printWindow) {
      printWindow.onload = function() {
        // Print the window (or save as PDF)
        printWindow.document.title = `Code Review - ${language} - ${new Date().toLocaleDateString()}`;
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        URL.revokeObjectURL(url);
      };
    } else {
      // If popup was blocked, offer direct download of HTML
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-review-${language}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Please enable popups to generate PDF reports, or use the downloaded HTML file.");
    }
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert("Failed to generate PDF. Please try the text report option instead.");
  }
}