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

  const handleKey = (e) => { if (e.key === "Enter") handleReset(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .ls-left  { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .ls-right { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .ls-stat-1 { animation: floatIn 0.8s ease 0.5s both; }
        .ls-stat-2 { animation: floatIn 0.8s ease 0.7s both; }
        .ls-stat-3 { animation: floatIn 0.8s ease 0.9s both; }

        .ls-cursor {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: rgba(255,255,255,0.5);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.95s step-end infinite;
        }

        .ls-input {
          width: 100%;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 16px 10px;
          color: #fff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ls-input:focus {
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.055);
        }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        background: "#080808",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ───── LEFT: Reset Password Card ───── */}
        <div className="ls-left" style={{
          width: 420,
          flexShrink: 0,
          background: "#0a0a0b",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 44px",
          position: "relative",
          zIndex: 2,
        }}>
          {/* subtle top glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.04), transparent)",
          }} />

          {/* Brand */}
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 36, fontWeight: 400 }}>
            LearnSmart
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.9rem",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}>
            Reset Password
          </h1>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontWeight: 300, marginBottom: 40, lineHeight: 1.5 }}>
            Enter your new password below
          </p>

          <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 36 }} />

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div style={{ position: "relative" }}>
              <label style={{
                position: "absolute", left: 16, top: 10,
                fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)", pointerEvents: "none",
              }}>New Password</label>
              <input
                className="ls-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <div style={{ position: "relative" }}>
              <label style={{
                position: "absolute", left: 16, top: 10,
                fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.25)", pointerEvents: "none",
              }}>Confirm Password</label>
              <input
                className="ls-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            {error && (
              <p style={{
                background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.12)",
                borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "rgba(255,120,120,0.9)",
              }}>{error}</p>
            )}
            {message && (
              <p style={{
                background: "rgba(80,220,140,0.07)", border: "1px solid rgba(80,220,140,0.12)",
                borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "rgba(100,230,160,0.9)",
              }}>{message}</p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: "100%", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)",
                background: "#fff", color: "#000", fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 500, padding: "15px", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.45 : 1, marginTop: 4,
                transition: "background 0.15s",
              }}
            >
              {loading ? "Please wait…" : "Update Password"}
            </button>
          </div>

          {/* Links */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p onClick={() => navigate("/login")} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
              ← Back to sign in
            </p>
          </div>
        </div>

        {/* ───── RIGHT: Hero Panel ───── */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", overflow: "hidden" }}>

          {/* Background */}
          <div style={{
            position: "absolute", inset: 0,
            background: `
              radial-gradient(ellipse 70% 55% at 75% 30%, rgba(255,255,255,0.055), transparent),
              radial-gradient(ellipse 50% 40% at 20% 80%, rgba(255,255,255,0.025), transparent),
              #0d0d0f
            `,
          }} />

          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 70% 40%, black 20%, transparent 75%)",
            maskImage: "radial-gradient(ellipse 80% 80% at 70% 40%, black 20%, transparent 75%)",
          }} />

          {/* Floating stat cards */}
          {[
            { cls: "ls-stat-1", top: "10%",   right: "10%", num: "94%",  label: "Pass rate" },
            { cls: "ls-stat-2", bottom: "18%", right: "8%",  num: "2.4×", label: "Faster recall" },
            { cls: "ls-stat-3", top: "40%",   right: "3%",  num: "50k+", label: "Students" },
          ].map(({ cls, top, bottom, right, num, label }) => (
            <div key={label} className={cls} style={{
              position: "absolute", top, bottom, right,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14, padding: "14px 20px",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{num}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{label}</div>
            </div>
          ))}

          {/* Main content */}
          <div className="ls-right" style={{ position: "relative", zIndex: 1, padding: "72px 64px", maxWidth: 580 }}>

            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: 28, fontWeight: 400 }}>
              Built for students who mean it
            </p>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.8rem, 4vw, 3.8rem)",
              fontWeight: 900, color: "#fff",
              lineHeight: 1.08, letterSpacing: "-0.03em",
              marginBottom: 36,
            }}>
              Study smarter.<br />
              Score higher.<br />
              <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.45)" }}>Feel the difference.</span>
            </h2>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["AI-powered explanations", "Smart flashcards", "Exam simulations", "Progress tracking"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
