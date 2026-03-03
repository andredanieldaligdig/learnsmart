import { useState } from "react";
import { usePosts } from "../context/PostContext";

export default function TrendingTopics({ user }) {
  const { posts, toggleLike, toggleSave, addComment, fetchError } = usePosts();

  const trending = (posts || [])
    .slice()
    .sort((a, b) => (b.likes || 0) - (a.likes || 0));

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Trending Posts
      </h2>

      {fetchError && (
        <p className="text-red-500 mb-2">
          Unable to load posts right now.
        </p>
      )}

      {trending.length === 0 && (
        <p className="text-center text-gray-600">
          No trending posts yet.
        </p>
      )}

      {trending.map((post) => (
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
                className={`relative z-40 pointer-events-auto px-2 py-1 rounded text-white ${
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
            {(post.comments || []).map((c, i) => (
              <div key={i} className="text-sm text-gray-700">
                💬 <span className="font-semibold">{c.user}:</span> {c.text}
              </div>
            ))}

            <CommentInput
              postId={post.id}
              addComment={addComment}
              user={user}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentInput({ postId, addComment, user }) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addComment(postId, text.trim(), user?.email);
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