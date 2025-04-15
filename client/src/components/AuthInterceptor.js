import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TokenService from "../services/TokenService";

const AuthInterceptor = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (url, options = {}) => {
      const isApiRequest = url.includes("/api");

      if (!isApiRequest) {
        return originalFetch(url, options);
      }

      const token = TokenService.getAccessToken();
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      try {
        const response = await originalFetch(url, options);

        if (response.status === 401) {
          console.warn("[AuthInterceptor] Unauthorized, redirecting to login");
          TokenService.clearTokens();
          navigate("/login");
        }

        return response;
      } catch (error) {
        console.error("[AuthInterceptor] Request failed:", error);
        TokenService.clearTokens();
        navigate("/login");
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);

  return children;
};

export default AuthInterceptor;
