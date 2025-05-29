import { eq, desc, count, and, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, categories, puzzles, userProgress, achievements, userAchievements, sessions
} from "@shared/schema";
import type { 
  User, InsertUser, 
  Category, InsertCategory,
  Puzzle, InsertPuzzle,
  UserProgress, InsertUserProgress,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  Session, InsertSession,
  PuzzleWithProgress, UserWithStats, LeaderboardEntry
} from "@shared/schema";

interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUserWithStats(id: number): Promise<UserWithStats | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Puzzles
  getPuzzles(): Promise<Puzzle[]>;
  getPuzzlesByCategory(categoryId: number): Promise<Puzzle[]>;
  getPuzzle(id: number): Promise<Puzzle | undefined>;
  getPuzzlesWithProgress(userId: number): Promise<PuzzleWithProgress[]>;
  createPuzzle(puzzle: InsertPuzzle): Promise<Puzzle>;

  // User Progress
  getUserProgress(userId: number, puzzleId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, updates: Partial<UserProgress>): Promise<UserProgress | undefined>;
  getUserProgressStats(userId: number): Promise<{ solved: number; total: number; streak: number }>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]>;

  // Sessions
  getSession(userId: number, puzzleId: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;

  // Admin Stats
  getTotalUsersCount(): Promise<number>;
  getTotalPuzzlesCount(): Promise<number>;
  getTodaySolutionsCount(): Promise<number>;
  getActiveSessionsCount(): Promise<number>;
  
  // Additional admin methods
  getAllUsers(): Promise<User[]>;
  deletePuzzle(id: number): Promise<void>;
  
  // Admin message methods
  createAdminMessage(message: InsertAdminMessage): Promise<AdminMessage>;
  getAdminMessages(): Promise<AdminMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUserWithStats(id: number): Promise<UserWithStats | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const [solvedResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, id), eq(userProgress.status, 'completed')));

    const solvedCount = solvedResult.count;

    // Calculate rank based on total XP
    const [rankResult] = await db
      .select({ rank: sql<number>`RANK() OVER (ORDER BY ${users.totalXP} DESC)` })
      .from(users)
      .where(eq(users.id, id));

    return {
      ...user,
      solvedCount,
      rank: rankResult?.rank || 1,
    };
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.order);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getPuzzles(): Promise<Puzzle[]> {
    return await db.select().from(puzzles).orderBy(puzzles.order);
  }

  async getPuzzlesByCategory(categoryId: number): Promise<Puzzle[]> {
    return await db
      .select()
      .from(puzzles)
      .where(eq(puzzles.categoryId, categoryId))
      .orderBy(puzzles.order);
  }

  async getPuzzle(id: number): Promise<Puzzle | undefined> {
    const [puzzle] = await db.select().from(puzzles).where(eq(puzzles.id, id));
    return puzzle || undefined;
  }

  async getPuzzlesWithProgress(userId: number): Promise<PuzzleWithProgress[]> {
    const allPuzzles = await this.getPuzzles();
    const userProgressData = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    return allPuzzles.map(puzzle => {
      const progress = userProgressData.find(p => p.puzzleId === puzzle.id);
      return {
        ...puzzle,
        progress,
        isUnlocked: true, // For now, all puzzles are unlocked
      };
    });
  }

  async createPuzzle(insertPuzzle: InsertPuzzle): Promise<Puzzle> {
    const [puzzle] = await db
      .insert(puzzles)
      .values(insertPuzzle)
      .returning();
    return puzzle;
  }

  async getUserProgress(userId: number, puzzleId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.puzzleId, puzzleId)));
    return progress || undefined;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateUserProgress(id: number, updates: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [progress] = await db
      .update(userProgress)
      .set(updates)
      .where(eq(userProgress.id, id))
      .returning();
    return progress || undefined;
  }

  async getUserProgressStats(userId: number): Promise<{ solved: number; total: number; streak: number }> {
    const [solvedResult] = await db
      .select({ count: count() })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.status, 'completed')));

    const [totalResult] = await db
      .select({ count: count() })
      .from(puzzles);

    return {
      solved: solvedResult.count,
      total: totalResult.count,
      streak: 0, // TODO: Calculate streak
    };
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).orderBy(achievements.order);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values(insertUserAchievement)
      .returning();
    return userAchievement;
  }

  async checkAndUnlockAchievements(userId: number): Promise<UserAchievement[]> {
    // TODO: Implement achievement checking logic
    return [];
  }

  async getSession(userId: number, puzzleId: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.puzzleId, puzzleId)));
    return session || undefined;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return session || undefined;
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const leaderboardData = await db
      .select({
        user: users,
        solvedCount: sql<number>`COUNT(CASE WHEN ${userProgress.status} = 'completed' THEN 1 END)`,
        totalXP: users.totalXP,
      })
      .from(users)
      .leftJoin(userProgress, eq(users.id, userProgress.userId))
      .groupBy(users.id)
      .orderBy(desc(users.totalXP))
      .limit(limit);

    return leaderboardData.map((entry, index) => ({
      user: entry.user,
      solvedCount: entry.solvedCount,
      totalXP: entry.totalXP,
      rank: index + 1,
    }));
  }

  // Admin Stats Methods - Real data from database
  async getTotalUsersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }

  async getTotalPuzzlesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(puzzles);
    return result[0]?.count || 0;
  }

  async getTodaySolutionsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.status, 'completed'),
          sql`${userProgress.completedAt} >= ${today.toISOString()}`
        )
      );
    return result[0]?.count || 0;
  }

  async getActiveSessionsCount(): Promise<number> {
    // Count users who have been active recently
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.lastActive} >= ${thirtyMinutesAgo.toISOString()}`);
    return result[0]?.count || 0;
  }

  // Additional admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deletePuzzle(id: number): Promise<void> {
    await db.delete(puzzles).where(eq(puzzles.id, id));
  }

  async createAdminMessage(messageData: any): Promise<any> {
    const [message] = await db
      .insert(adminMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getAdminMessages(): Promise<any[]> {
    return await db.select().from(adminMessages).orderBy(desc(adminMessages.sentAt));
  }
}

export const storage = new DatabaseStorage();