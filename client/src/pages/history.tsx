import { useEffect, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCodeReview } from "@/hooks/useCodeReview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Review } from "@shared/schema";

export default function History() {
  const { reviewHistory } = useCodeReview();
  
  useEffect(() => {
    reviewHistory.refetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Review History</h1>
            <Link href="/">
              <Button variant="outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Button>
            </Link>
          </div>
          
          {reviewHistory.isLoading ? (
            // Loading state
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 px-6 py-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-7 w-48" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-full max-w-md mb-4" />
                    <Skeleton className="h-32 w-full mb-4" />
                    <div className="flex justify-end mt-4">
                      <Skeleton className="h-9 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviewHistory.isError ? (
            // Error state
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center text-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium">Failed to load review history</h3>
                </div>
                <p className="mt-2 text-red-700">
                  {reviewHistory.error instanceof Error 
                    ? reviewHistory.error.message 
                    : "An unknown error occurred"}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => reviewHistory.refetch()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Data display
            <div className="space-y-4">
              {reviewHistory.data?.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No review history</h3>
                    <p className="mt-1 text-gray-500">You haven't submitted any code for review yet.</p>
                    <Link href="/">
                      <Button className="mt-4">Submit Your First Review</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                reviewHistory.data?.map((review: Review) => (
                  <ReviewHistoryCard key={review.id} review={review} />
                ))
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function ReviewHistoryCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const results = review.results as any; // Type casting since we know the shape
  const date = new Date(review.createdAt).toLocaleString();
  
  // Truncate code for display
  const codePreview = review.code.length > 200 
    ? review.code.substring(0, 200) + "..." 
    : review.code;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 px-6 py-4 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Review #{review.id}</CardTitle>
        <div className="flex space-x-2">
          <Badge variant="secondary">{review.language}</Badge>
          <Badge variant="outline">{review.reviewType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-gray-500 mb-3">{date}</p>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-gray-50 p-2 rounded text-sm">
            <span className="font-medium">Overall:</span> {results.metrics.overall.grade}
          </div>
          <div className="bg-gray-50 p-2 rounded text-sm">
            <span className="font-medium">Issues:</span> {results.issues.critical + results.issues.warnings + results.issues.info}
          </div>
        </div>
        
        <div className="font-mono text-xs p-3 bg-gray-50 rounded overflow-x-auto mb-4">
          <pre>{expanded ? review.code : codePreview}</pre>
        </div>
        
        {review.code.length > 200 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="mb-4"
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        )}
        
        <div className="flex justify-end mt-2">
          <Button variant="outline">
            View Full Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
