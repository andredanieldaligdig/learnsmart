import { useState } from "react";
import Sidebar from "../components/sideBar";

export default function Post({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const addPost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      user: user.email,
      content: newPost,
      likes: 0,
      saved: false,
      comments: [],
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  const toggleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const toggleSave = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p))
    );
  };

  const addComment = (id, commentText) => {
    if (!commentText.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, comments: [...p.comments, { text: commentText, user: user.email }] }
          : p
      )
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto">
        {/* New post input */}
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something..."
          className="w-full p-4 rounded-xl bg-white/40 backdrop-blur border border-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          onClick={addPost}
          className="mt-2 px-6 py-2 bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Post
        </button>

        {/* Posts */}
        <div className="mt-6 space-y-6">
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white/40 backdrop-blur rounded-2xl p-4 shadow flex flex-col gap-2"
            >
              <p className="font-semibold">{p.user}</p>
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
                  className="px-3 py-1 bg-amber-200/60 rounded-full hover:bg-amber-300 transition"
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
          ))}
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
    addComment(postId, comment);
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
