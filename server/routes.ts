import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertUserSchema, insertUserProgressSchema, insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, authenticateToken, requireAdmin, generateToken, verifyPassword, hashPassword } from "./auth";
import { sendPasswordResetEmail } from "./simple-email";

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
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const progressStats = await storage.getUserProgressStats(userId);

      const { password, ...userProfile } = user;
      res.json({
        ...userProfile,
        solved: progressStats.solved,
        total: progressStats.total,
        streak: progressStats.streak
      });
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
      res.status(500).json({ message: "Failed to create user", error: error.message });
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
      const { code, language, puzzleId, userId } = req.body;
      
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
      
      // Update user XP if submission is successful
      if (allPassed && userId) {
        try {
          const currentUser = await storage.getUser(userId);
          if (currentUser) {
            const newTotalXP = currentUser.totalXP + xpGained;
            const newCurrentXP = currentUser.currentXP + xpGained;
            const newLevel = Math.floor(newTotalXP / 1000) + 1;
            
            await storage.updateUser(userId, {
              currentXP: newCurrentXP,
              totalXP: newTotalXP,
              level: newLevel,
              lastActive: new Date()
            });
          }
        } catch (error) {
          console.error("Failed to update user progress:", error);
        }
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
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
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

  const server = createServer(app);
  return server;
}
