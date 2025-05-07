import TokenService from "./TokenService";
import api from './api';

const AuthService = {
  async login(identifier, password) {
    console.log("[AuthService] Login attempt for:", identifier);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log("[AuthService] Login successful, storing access token");

      TokenService.setAccessToken(data.accessToken);
      // refreshToken logic removed

      return data;
    } catch (error) {
      console.error("[AuthService] Login error:", error);
      throw error;
    }
  },

  async getMe() {
    console.log("[AuthService] Fetching current user data");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${TokenService.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      console.log("[AuthService] User data fetched successfully");
      return userData;
    } catch (error) {
      console.error("[AuthService] getMe error:", error);
      throw error;
    }
  },

  async getAllDoctors() {
    console.log('[AuthService] getAllDoctors called');
    try {
      // Use the same URL pattern as login and getMe
      console.log('[AuthService] Making API call to auth/doctors');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/doctors`, {
        headers: {
          Authorization: `Bearer ${TokenService.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AuthService] Error response:', response.status, errorText);
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }

      const data = await response.json();
      console.log('[AuthService] Doctors fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error fetching doctors:', error);
      throw error;
    }
  },

  logout() {
    console.log("[AuthService] Logging out");
    TokenService.clearTokens();
  },
};

export default AuthService;
