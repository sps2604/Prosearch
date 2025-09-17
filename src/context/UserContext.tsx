// src/context/UserContext.tsx
import { createContext, useContext, useState, type ReactNode, useMemo } from "react";

interface Profile {
  id: string; // Add the user ID to the profile interface
  first_name?: string;
  last_name?: string;
  email?: string;
  business_name?: string; // Add business_name for business users
  user_type?: "professional" | "business"; // Add user_type field
}

interface UserContextType {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  const contextValue = useMemo(() => ({
    profile,
    setProfile,
  }), [profile, setProfile]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
