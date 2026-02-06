export default function Navbar({ user }) {
  return (
    <nav className="fixed top-0 w-full bg-white border-b shadow-sm z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="font-bold text-xl text-purple-600">LearnSmart</h1>
        <span className="text-sm text-gray-600">
          {user?.name}
        </span>
      </div>
    </nav>
  );
}
