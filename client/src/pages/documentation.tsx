import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Documentation() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Code Reviewer Documentation</h1>
          <p className="text-lg text-gray-600 mb-8">
            Learn how to use the AI-powered code reviewer tool effectively to improve your code quality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Getting Started
                </CardTitle>
                <CardDescription>Learn the basics of code review with AI</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Submit your code for AI analysis</li>
                  <li>Choose the appropriate programming language</li>
                  <li>Select a review type based on your needs</li>
                  <li>Analyze the results and apply improvements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Review Types
                </CardTitle>
                <CardDescription>Understanding different review approaches</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Comprehensive:</strong> Full analysis of style, performance, security, and best practices</li>
                  <li><strong>Syntax Only:</strong> Focus on syntax errors and coding style issues</li>
                  <li><strong>Security Focus:</strong> Emphasis on security vulnerabilities and secure coding</li>
                  <li><strong>Performance Focus:</strong> Focus on performance optimizations and efficiency</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Supported Languages
                </CardTitle>
                <CardDescription>Languages we can analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <p>• Python</p>
                    <p>• JavaScript</p>
                    <p>• TypeScript</p>
                    <p>• Java</p>
                    <p>• C++</p>
                    <p>• Go</p>
                  </div>
                  <div className="space-y-1">
                    <p>• Ruby</p>
                    <p>• PHP</p>
                    <p>• C#</p>
                    <p>• Rust</p>
                    <p>• Swift</p>
                    <p>• Kotlin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Using the Code Review Results</h2>
          <div className="space-y-6 mb-10">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Understanding Metrics
              </h3>
              <p className="mb-4 text-gray-600">
                The code review provides metrics in four key areas to help you understand the quality of your code:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Overall Quality</h4>
                  <p className="text-sm text-gray-600">A general assessment of your code quality, considering all aspects of the review.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Maintainability</h4>
                  <p className="text-sm text-gray-600">How easy your code is to understand, modify, and extend over time.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                  <p className="text-sm text-gray-600">Efficiency of your code in terms of execution time and resource usage.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Security</h4>
                  <p className="text-sm text-gray-600">Assessment of potential security vulnerabilities and secure coding practices.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Comment Types
              </h3>
              <p className="mb-4 text-gray-600">
                The AI reviewer provides different types of comments to help you improve your code:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-red-100 flex items-center justify-center text-red-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Errors</h4>
                    <p className="text-sm text-gray-600">Critical issues that need immediate attention, such as syntax errors or bugs that would prevent your code from running correctly.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Warnings</h4>
                    <p className="text-sm text-gray-600">Issues that might not prevent your code from running but could lead to unexpected behavior or future problems.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Suggestions</h4>
                    <p className="text-sm text-gray-600">Recommendations for improving code quality, readability, or performance without changing functionality.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Info</h4>
                    <p className="text-sm text-gray-600">Informational comments that highlight interesting aspects of your code or educational points.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporting Reports
              </h3>
              <p className="mb-4 text-gray-600">
                You can export your code review results as a PDF or text file for future reference or sharing with your team:
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li className="text-gray-600">Click the "Download Report" button after receiving your code review</li>
                <li className="text-gray-600">Choose your preferred format (PDF or TXT)</li>
                <li className="text-gray-600">Save the file to your preferred location</li>
                <li className="text-gray-600">The report includes code metrics, comments, and suggested improvements</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}