// src/pages/TrendingTopics.jsx
import { useState } from "react";

export default function TrendingTopics() {
  // Sample posts, in real app you fetch from Supabase
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Alice",
      content: "Check out this amazing study hack!",
      likes: 12,
      saved: false,
      comments: ["Great tip!", "Thanks for sharing!"],
    },
    {
      id: 2,
      author: "Bob",
      content: "Struggling with calculus, any advice?",
      likes: 8,
      saved: true,
      comments: [],
    },
  ]);

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

  const toggleSave = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, saved: !p.saved } : p
      )
    );
  };

  const addComment = (id, comment) => {
    if (!comment) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
  };

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Trending Posts
      </h2>

      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white/40 backdrop-blur rounded-xl p-4 shadow space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold">{post.author}</span>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => toggleLike(post.id)}
                className="px-2 py-1 bg-rose-400/70 rounded text-white"
              >
                ❤️ {post.likes}
              </button>
              <button
                onClick={() => toggleSave(post.id)}
                className={`px-2 py-1 rounded text-white ${
                  post.saved ? "bg-emerald-500" : "bg-gray-500/50"
                }`}
              >
                {post.saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <p className="text-gray-900">{post.content}</p>

          {/* Comments */}
          <div className="space-y-1">
            {post.comments.map((c, i) => (
              <div key={i} className="text-sm text-gray-700">
                💬 {c}
              </div>
            ))}

            <CommentInput postId={post.id} addComment={addComment} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Input for adding comment
function CommentInput({ postId, addComment }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    addComment(postId, text);
    setText("");
  };

  return (
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3 py-2 rounded-lg bg-white/30 border border-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
      <button
        onClick={handleAdd}
        className="px-4 bg-rose-400 text-white rounded-lg font-semibold hover:opacity-90 transition"
      >
        Post
      </button>
    </div>
  );
}
