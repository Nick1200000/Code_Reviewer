import { 
  users, type User, type InsertUser,
  reviews, type Review, type InsertReview, 
  type ReviewResult
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReview(id: number): Promise<Review | undefined>;
  getReviews(userId?: number, limit?: number): Promise<Review[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private reviews: Map<number, Review>;
  private userIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.reviews = new Map();
    this.userIdCounter = 1;
    this.reviewIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, review);
    return review;
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviews(userId?: number, limit?: number): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());
    
    if (userId) {
      reviews = reviews.filter(review => review.userId === userId);
    }
    
    // Sort by creation date (newest first)
    reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      reviews = reviews.slice(0, limit);
    }
    
    return reviews;
  }
}

export const storage = new MemStorage();
