import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import AuthService from "../services/AuthService";
import TokenService from "../services/TokenService";

// Context
const AuthContext = createContext();

// Initial state
const initialState = {
  currentUser: null,
  activeRole: null,
  permissions: [],
  loading: true,
  error: null,
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      console.log("[AuthContext] LOGIN_SUCCESS:", action.payload);
      return {
        ...state,
        currentUser: action.payload.user,
        activeRole: action.payload.role,
        permissions: action.payload.role?.permissions || [],
        loading: false,
        error: null,
      };
    case "LOGOUT":
      console.log("[AuthContext] LOGOUT");
      return { ...initialState, loading: false };
    case "SET_LOADING":
      return { ...state, loading: true };
    case "SET_LOADING_FALSE":
      return { ...state, loading: false };
    case "SET_ERROR":
      console.error("[AuthContext] SET_ERROR:", action.payload);
      return { ...state, error: action.payload, loading: false };
    case "SWITCH_ROLE":
      return {
        ...state,
        activeRole: action.payload.role,
        permissions: action.payload.role?.permissions || [],
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Logout across tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "accessToken" && event.newValue === null) {
        console.log("[AuthContext] accessToken removed, logging out.");
        dispatch({ type: "LOGOUT" });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auth initialization
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: "SET_LOADING" });
      console.log("[AuthContext] Initializing authentication...");

      const accessToken = TokenService.getAccessToken();

      if (!accessToken || TokenService.isTokenExpired(accessToken)) {
        console.warn("[AuthContext] No valid access token, logging out");
        logout();
        dispatch({ type: "SET_LOADING_FALSE" });
        return;
      }

      try {
        const { user, activeRole } = await AuthService.getMe();
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, role: activeRole },
        });
      } catch (err) {
        console.error("[AuthContext] Failed to fetch user:", err);
        logout();
      } finally {
        dispatch({ type: "SET_LOADING_FALSE" });
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    dispatch({ type: "SET_LOADING" });
    console.log("[AuthContext] Logging in:", identifier);

    try {
      const data = await AuthService.login(identifier, password);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: data.user,
          role: data.activeRole,
        },
      });
      return data;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const logout = () => {
    console.log("[AuthContext] Logging out");
    AuthService.logout();
    dispatch({ type: "LOGOUT" });
  };

  const switchRole = async (roleId) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const response = await AuthService.switchRole(roleId);
      dispatch({
        type: "SWITCH_ROLE",
        payload: { role: response.activeRole },
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      throw err;
    }
  };

  const hasPermission = useCallback(
    (entity, action, scope = "all") => {
      return state.permissions.some(
        (perm) =>
          perm.entity === entity &&
          perm.action === action &&
          (perm.scope === scope || perm.scope === "all")
      );
    },
    [state.permissions]
  );

  const value = {
    ...state,
    login,
    logout,
    hasPermission,
    switchRole,
    isAuthenticated: !!state.currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
