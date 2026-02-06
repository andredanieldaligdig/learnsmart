import { useEffect, useState } from "react";
import Post from "./post";

const PostFeed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:3000/posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.name || user, content: newPost }),
      });
      const data = await res.json();
      setPosts([data, ...posts]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-4 py-6">
      {/* Create Post */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow p-4">
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ask a question or share knowledge..."
          rows={3}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handlePost}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
        {posts.map((post) => (
          <Post key={post.id} post={post} user={user} />
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
