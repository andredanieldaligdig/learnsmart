import { createClient } from '@supabase/supabase-js';

// ----- Supabase client setup -----
const supabaseUrl = 'https://obxthuoqtaoimpidximk.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ieHRodW9xdGFvaW1waWR4aW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDg1NjcsImV4cCI6MjA4NjQ4NDU2N30.9T5xvSVwptKWxKzx-a1ozBK3uH04oOUd1G4Ibe-wvZE';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ----- AUTH -----
// Signup new user
export async function createAccount(email, password, dob = null, gender = null) {
  // 1️⃣ Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // 2️⃣ Add extra fields to accounts table (DOB, gender)
  if (dob || gender) {
    const { error: profileError } = await supabase
      .from('accounts')
      .insert([{
        id: data.user.id,
        email,
        dob,
        gender,
      }]);
    if (profileError) throw profileError;
  }

  return data.user;
}

// Login existing user
export async function loginAccount(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

// ----- POSTS -----
// Add a post
export async function addPost(user_id, title, content) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ user_id, title, content }])
    .select();
  if (error) throw error;
  return data;
}

// Get all posts
export async function getPosts() {
  const { data, error } = await supabase.from('posts').select('*');
  if (error) throw error;
  return data;
}

// Get posts by user
export async function getPostsByUser(user_id) {
  const { data, error } = await supabase.from('posts').select('*').eq('user_id', user_id);
  if (error) throw error;
  return data;
}

// ----- MESSAGES -----
// Send a message
export async function sendMessage(sender_id, receiver_id, message) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, message }])
    .select();
  if (error) throw error;
  return data;
}

// Get messages between two users
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

// Get all messages for a user
export async function getMessagesForUser(user_id) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
