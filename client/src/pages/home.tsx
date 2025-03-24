import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmissionForm from "@/components/SubmissionForm";
import ReviewResults from "@/components/ReviewResults";
import { useCodeReview, CodeReviewForm } from "@/hooks/useCodeReview";
import type { ReviewResult } from "@shared/schema";

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
    } catch (error) {
      console.error("Error submitting code for review:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Submission Form */}
          <SubmissionForm 
            onSubmit={handleSubmit}
            isPending={submitReview.isPending}
          />
          
          {/* Review Results */}
          {reviewData.result && (
            <ReviewResults
              code={reviewData.code}
              language={reviewData.language}
              reviewType={reviewData.reviewType}
              result={reviewData.result}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
