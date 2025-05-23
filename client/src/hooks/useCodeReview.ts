import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { ReviewResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type CodeReviewForm = {
  language: string;
  reviewType: string;
  code: string;
};

export function useCodeReview() {
  const [latestReviewId, setLatestReviewId] = useState<number | null>(null);
  const { toast } = useToast();

  // Mutation to submit code for review
  const submitReview = useMutation({
    mutationFn: async (data: CodeReviewForm) => {
      const result = await apiRequest("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }, "json");
      return result as ReviewResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
    },
    onError: (error: any) => {
      console.error("Review error:", error);
      
      // Check if the error has a response with a missingKey field
      if (error.response?.data?.missingKey) {
        // We'll let the useApiKeySetup hook handle this, but still show a toast
        const service = error.response?.data?.missingKey === 'HUGGINGFACE_API_KEY' ? 'Hugging Face' : 'OpenAI';
        toast({
          title: `${service} API Key Required`,
          description: `A valid ${service} API key is required for code analysis. Please enter your API key in the dialog.`,
          variant: "destructive",
          duration: 6000,
        });
        // The error will be passed to the component where handleMissingApiKey will process it
      } else {
        toast({
          title: "Review Failed",
          description: error.message || "Failed to submit code for review",
          variant: "destructive",
        });
      }
    },
  });

  // Query to get review history
  const reviewHistory = useQuery({
    queryKey: ["/api/reviews"],
    enabled: false, // Don't fetch automatically
  });

  // Query to get a specific review
  const getReview = useQuery({
    queryKey: latestReviewId ? ["/api/reviews", latestReviewId] : ["/api/reviews", "empty"],
    enabled: !!latestReviewId,
  });

  return {
    submitReview,
    reviewHistory,
    getReview,
    setLatestReviewId,
  };
}
