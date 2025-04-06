import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeCode } from "./ai";
import { performBasicAnalysis, mergeAnalysisResults } from "./codeAnalysis";
import { 
  codeSubmissionSchema, 
  type CodeSubmission, 
  gitlabConfigSchema,
  gitlabMergeRequestSchema,
  type ReviewResult
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import GitLabApi from "./gitlab";

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
      
      // Add GitLab integration info if provided
      if (submission.gitlabProjectId && submission.gitlabMergeRequestId) {
        finalResult.gitlabIntegration = {
          projectId: submission.gitlabProjectId,
          mergeRequestId: submission.gitlabMergeRequestId,
          commitSha: submission.gitlabCommitSha,
          reviewUrl: `https://gitlab.com/projects/${submission.gitlabProjectId}/merge_requests/${submission.gitlabMergeRequestId}`
        };
      }
      
      // Store the review
      const review = await storage.createReview({
        language: submission.language,
        reviewType: submission.reviewType,
        code: submission.code,
        results: finalResult,
        userId: null, // No user authentication in this version
        gitlabProjectId: submission.gitlabProjectId,
        gitlabMergeRequestId: submission.gitlabMergeRequestId,
        gitlabCommitSha: submission.gitlabCommitSha
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

  // GitLab Integration Routes
  
  // Connect to GitLab
  app.post("/api/gitlab/connect", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = gitlabConfigSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const gitlabConfig = result.data;
      
      // Test the connection by fetching the user info
      const gitlab = new GitLabApi(gitlabConfig);
      const user = await gitlab.getCurrentUser();
      
      // Store GitHub token in user settings (would need auth in a real app)
      // For now, just return success
      return res.status(200).json({ 
        connected: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          avatar_url: user.avatar_url
        }
      });
    } catch (error) {
      console.error("GitLab connection error:", error);
      return res.status(500).json({ 
        connected: false,
        message: "Failed to connect to GitLab. Please check your token." 
      });
    }
  });
  
  // Get GitLab projects
  app.get("/api/gitlab/projects", async (req: Request, res: Response) => {
    try {
      const token = req.headers['gitlab-token'] as string;
      
      if (!token) {
        return res.status(401).json({ message: "GitLab token is required" });
      }
      
      const gitlab = new GitLabApi({ token });
      const projects = await gitlab.getProjects();
      
      return res.status(200).json(projects);
    } catch (error) {
      console.error("Get GitLab projects error:", error);
      return res.status(500).json({ message: "Failed to get GitLab projects" });
    }
  });
  
  // Get merge requests for a project
  app.get("/api/gitlab/projects/:projectId/merge_requests", async (req: Request, res: Response) => {
    try {
      const token = req.headers['gitlab-token'] as string;
      const projectId = parseInt(req.params.projectId);
      
      if (!token) {
        return res.status(401).json({ message: "GitLab token is required" });
      }
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const gitlab = new GitLabApi({ token });
      const mergeRequests = await gitlab.getMergeRequests(projectId);
      
      return res.status(200).json(mergeRequests);
    } catch (error) {
      console.error("Get GitLab merge requests error:", error);
      return res.status(500).json({ message: "Failed to get GitLab merge requests" });
    }
  });
  
  // Post review to GitLab
  app.post("/api/gitlab/post-review/:reviewId", async (req: Request, res: Response) => {
    try {
      const token = req.headers['gitlab-token'] as string;
      const reviewId = parseInt(req.params.reviewId);
      
      if (!token) {
        return res.status(401).json({ message: "GitLab token is required" });
      }
      
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      
      // Get the review
      const review = await storage.getReview(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Check if review has GitLab integration info
      if (!review.gitlabProjectId || !review.gitlabMergeRequestId) {
        return res.status(400).json({ 
          message: "This review is not associated with a GitLab merge request" 
        });
      }
      
      // Create GitLab API client
      const gitlab = new GitLabApi({ token });
      
      // Post the comments
      const commentResults = await gitlab.postCodeReviewComments(
        review.gitlabProjectId,
        review.gitlabMergeRequestId,
        (review.results as ReviewResult).comments
      );
      
      // Update the review with comment IDs
      const commentIds = commentResults.map(c => c.id);
      await storage.updateReviewGitlabInfo(reviewId, commentIds);
      
      return res.status(200).json({ 
        success: true,
        message: "Review posted to GitLab successfully",
        commentCount: commentResults.length
      });
    } catch (error) {
      console.error("Post review to GitLab error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to post review to GitLab" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
