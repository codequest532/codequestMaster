import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertUserSchema, insertUserProgressSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, authenticateToken, requireAdmin, generateToken, verifyPassword, hashPassword } from "./auth";
import { sendPasswordResetEmail, sendAdminMessage } from "./simple-email";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email address' });
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedTempPassword = await hashPassword(tempPassword);
      
      await storage.updateUser(user.id, { password: hashedTempPassword });
      
      const emailSent = await sendPasswordResetEmail(email, tempPassword, user.username);

      if (emailSent) {
        console.log(`🔐 TEMPORARY PASSWORD SENT:
   User: ${user.username} (${email})
   Temp Password: ${tempPassword}
   Time: ${new Date().toISOString()}`);
        
        res.json({ 
          message: 'Temporary password sent to your email address',
          success: true 
        });
      } else {
        res.status(500).json({ message: 'Failed to send email. Please try again.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process password reset' });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });
  
  // Get current authenticated user profile
  app.get("/api/profile/current", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Update lastActive timestamp to track active sessions
      await storage.updateUser(userId, { lastActive: new Date() });
      
      const userWithStats = await storage.getUserWithStats(userId);
      
      if (!userWithStats) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userProfile } = userWithStats;
      res.json(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  // Update user profile
  app.patch("/api/profile/update", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { mobile } = req.body;

      const updatedUser = await storage.updateUser(userId, { mobile });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userProfile } = updatedUser;
      res.json({ message: 'Profile updated successfully', user: userProfile });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const token = generateToken(user.id);
      
      await storage.updateUser(user.id, { lastActive: new Date() });
      
      res.json({ 
        message: "Login successful",
        token,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("Registration attempt:", req.body);
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const hashedPassword = await hashPassword(userData.password);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      const user = await storage.createUser(userWithHashedPassword);
      res.status(201).json({ 
        message: "User created successfully", 
        token: generateToken(user.id), 
        user: { ...user, password: undefined } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: "Failed to create user", error: errorMessage });
    }
  });

  app.get("/api/auth/current-user", authenticateToken, async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const user = await storage.getUserWithStats(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userResponse = {
        ...user,
        password: undefined
      };
      
      res.json(userResponse);
    } catch (error) {
      console.error("Error in /api/auth/current-user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Puzzles routes
  app.get("/api/puzzles", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (userId) {
        const puzzles = await storage.getPuzzlesWithProgress(userId);
        res.json(puzzles);
      } else {
        const puzzles = await storage.getPuzzles();
        res.json(puzzles);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch puzzles" });
    }
  });

  app.get("/api/puzzles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const puzzle = await storage.getPuzzle(id);
      
      if (!puzzle) {
        return res.status(404).json({ message: "Puzzle not found" });
      }
      
      res.json(puzzle);
    } catch (error) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Code compilation and submission
  app.post("/api/code/run", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }
      
      // Simple response for testing
      res.json({
        results: [
          { input: "Test case 1", expected: "true", output: "true", passed: true, hidden: false },
          { input: "Test case 2", expected: "true", output: "true", passed: true, hidden: false }
        ],
        runtime: 25,
        memory: 512,
        passedCount: 2,
        totalCount: 2
      });
    } catch (error) {
      console.error("Run code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/code/submit", async (req, res) => {
    try {
      const { code, language, puzzleId } = req.body;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.body.userId;
      
      if (!code || !language || !puzzleId) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required fields"
        });
      }
      
      // Simulate successful submission
      const results = [
        { input: "Test case 1", expected: "true", output: "true", passed: true, hidden: false },
        { input: "Test case 2", expected: "true", output: "true", passed: true, hidden: false },
        { input: "Hidden test case", expected: "passed", output: "passed", passed: true, hidden: true }
      ];
      
      const allPassed = true;
      const xpGained = 100;
      
      // Update user XP and progress if submission is successful
      console.log("XP Update check - allPassed:", allPassed, "userId:", userId, "puzzleId:", puzzleId);
      if (allPassed && userId && puzzleId) {
        try {
          console.log("Fetching user data for userId:", userId);
          const currentUser = await storage.getUser(userId);
          if (currentUser) {
            console.log("Current user XP:", currentUser.totalXP, "Current level:", currentUser.level);
            const newTotalXP = currentUser.totalXP + xpGained;
            const newCurrentXP = currentUser.currentXP + xpGained;
            const newLevel = Math.floor(newTotalXP / 1000) + 1;
            
            console.log("Updating user with new XP:", newTotalXP, "new level:", newLevel);
            await storage.updateUser(userId, {
              currentXP: newCurrentXP,
              totalXP: newTotalXP,
              level: newLevel,
              lastActive: new Date()
            });
            console.log("XP update completed successfully");

            // Create or update user progress record
            console.log("Checking user progress for puzzle:", puzzleId);
            const existingProgress = await storage.getUserProgress(userId, puzzleId);
            if (existingProgress) {
              console.log("Updating existing progress record");
              await storage.updateUserProgress(existingProgress.id, {
                status: "completed",
                completedAt: new Date(),
                attempts: existingProgress.attempts + 1
              });
            } else {
              console.log("Creating new progress record");
              await storage.createUserProgress({
                userId: userId,
                puzzleId: puzzleId,
                status: "completed",
                completedAt: new Date(),
                attempts: 1
              });
            }
            console.log("Progress record updated successfully");
          } else {
            console.log("User not found for userId:", userId);
          }
        } catch (error) {
          console.error("Failed to update user progress:", error);
        }
      } else {
        console.log("XP update skipped - allPassed:", allPassed, "userId:", userId, "puzzleId:", puzzleId);
      }
      
      res.json({
        success: true,
        results,
        allPassed,
        xpGained,
        message: allPassed ? "Solution accepted! Great work!" : "Some test cases failed. Try again!"
      });
    } catch (error) {
      console.error("Submit code error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User progress
  app.get("/api/user/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserProgressStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/user/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const totalUsers = await storage.getTotalUsersCount();
      const totalPuzzles = await storage.getTotalPuzzlesCount();
      const todaySolutions = await storage.getTodaySolutionsCount();
      const todaySolutionsWithUsers = await storage.getTodaySolutionsWithUsers();
      const activeSessions = await storage.getActiveSessionsCount();

      res.json({
        totalUsers,
        totalPuzzles,
        todaySolutions,
        todaySolutionsWithUsers,
        activeSessions
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/puzzles", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const puzzles = await storage.getPuzzles();
      res.json(puzzles);
    } catch (error) {
      console.error('Admin puzzles error:', error);
      res.status(500).json({ message: "Failed to fetch puzzles" });
    }
  });

  app.post("/api/admin/send-message", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { userId, message } = req.body;
      const adminName = req.user.username;

      if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
      }

      // Get user email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Save message to database
      await storage.createAdminMessage({
        fromAdminId: req.user.id,
        toUserId: userId,
        message: message
      });

      // Send email using the simple email service
      const emailSent = await sendAdminMessage(user.email, message, adminName);

      if (emailSent) {
        res.json({ message: "Message sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error('Admin send message error:', error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/admin/make-admin", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get user to verify they exist
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isAdmin) {
        return res.status(400).json({ message: "User is already an admin" });
      }

      // Update user to admin status
      await storage.updateUser(userId, { isAdmin: true });

      res.json({ message: "User promoted to admin successfully" });
    } catch (error) {
      console.error('Make admin error:', error);
      res.status(500).json({ message: "Failed to promote user to admin" });
    }
  });

  const server = createServer(app);
  app.post("/api/admin/make-admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    await storage.updateUser(userId, { isAdmin: true });

    res.json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: "Failed to promote user to admin" });
  }
});
  return server;
}
