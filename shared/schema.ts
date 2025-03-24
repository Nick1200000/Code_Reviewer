import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains the same
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  gitlabToken: text("gitlab_token"),
  gitlabUsername: text("gitlab_username"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  gitlabToken: true,
  gitlabUsername: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Review schema for code review data
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  language: text("language").notNull(),
  reviewType: text("review_type").notNull(),
  code: text("code").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  gitlabProjectId: integer("gitlab_project_id"),
  gitlabMergeRequestId: integer("gitlab_merge_request_id"),
  gitlabCommitSha: text("gitlab_commit_sha"),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  language: true,
  reviewType: true,
  code: true,
  results: true,
  userId: true,
  gitlabProjectId: true,
  gitlabMergeRequestId: true,
  gitlabCommitSha: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Code submission schema for validating API requests
export const codeSubmissionSchema = z.object({
  language: z.string().min(1, "Language is required"),
  reviewType: z.string().min(1, "Review type is required"),
  code: z.string().min(1, "Code is required"),
  gitlabProjectId: z.number().optional(),
  gitlabMergeRequestId: z.number().optional(),
  gitlabCommitSha: z.string().optional(),
});

export type CodeSubmission = z.infer<typeof codeSubmissionSchema>;

// GitLab API integration schemas
export const gitlabConfigSchema = z.object({
  token: z.string().min(1, "GitLab token is required"),
  projectId: z.number().optional(),
  username: z.string().optional(),
});

export type GitlabConfig = z.infer<typeof gitlabConfigSchema>;

export const gitlabMergeRequestSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  sourceBranch: z.string(),
  targetBranch: z.string(),
  title: z.string(),
  description: z.string().optional(),
  state: z.string(),
  webUrl: z.string(),
});

export type GitlabMergeRequest = z.infer<typeof gitlabMergeRequestSchema>;

export const gitlabCommentSchema = z.object({
  body: z.string(),
  path: z.string().optional(),
  line: z.number().optional(),
  lineType: z.enum(["new", "old"]).optional(),
  position: z.object({
    baseSha: z.string().optional(),
    startSha: z.string().optional(),
    headSha: z.string().optional(),
    positionType: z.string().optional(),
    newLine: z.number().optional(),
    oldLine: z.number().optional(),
    newPath: z.string().optional(),
    oldPath: z.string().optional(),
  }).optional(),
});

export type GitlabComment = z.infer<typeof gitlabCommentSchema>;

// Review result types
export type CommentType = "error" | "warning" | "suggestion" | "info";

export type CodeComment = {
  line: number;
  text: string;
  type: CommentType;
  suggestion?: string;
  file?: string; // For GitLab integration
  gitlabCommentId?: number; // For GitLab integration
};

export type MetricScore = {
  grade: string;
  score: number;
  change?: number;
};

export type ReviewResult = {
  metrics: {
    overall: MetricScore;
    maintainability: MetricScore;
    performance: MetricScore;
    security: MetricScore;
  };
  comments: CodeComment[];
  improvedCode?: string;
  keyImprovements?: string[];
  issues: {
    critical: number;
    warnings: number;
    info: number;
    types: {
      name: string;
      description: string;
      severity: "high" | "medium" | "low";
    }[];
  };
  gitlabIntegration?: {
    projectId?: number;
    mergeRequestId?: number;
    commitSha?: string;
    reviewUrl?: string;
    commentIds?: number[];
  };
};
