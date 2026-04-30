import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase.js";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace("#", ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setError("Invalid or expired reset link.");
    } else {
      setToken({ access_token: accessToken, refresh_token: refreshToken });
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

      await supabase.auth.setSession({
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      });

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-20 animate-grid" />
      </div>

      <div className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-neutral-950/72 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">LearnSmart</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Reset password</h1>
          <p className="mt-2 text-sm text-neutral-400">Enter your new password below.</p>
        </div>

        <div className="space-y-4">
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleReset();
            }}
            placeholder="New Password"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleReset();
            }}
            placeholder="Confirm Password"
            className="w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-neutral-500"
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-[24px] border border-white/12 bg-white py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
