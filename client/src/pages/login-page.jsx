import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import Card from "../components/ui/card"; // Adjust path if needed
import Button from "../components/ui/button";
import Input from "../components/ui/input";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "identifier") setIdentifier(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(identifier, password);
      console.log("[LoginPage] Login successful");
    } catch (err) {
      console.error("[LoginPage] Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card title="Login to your account">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              label="Email or NIC"
              placeholder="Enter NIC or Email"
              value={identifier}
              onChange={handleChange}
              required
              error={!!error}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={handleChange}
              required
              error={!!error}
            />

            <div className="mt-6 flex flex-col space-y-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/register")}
              >
                Don’t have an account? Register here
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
