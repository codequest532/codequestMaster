import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { UserWithStats } from "@shared/schema";

interface UserContextType {
  user: UserWithStats | null;
  setUser: (user: UserWithStats | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithStats | null>(null);

  // Initialize user from authenticated session
  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem('codequest_token');
      if (!token) {
        setUser(null);
        return;
      }

      try {
        // Fetch real user data from server
        const response = await fetch('/api/profile/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            ...userData,
            solvedCount: userData.solved || 0,
            rank: 1
          });
        } else {
          // Token is invalid, remove it
          localStorage.removeItem('codequest_token');
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem('codequest_token');
        setUser(null);
      }
    };
    
    // Listen for token changes to refresh user data
    const handleTokenChange = () => {
      initUser();
    };
    
    initUser();
    window.addEventListener('tokenChanged', handleTokenChange);
    
    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, []);

  const logout = () => {
    setUser(null);
    // In a real app, you'd clear auth tokens here
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}