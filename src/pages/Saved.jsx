// src/pages/Saved.jsx
import { usePosts } from "../context/PostContext";
import { useState } from "react";

export default function Saved() {
  const { posts, toggleLike, toggleSave, addComment } = usePosts();
  const savedPosts = posts.filter((p) => p.saved);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Saved Posts</h2>

        {savedPosts.length === 0 ? (
          <p className="text-center text-slate-300/80">
            No saved posts yet.
          </p>
        ) : (
          savedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800/60 backdrop-blur rounded-xl p-4 shadow border border-slate-700/60 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{post.author}</span>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="px-2 py-1 bg-slate-900/40 border border-slate-700/60 rounded text-slate-100 hover:bg-slate-700/50 transition"
                  >
                    ❤️ {post.likes}
                  </button>
                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`relative z-40 pointer-events-auto px-2 py-1 rounded border transition ${
                      post.saved
                        ? "bg-blue-500 border-blue-400/30 text-white hover:bg-blue-600"
                        : "bg-slate-900/40 border-slate-700/60 text-slate-100 hover:bg-slate-700/50"
                    }`}
                  >
                    {post.saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              <p className="text-slate-100">{post.content}</p>

              {/* Comments */}
              <div className="space-y-1">
                {post.comments.map((c, i) => (
                  <div key={i} className="text-sm text-slate-300/80">
                    💬 {c}
                  </div>
                ))}

                <CommentInput postId={post.id} addComment={addComment} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Input for adding comment
function CommentInput({ postId, addComment }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
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
        className="flex-1 px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-700/60 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400"
      />
      <button
        onClick={handleAdd}
        className="px-4 bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition"
      >
        Post
      </button>
    </div>
  );
}
