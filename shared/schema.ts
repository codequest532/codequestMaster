import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  mobile: text("mobile"),
  password: text("password").notNull(),
  level: integer("level").notNull().default(1),
  currentXP: integer("current_xp").notNull().default(0),
  totalXP: integer("total_xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull().default(0),
});

export const puzzles = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  categoryId: integer("category_id").notNull(),
  points: integer("points").notNull(),
  stars: integer("stars").notNull().default(1), // 1-3 difficulty stars
  problemStatement: text("problem_statement").notNull(),
  examples: jsonb("examples").notNull(), // Array of {input, output, explanation}
  constraints: text("constraints"),
  hints: jsonb("hints").notNull(), // Array of hint strings
  starterCode: jsonb("starter_code").notNull(), // Object with language keys
  solution: jsonb("solution").notNull(), // Object with language keys
  testCases: jsonb("test_cases").notNull(), // Array of {input, expected, hidden}
  order: integer("order").notNull().default(0),
  unlockLevel: integer("unlock_level").notNull().default(1),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  puzzleId: integer("puzzle_id").notNull(),
  status: text("status").notNull(), // 'not_started', 'in_progress', 'completed'
  bestSolution: text("best_solution"),
  language: text("language"),
  hintsUsed: integer("hints_used").notNull().default(0),
  attempts: integer("attempts").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0), // in seconds
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // 'puzzle', 'streak', 'milestone', 'special'
  condition: jsonb("condition").notNull(), // {type: 'count', target: 10, metric: 'puzzles_solved'}
  xpReward: integer("xp_reward").notNull().default(0),
  order: integer("order").notNull().default(0),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  puzzleId: integer("puzzle_id").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  lastSaved: timestamp("last_saved").defaultNow(),
});

export const adminMessages = pgTable("admin_messages", {
  id: serial("id").primaryKey(),
  fromAdminId: integer("from_admin_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"), // 'sent', 'read'
  sentAt: timestamp("sent_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  currentXP: true,
  totalXP: true,
  streak: true,
  lastActive: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertPuzzleSchema = createInsertSchema(puzzles).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startTime: true,
  lastSaved: true,
});

export const insertAdminMessageSchema = createInsertSchema(adminMessages).omit({
  id: true,
  sentAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Puzzle = typeof puzzles.$inferSelect;
export type InsertPuzzle = z.infer<typeof insertPuzzleSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type AdminMessage = typeof adminMessages.$inferSelect;
export type InsertAdminMessage = z.infer<typeof insertAdminMessageSchema>;

// Additional types for API responses
export type PuzzleWithProgress = Puzzle & {
  progress?: UserProgress;
  isUnlocked: boolean;
};

export type UserWithStats = User & {
  solvedCount: number;
  rank: number;
};

export type LeaderboardEntry = {
  user: User;
  solvedCount: number;
  totalXP: number;
  rank: number;
};
