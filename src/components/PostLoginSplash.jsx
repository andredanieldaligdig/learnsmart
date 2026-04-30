import { useEffect, useState } from "react";

export default function PostLoginSplash() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_32%),linear-gradient(135deg,rgba(10,10,10,1)_0%,rgba(24,24,27,1)_54%,rgba(9,9,11,1)_100%)] animate-gradient" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-15 animate-grid" />
      </div>

      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div
          className={[
            "text-4xl font-semibold tracking-tight text-white transition duration-700 sm:text-5xl",
            mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          ].join(" ")}
        >
          LearnSmart
        </div>
        <div
          className={[
            "text-sm text-white/70 transition duration-700 delay-150",
            mounted ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          তারপর transition into dashboard
        </div>
      </div>
    </div>
  );
}
