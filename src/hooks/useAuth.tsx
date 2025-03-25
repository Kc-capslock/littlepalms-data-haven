
import { useState } from "react";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const savedUser = localStorage.getItem("littlePalms_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: GoogleUser) => {
    localStorage.setItem("littlePalms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("littlePalms_user");
    setUser(null);
  };

  return { user, login, logout, isAuthenticated: !!user };
};
