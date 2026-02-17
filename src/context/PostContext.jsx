import { createContext, useContext, useState, useEffect } from "react";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export function PostProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("posts");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            content: "How do I solve quadratic equations?",
            likes: 0,
            liked: false,
            saved: false,
            comments: [],
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const addPost = (content) => {
    const newPost = {
      id: Date.now(),
      content,
      likes: 0,
      liked: false,
      saved: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
  };

  const toggleLike = (id) => {
    setPosts(posts.map(post =>
      post.id === id
        ? {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          }
        : post
    ));
  };

  const toggleSave = (id) => {
    setPosts(posts.map(post =>
      post.id === id
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const addComment = (id, text) => {
    if (!text.trim()) return;

    setPosts(posts.map(post =>
      post.id === id
        ? { ...post, comments: [...post.comments, text] }
        : post
    ));
  };

  return (
    <PostContext.Provider
      value={{ posts, addPost, toggleLike, toggleSave, addComment }}
    >
      {children}
    </PostContext.Provider>
  );
}
