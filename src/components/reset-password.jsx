import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Supabase sends access_token in hash: #access_token=...
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    const access_token = hash.get("access_token");

    if (!access_token) {
      setError("Invalid or expired reset link.");
    } else {
      setToken(access_token);
    }
  }, []);

  const handleReset = async () => {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Fill both fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (!token) throw new Error("Missing session token.");

      // Set the Supabase session using token from reset link
      const { data: sessionError } = await supabase.auth.setSession({
        access_token: token,
      });

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Password updated! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-300 via-rose-300 to-orange-300">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Reset Password</h1>
        <p className="text-center text-gray-700 mb-6">Enter your new password below</p>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        <div className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New Password"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <label className="absolute left-4 top-1 text-sm text-gray-600 transition-all peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-orange-600">
              New Password
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Confirm Password"
              className="peer w-full bg-white/40 border border-white/50 rounded-xl px-4 pt-6 pb-2 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <label className="absolute left-4 top-1 text-sm text-gray-600 transition-all peer-focus:-translate-y-1 peer-focus:scale-90 peer-focus:text-orange-600">
              Confirm Password
            </label>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}