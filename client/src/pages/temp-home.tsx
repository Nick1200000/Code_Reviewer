import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmissionForm from "@/components/SubmissionForm";
import ReviewResults from "@/components/ReviewResults";
import { useCodeReview, CodeReviewForm } from "@/hooks/useCodeReview";
import type { ReviewResult } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { submitReview } = useCodeReview();
  const [reviewData, setReviewData] = useState<{
    code: string;
    language: string;
    reviewType: string;
    result: ReviewResult | null;
  }>({
    code: "",
    language: "",
    reviewType: "",
    result: null,
  });

  const handleSubmit = async (values: CodeReviewForm) => {
    try {
      const result = await submitReview.mutateAsync(values);
      setReviewData({
        code: values.code,
        language: values.language,
        reviewType: values.reviewType,
        result,
      });
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error submitting code for review:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        {!reviewData.result && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    <span className="block">Transform Your</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-indigo-100">
                      Code Quality
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
                    CodeInsight Pro uses advanced AI to analyze your code, identify bugs, security vulnerabilities, and provide actionable recommendations.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-700 hover:bg-blue-50 font-medium shadow-lg"
                      onClick={() => document.getElementById('code-form')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Try It Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="bg-transparent border-white text-white hover:bg-white/10"
                    >
                      Enterprise Solutions
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg transform -rotate-2"></div>
                    <div className="relative bg-gray-900 text-blue-300 p-6 rounded-lg shadow-2xl transform rotate-1">
                      <div className="font-mono text-sm">
                        <div className="flex items-center gap-2 mb-4 text-xs">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-gray-400 ml-2">code-review.js</span>
                        </div>
                        <pre className="overflow-x-auto">
                          <code>
{`function analyzeCode(code) {
  // AI-powered code analysis
  const issues = findIssues(code);
  const improvements = suggestImprovements(issues);
  
  return {
    metrics: calculateMetrics(code),
    comments: generateComments(issues),
    improvedCode: applyFixes(code, improvements)
  };
}`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!reviewData.result && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Why Leading Companies Choose CodeInsight Pro
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                  Our AI-powered code review platform helps development teams deliver high-quality 
                  software faster and more efficiently.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    title: "Accelerate Development",
                    description: "Catch issues early and reduce debugging time with instant feedback on your code quality, security, and performance."
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ),
                    title: "Enhance Security",
                    description: "Identify security vulnerabilities before they reach production with our comprehensive security analysis."
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ),
                    title: "Improve Code Quality",
                    description: "Enforce consistent coding standards across your organization with customizable rules and detailed suggestions."
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Submission Form */}
        <div id="code-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={reviewData.result ? "" : "max-w-3xl mx-auto"}>
            {!reviewData.result && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Try CodeInsight Pro Now
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Paste your code below to get an instant, comprehensive analysis
                </p>
              </div>
            )}
            
            <SubmissionForm 
              onSubmit={handleSubmit}
              isPending={submitReview.isPending}
            />
          </div>
          
          {/* Review Results */}
          {reviewData.result && (
            <div id="results-section" className="mt-12">
              <ReviewResults
                code={reviewData.code}
                language={reviewData.language}
                reviewType={reviewData.reviewType}
                result={reviewData.result}
              />
            </div>
          )}
        </div>
        
        {/* CTA Section */}
        {!reviewData.result && (
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to improve your code quality?</h2>
              <p className="text-indigo-100 text-lg mb-6 max-w-2xl mx-auto">
                Join thousands of developers and companies who use CodeInsight Pro to deliver better software.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
                  onClick={() => document.getElementById('code-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Start Your Free Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}