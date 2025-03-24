import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeCode } from "./ai";
import { performBasicAnalysis, mergeAnalysisResults } from "./codeAnalysis";
import { codeSubmissionSchema, type CodeSubmission } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for code review
  app.post("/api/review", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = codeSubmissionSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const submission: CodeSubmission = result.data;
      
      // Perform basic static analysis
      const staticAnalysisComments = performBasicAnalysis(submission);
      
      // Get AI-powered analysis
      const aiAnalysisResult = await analyzeCode(submission);
      
      // Merge analysis results
      const finalResult = mergeAnalysisResults(aiAnalysisResult, staticAnalysisComments);
      
      // Store the review
      await storage.createReview({
        language: submission.language,
        reviewType: submission.reviewType,
        code: submission.code,
        results: finalResult,
        userId: null // No user authentication in this version
      });
      
      // Return results
      return res.status(200).json(finalResult);
    } catch (error) {
      console.error("Review error:", error);
      return res.status(500).json({ message: "Failed to review code" });
    }
  });
  
  // Get review history
  app.get("/api/reviews", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reviews = await storage.getReviews(undefined, limit);
      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      return res.status(500).json({ message: "Failed to get review history" });
    }
  });
  
  // Get a single review by ID
  app.get("/api/reviews/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      const review = await storage.getReview(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      return res.status(200).json(review);
    } catch (error) {
      console.error("Get review error:", error);
      return res.status(500).json({ message: "Failed to get review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
