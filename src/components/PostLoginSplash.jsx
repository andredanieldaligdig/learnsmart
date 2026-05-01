import { useEffect, useState } from "react";

export default function PostLoginSplash() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400&display=swap');

        @keyframes lineGrow {
          from { width: 0; opacity: 0; }
          to   { width: 40px; opacity: 1; }
        }
        @keyframes barFill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950">

        {/* Background — identical to Login for seamless feel */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.07),_transparent_55%),linear-gradient(160deg,#0a0a0a_0%,#111114_50%,#090909_100%)]" />
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.05] blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/[0.03] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent)",
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col items-center gap-0 px-6 text-center">

          {/* Eyebrow */}
          <p
            className="mb-4 text-[0.58rem] uppercase tracking-[0.4em] text-white/20 transition-all duration-500"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(8px)",
              transitionDelay: "60ms",
            }}
          >
            LearnSmart
          </p>

          {/* Wordmark */}
          <h1
            className="text-white transition-all duration-700"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.8rem, 8vw, 4rem)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(14px)",
              transitionDelay: "120ms",
              transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            Welcome to LearnSmart
          </h1>

          {/* Accent line */}
          <div
            className="mt-6"
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.12)",
              animation: mounted ? "lineGrow 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) both" : "none",
            }}
          />

          {/* Tagline */}
          <p
            className="mt-5 text-sm font-light text-white/35 transition-all duration-700"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              opacity: mounted ? 1 : 0,
              transitionDelay: "380ms",
            }}
          >
            Your study session is ready
          </p>
        </div>

        {/* Progress bar — bottom of screen */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]">
          <div
            className="h-full origin-left bg-white/25"
            style={{
              animation: mounted ? "barFill 2s 0.3s cubic-bezier(0.4,0,0.2,1) both" : "none",
            }}
          />
        </div>
      </div>
    </>
  );
}