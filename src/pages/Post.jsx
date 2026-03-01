import { useState } from "react";
import Sidebar from "../components/sideBar";
import { usePosts } from "../context/PostContext";

export default function Post({ user, onLogout }) {
  const { posts, addPost, toggleLike, toggleSave, addComment, remoteCount, fetchError } = usePosts();
  const [newPost, setNewPost] = useState("");

  const handleAddPost = () => {
    if (!newPost.trim()) return;
    addPost({
      content: newPost,
      user: user?.id,
      author: user?.email,
    });
    setNewPost("");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto">
        {fetchError && <p className="text-red-500 mb-2">Error loading posts: {fetchError}</p>}
        {remoteCount !== null && (
          <p className="text-sm text-gray-500 mb-2">
            Loaded {remoteCount} {remoteCount === 1 ? "post" : "posts"} from server
          </p>
        )}
        {remoteCount === 0 && posts.length > 0 && (
          <p className="text-sm text-yellow-600 mb-2">
            Your posts are currently only stored locally; they will sync to the server when possible.
          </p>
        )}
        {remoteCount === 0 && user && (
          <p className="text-sm text-yellow-600 mb-2">
            No posts in database. Make sure you're logged in and that your Supabase table allows public selects.
          </p>
        )}
        {/* New post input */}
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something..."
          className="w-full p-4 rounded-xl bg-white/40 backdrop-blur border border-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          onClick={handleAddPost}
          className="mt-2 px-6 py-2 bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Post
        </button>

        {/* Posts (10 most recent) */}
        <div className="mt-6 space-y-6">
          {(() => {
            const list = (posts || [])
              .slice()
              .sort((a, b) => {
                const aTime = new Date(a.raw?.created_at || a.raw?.inserted_at || 0).getTime() || a.id || 0;
                const bTime = new Date(b.raw?.created_at || b.raw?.inserted_at || 0).getTime() || b.id || 0;
                return bTime - aTime;
              })
              .slice(0, 10);

            if (list.length === 0) {
              return <p className="text-center text-gray-600">No posts yet.</p>;
            }

            return list.map((p) => (
              <div
                key={p.id}
                className="bg-white/40 backdrop-blur rounded-2xl p-4 shadow flex flex-col gap-2"
              >
                <p className="font-semibold">{p.author}</p>
                <p>{p.content}</p>

                {/* Likes & Save buttons */}
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => toggleLike(p.id)}
                    className="px-3 py-1 bg-rose-200/60 rounded-full hover:bg-rose-300 transition"
                  >
                    ❤️ {p.likes}
                  </button>
                  <button
                    onClick={() => toggleSave(p.id)}
                    className="relative z-40 pointer-events-auto px-3 py-1 bg-amber-200/60 rounded-full hover:bg-amber-300 transition"
                  >
                    💾 {p.saved ? "Saved" : "Save"}
                  </button>
                </div>

                {/* Comments */}
                <div className="mt-2 space-y-2">
                  {p.comments.map((c, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      <span className="font-semibold">{c.user}:</span> {c.text}
                    </p>
                  ))}

                  <CommentInput postId={p.id} addComment={addComment} user={user} />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}

// Separate small component for comment input
function CommentInput({ postId, addComment, user }) {
  const [comment, setComment] = useState("");

  const handleAdd = () => {
    if (!comment.trim()) return;
    addComment(postId, comment, user?.email);
    setComment("");
  };

  return (
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3 py-1 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
      <button
        onClick={handleAdd}
        className="px-3 py-1 bg-rose-400 text-white rounded-lg text-sm hover:opacity-90 transition"
      >
        Post
      </button>
    </div>
  );
}
