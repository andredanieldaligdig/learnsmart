export default function Navbar({ user }) {
  return (
    <nav className="fixed top-0 w-full bg-slate-800/90 backdrop-blur border-b border-slate-700/60 shadow-sm z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="font-bold text-xl text-blue-400">LearnSmart</h1>
        <span className="text-sm text-slate-300/80">
          {user?.name}
        </span>
      </div>
    </nav>
  );
}
