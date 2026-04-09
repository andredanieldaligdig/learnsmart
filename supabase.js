import { createClient } from '@supabase/supabase-js';

// ----- Supabase client setup -----
const supabaseUrl = 'https://obxthuoqtaoimpidximk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ieHRodW9xdGFvaW1waWR4aW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDg1NjcsImV4cCI6MjA4NjQ4NDU2N30.9T5xvSVwptKWxKzx-a1ozBK3uH04oOUd1G4Ibe-wvZE'; // (keep private in real apps)

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

// Signup new user (FIXED VERSION)
export async function createAccount(email, password, username, gender, dob) {
  // 1. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const user = data.user;

  // 2. Insert profile into accounts table
  if (user) {
    const { error: profileError } = await supabase
      .from('accounts')
      .insert([
        {
          id: user.id,
          email,
          username,
          gender,
          dob,
        },
      ]);

    if (profileError) throw profileError;
  }

  return user;
}


// Login
export async function loginAccount(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}


// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


// Get current user
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


// ======================================================
// POSTS
// ======================================================

// Add post
export async function addPost(user_id, title, content) {
  try {
    let uid = user_id;
    let author = null;

    if (!uid) {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      uid = user?.id || null;
      author = user?.email || null;
    }

    const payload = {
      content: content || title || "",
      likes: 0,
      comments: [],
    };

    if (uid) payload.user_id = uid;
    if (author) payload.author = author;

    const { data, error } = await supabase
      .from('posts')
      .insert([payload])
      .select();

    if (error) throw error;
    return data;

  } catch (err) {
    console.error('addPost error:', err);
    throw err;
  }
}


// Update post
export async function updatePost(id, changes) {
  const { data, error } = await supabase
    .from('posts')
    .update(changes)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0];
}


// Get all posts
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*');

  if (error) throw error;
  return data;
}


// Get posts by user
export async function getPostsByUser(user_id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user_id);

  if (error) throw error;
  return data;
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