import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://obxthuoqtaoimpidximk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ieHRodW9xdGFvaW1waWR4aW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDg1NjcsImV4cCI6MjA4NjQ4NDU2N30.9T5xvSVwptKWxKzx-a1ozBK3uH04oOUd1G4Ibe-wvZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});


// ======================================================
// AUTH
// ======================================================

export async function createAccount(email, password, displayName, gender, dob) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
        full_name: displayName,
        username: displayName,
      },
    },
  });

  if (error) throw error;
  const user = data.user;

  if (user) {
    const { error: profileError } = await supabase
      .from('accounts')
      .insert([{ id: user.id, email, username: displayName, gender, dob }]);
    if (profileError) throw profileError;
  }

  return user;
}

export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  await supabase.storage.from("avatars").remove([filePath]);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return data.publicUrl;
}

// ✅ Now fetches username, avatar_url AND bio
export async function getAccountProfile(userId) {
  const { data, error } = await supabase
    .from("accounts")
    .select("username, avatar_url, bio")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ✅ Now saves bio too
export async function updateAccountProfile(userId, { displayName, bio }) {
  const trimmedDisplayName = displayName?.trim();

  if (!userId) throw new Error("A valid user id is required.");

  // Update auth metadata if display name changed
  if (trimmedDisplayName) {
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: trimmedDisplayName,
        full_name: trimmedDisplayName,
        username: trimmedDisplayName,
      },
    });
    if (authError) throw authError;
  }

  // Build the update object
  const updates = {};
  if (trimmedDisplayName) updates.username = trimmedDisplayName;
  if (bio !== undefined) updates.bio = bio;

  if (Object.keys(updates).length > 0) {
    const { error: profileError } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", userId);
    if (profileError) throw profileError;
  }

  return null;
}

export async function loginAccount(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


// ======================================================
// POSTS — wired to Supabase
// ======================================================

// ✅ Create a post with author display name (not email)
export async function addPost(userId, displayName, content) {
  const payload = {
    content: content || "",
    likes: 0,
    comments: [],
    user_id: userId || null,
    author: displayName || "Anonymous",
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([payload])
    .select();

  if (error) throw error;
  return data;
}

export async function updatePost(id, changes) {
  const { data, error } = await supabase
    .from('posts')
    .update(changes)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPostsByUser(user_id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}


// ======================================================
// LIKES — stored in Supabase
// ======================================================

export async function getLikedPostIdsByUser(userId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);

  if (error) return [];
  return data.map((r) => r.post_id);
}

export async function likePost(userId, postId) {
  // Insert into likes junction table
  const { error: likeError } = await supabase
    .from('post_likes')
    .upsert([{ user_id: userId, post_id: postId }]);

  if (likeError) throw likeError;

  // Increment likes count on the post
  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .maybeSingle();

  await supabase
    .from('posts')
    .update({ likes: (post?.likes || 0) + 1 })
    .eq('id', postId);
}

export async function unlikePost(userId, postId) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .match({ user_id: userId, post_id: postId });

  if (error) throw error;

  const { data: post } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .maybeSingle();

  await supabase
    .from('posts')
    .update({ likes: Math.max(0, (post?.likes || 1) - 1) })
    .eq('id', postId);
}


// ======================================================
// SAVED POSTS
// ======================================================

export async function getSavedPostIdsByUser(user_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', user_id);

  if (error) return [];
  return data.map((r) => r.post_id);
}

export async function getSavedPostsByUser(user_id) {
  const ids = await getSavedPostIdsByUser(user_id);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .in('id', ids);

  if (error) throw error;
  return data;
}

export async function savePostForUser(user_id, post_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .upsert([{ user_id, post_id }]);

  if (error) throw error;

  // Increment saves count
  const { data: post } = await supabase
    .from('posts')
    .select('saves')
    .eq('id', post_id)
    .maybeSingle();

  await supabase
    .from('posts')
    .update({ saves: (post?.saves || 0) + 1 })
    .eq('id', post_id);

  return data;
}

export async function removeSavedPostForUser(user_id, post_id) {
  const { data, error } = await supabase
    .from('saved_posts')
    .delete()
    .match({ user_id, post_id });

  if (error) throw error;
  return data;
}


// ======================================================
// COMMENTS — stored in the posts.comments JSONB column
// ======================================================

export async function addComment(postId, comment) {
  // Fetch current comments
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('comments')
    .eq('id', postId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const updatedComments = [...(post?.comments || []), comment];

  const { error } = await supabase
    .from('posts')
    .update({ comments: updatedComments })
    .eq('id', postId);

  if (error) throw error;
}


// ======================================================
// MESSAGES
// ======================================================

export async function sendMessage(sender_id, receiver_id, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, message }])
    .select();

  if (error) throw error;
  return data;
}

export async function getMessages(user1_id, user2_id) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user1_id},receiver_id.eq.${user2_id}),and(sender_id.eq.${user2_id},receiver_id.eq.${user1_id})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMessagesForUser(user_id) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}