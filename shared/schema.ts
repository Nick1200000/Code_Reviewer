import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains the same
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  language: true,
  reviewType: true,
  code: true,
  results: true,
  userId: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Code submission schema for validating API requests
export const codeSubmissionSchema = z.object({
  language: z.string().min(1, "Language is required"),
  reviewType: z.string().min(1, "Review type is required"),
  code: z.string().min(1, "Code is required"),
});

export type CodeSubmission = z.infer<typeof codeSubmissionSchema>;

// Review result types
export type CommentType = "error" | "warning" | "suggestion" | "info";

export type CodeComment = {
  line: number;
  text: string;
  type: CommentType;
  suggestion?: string;
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
};
