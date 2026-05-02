import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import {
  addPost,
  deleteChatSession,
  deletePost,
  getAccountProfile,
  getAccountProfilesByIds,
  getChatSessions,
  getLikedPostIdsByUser,
  getPosts,
  getSavedPostIdsByUser,
  likePost,
  saveChatSession,
  savePostForUser,
  updateAccountProfile,
  updatePost as supabaseUpdatePost,
} from "../../supabase.js";
import DashboardHeader from "./dashboard/DashboardHeader.jsx";
import NotificationTray from "./dashboard/NotificationTray.jsx";
import DashboardSidebar from "./dashboard/DashboardSidebar.jsx";
import {
  DASHBOARD_VIEWS,
  MY_SPACE_TABS,
  normalizeInitialView,
} from "./dashboard/dashboardConfig.js";
import DiscussionsView from "./dashboard/views/DiscussionsView.jsx";
import MySpaceView from "./dashboard/views/MySpaceView.jsx";
import NewChatView from "./dashboard/views/NewChatView.jsx";

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const nextValue = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return nextValue.toString(16);
  });
}

function getDisplayName(user) {
  const metadataName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name;
  if (metadataName) return metadataName;
  if (user?.email) return user.email.split("@")[0];
  return "<USER_NAME>";
}

function getMetadataName(user) {
  return (
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    ""
  );
}

function createAssistantPlaceholder() {
  return {
    id: createId("assistant"),
    role: "assistant",
    content: "ai is thinking...",
    streaming: false,
  };
}

function createEmptyChatSession() {
  return {
    id: createUuid(),
    title: "New chat",
    updatedAt: Date.now(),
    messages: [],
  };
}

function createDiscussionPost({ authorBio, authorImageAlt, authorImageSrc, authorName, authorUserId, content }) {
  const trimmedContent = content.trim();
  return {
    id: createId("post"),
    authorBio: authorBio?.trim() || "",
    authorImageAlt,
    authorImageSrc,
    authorName,
    authorUserId: authorUserId || null,
    content: trimmedContent,
    createdAt: Date.now(),
    likes: 0,
    comments: [],
    saves: 0,
  };
}

function normalizeTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsedValue = new Date(value).getTime();
    if (Number.isFinite(parsedValue)) return parsedValue;
  }

  return Date.now();
}

function normalizeStoredComment(comment) {
  if (typeof comment === "string") {
    return {
      id: createId("comment"),
      authorName: "Anonymous",
      authorUserId: null,
      content: comment,
      createdAt: Date.now(),
    };
  }

  return {
    id: comment?.id || createId("comment"),
    authorName: comment?.user || comment?.authorName || "Anonymous",
    authorUserId: comment?.user_id || comment?.authorUserId || null,
    content: comment?.text || comment?.content || "",
    createdAt: normalizeTimestamp(comment?.createdAt || comment?.created_at),
  };
}

function createComment({ authorName, authorUserId, content }) {
  return {
    id: createId("comment"),
    authorName,
    authorUserId: authorUserId || null,
    content: content.trim(),
    createdAt: Date.now(),
  };
}

function createNotification({ detail, postId, title }) {
  return {
    id: createId("notification"),
    title,
    detail,
    postId,
    timestamp: "Just now",
    unread: true,
  };
}

function waitForUiFeedback(duration = 700) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

const EMPTY_CHAT_MESSAGES = [];

const DASHBOARD_VIEW_STORAGE_KEY = "learnsmart-dashboard-view";
const MY_SPACE_TAB_STORAGE_KEY = "learnsmart-my-space-tab";
const CHAT_SESSIONS_STORAGE_KEY_PREFIX = "learnsmart-chat-sessions";
const DASHBOARD_THEME_STORAGE_KEY = "learnsmart-dashboard-theme";

function isUuid(value) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeChatSession(session) {
  return {
    id: isUuid(session?.id) ? session.id : createUuid(),
    title: typeof session?.title === "string" && session.title.trim() ? session.title.trim() : "New chat",
    updatedAt: normalizeTimestamp(session?.updatedAt || session?.updated_at),
    messages: Array.isArray(session?.messages) ? session.messages : [],
  };
}

function mergeChatSessions(...sessionLists) {
  const sessionsById = new Map();

  sessionLists.flat().forEach((session) => {
    const normalizedSession = normalizeChatSession(session);
    const existingSession = sessionsById.get(normalizedSession.id);

    if (!existingSession || normalizedSession.updatedAt >= existingSession.updatedAt) {
      sessionsById.set(normalizedSession.id, normalizedSession);
    }
  });

  return [...sessionsById.values()].sort((left, right) => right.updatedAt - left.updatedAt);
}

function getChatSessionsStorageKey(userId) {
  return `${CHAT_SESSIONS_STORAGE_KEY_PREFIX}:${userId}`;
}

function loadCachedChatSessions(userId) {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const rawValue = window.localStorage.getItem(getChatSessionsStorageKey(userId));
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.map(normalizeChatSession);
  } catch (error) {
    console.error("Failed to read cached chats:", error);
    return [];
  }
}

function saveCachedChatSessions(userId, sessions) {
  if (typeof window === "undefined" || !userId) return;

  try {
    window.localStorage.setItem(
      getChatSessionsStorageKey(userId),
      JSON.stringify(sessions.map(normalizeChatSession))
    );
  } catch (error) {
    console.error("Failed to cache chats:", error);
  }
}

export default function Dashboard({ user, onLogout, initialView }) {
  const [activeView, setActiveView] = useState(() => {
    const storedView =
      typeof window !== "undefined"
        ? window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY)
        : null;
    return normalizeInitialView(initialView || storedView);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [discussionPosts, setDiscussionPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mutationFeedback, setMutationFeedback] = useState({
    isVisible: false,
    message: "",
    tone: "loading",
  });
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const mutationFeedbackTimeoutRef = useRef(null);
  const mutationFeedbackRequestRef = useRef(0);
  const hasInitializedChatCacheRef = useRef(false);
  const chatCacheUserIdRef = useRef(null);
  const [mySpaceTab, setMySpaceTab] = useState(() => {
    const storedTab =
      typeof window !== "undefined"
        ? window.localStorage.getItem(MY_SPACE_TAB_STORAGE_KEY)
        : null;
    return MY_SPACE_TABS.some((tab) => tab.id === storedTab) ? storedTab : MY_SPACE_TABS[0].id;
  });
  const [profile, setProfile] = useState(() => ({
    displayName: getDisplayName(user),
    bio: "",
    imageSrc: "",
    imageAlt: "<INSERT PROFILE IMAGE HERE>",
  }));
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const storedTheme = window.localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY);
    return storedTheme === "light" ? "light" : "dark";
  });
  // Load posts + liked/saved IDs from Supabase on mount
useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;
  async function loadData() {
    try {
      const [rawPosts, likedIds, savedIds] = await Promise.all([
        getPosts(),
        getLikedPostIdsByUser(user.id),
        getSavedPostIdsByUser(user.id),
      ]);
      if (cancelled) return;
      const authorProfiles = await getAccountProfilesByIds(
        rawPosts.map((post) => post.user_id).filter(Boolean)
      );
      if (cancelled) return;
      const authorProfilesById = new Map(authorProfiles.map((profile) => [profile.id, profile]));
      const normalized = rawPosts.map((r) => ({
        ...(authorProfilesById.get(r.user_id || "") || {}),
        id: r.id,
        authorName: authorProfilesById.get(r.user_id || "")?.username || r.author || "Anonymous",
        authorUserId: r.user_id || null,
        authorBio: authorProfilesById.get(r.user_id || "")?.bio || "",
        authorImageAlt: authorProfilesById.get(r.user_id || "")?.avatar_url ? "Profile image" : "",
        authorImageSrc: authorProfilesById.get(r.user_id || "")?.avatar_url || "",
        content: r.content || "",
        createdAt: new Date(r.created_at).getTime(),
        likes: r.likes || 0,
        saves: r.saves || 0,
        comments: (r.comments || []).map(normalizeStoredComment),
      }));
      setDiscussionPosts(normalized);
      setLikedPostIds(likedIds);
      setSavedPostIds(savedIds);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }
  loadData();
  return () => { cancelled = true; };
}, [user?.id]);

// Load chats from Supabase on mount
useEffect(() => {
  if (!user?.id) return;
  let cancelled = false;

  const cachedSessions = loadCachedChatSessions(user.id);
  if (cachedSessions.length) {
    setChatSessions(cachedSessions);
    setActiveChatId((currentId) => currentId || cachedSessions[0].id);
  }

  async function loadChats() {
    try {
      const sessions = await getChatSessions(user.id);
      if (cancelled) return;
      const mergedSessions = mergeChatSessions(
        cachedSessions,
        sessions.map((session) => ({
          id: session.id,
          title: session.title,
          updatedAt: session.updated_at,
          messages: session.messages,
        }))
      );
      setChatSessions(mergedSessions);
      setActiveChatId((currentId) => currentId || mergedSessions[0]?.id || null);
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }
  loadChats();
  return () => { cancelled = true; };
}, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    if (chatCacheUserIdRef.current !== user.id) {
      chatCacheUserIdRef.current = user.id;
      hasInitializedChatCacheRef.current = false;
    }
    if (!hasInitializedChatCacheRef.current && !chatSessions.length) return;
    hasInitializedChatCacheRef.current = true;
    saveCachedChatSessions(user.id, chatSessions);
  }, [chatSessions, user?.id]);

  useEffect(() => {
    if (!initialView) return;
    setActiveView(normalizeInitialView(initialView));
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, activeView);
  }, [activeView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MY_SPACE_TAB_STORAGE_KEY, mySpaceTab);
  }, [mySpaceTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsNotificationsLoading(false);
    }, 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      if (mutationFeedbackTimeoutRef.current) {
        window.clearTimeout(mutationFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!highlightedPostId) return;
    const timeoutId = window.setTimeout(() => {
      setHighlightedPostId((currentPostId) =>
        currentPostId === highlightedPostId ? null : currentPostId
      );
    }, 2200);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedPostId]);

  useEffect(() => {
    let cancelled = false;

    async function syncDisplayName() {
  const metadataName = getMetadataName(user);
  if (!user?.id) {
    if (cancelled) return;
    setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
    return;
  }
  try {
    const accountProfile = await getAccountProfile(user.id);
    if (cancelled) return;
    setProfile((currentProfile) => ({
      ...currentProfile,
      displayName: accountProfile?.username || metadataName || getDisplayName(user),
      bio: accountProfile?.bio || "",
      imageSrc: accountProfile?.avatar_url || currentProfile.imageSrc,
      imageAlt: accountProfile?.avatar_url ? "Profile image" : currentProfile.imageAlt,
    }));
    return;
  } catch {
      if (!user?.id) {
        if (cancelled) return;
        setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
        return;
      }
    }
      try {
      const accountProfile = await getAccountProfile(user.id);
      if (cancelled) return;
      setProfile((currentProfile) => ({
        ...currentProfile,
        displayName: accountProfile?.username || getDisplayName(user),
        bio: accountProfile?.bio || currentProfile.bio,
        imageSrc: accountProfile?.avatar_url || currentProfile.imageSrc,
        imageAlt: accountProfile?.avatar_url ? "Profile image" : currentProfile.imageAlt,
      }));
        } catch {
          if (cancelled) return;
          setProfile((currentProfile) => ({ ...currentProfile, displayName: getDisplayName(user) }));
      }
    }

    syncDisplayName();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.authorUserId === user.id
          ? {
              ...post,
              authorBio: profile.bio?.trim() || "",
              authorImageAlt: profile.imageAlt,
              authorImageSrc: profile.imageSrc,
              authorName: profile.displayName?.trim() || getDisplayName(user),
            }
          : post
      )
    );
  }, [profile.bio, profile.displayName, profile.imageAlt, profile.imageSrc, user]);

  const activeChat = useMemo(
    () => chatSessions.find((chat) => chat.id === activeChatId) || null,
    [activeChatId, chatSessions]
  );
  const currentMessages = activeChat?.messages?.length ? activeChat.messages : EMPTY_CHAT_MESSAGES;
  const recentChats = useMemo(() => mergeChatSessions(chatSessions), [chatSessions]);
  const displayName = useMemo(
    () => profile.displayName?.trim() || "<USER_NAME>",
    [profile.displayName]
  );
  const isChatView = activeView === DASHBOARD_VIEWS.NEW_CHAT;
  const isEmptyDraftChat = isChatView && (!activeChat || activeChat.messages.length === 0);
  const unreadNotificationCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );
  const myPosts = useMemo(
    () => discussionPosts.filter((post) => post.authorUserId === user?.id),
    [discussionPosts, user?.id]
  );

  const closeSidebar = useCallback(() => {
    if (isLoggingOut) return;
    setIsSidebarOpen(false);
  }, [isLoggingOut]);

  const openNotifications = useCallback(() => {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(true);
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) => ({ ...n, unread: false }))
    );
  }, [isLoggingOut]);

  const closeNotifications = useCallback(() => {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(false);
  }, [isLoggingOut]);

  const handleNotificationSelect = useCallback((notification) => {
    if (isLoggingOut) return;
    setIsNotificationTrayOpen(false);
    setNotifications((currentNotifications) =>
      currentNotifications.map((n) =>
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    if (!notification.postId) return;
    setActiveView(DASHBOARD_VIEWS.DISCUSSIONS);
    setHighlightedPostId(notification.postId);
  }, [isLoggingOut]);

  const openView = useCallback((viewId) => {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    setActiveView(viewId);
    closeSidebar();
  }, [closeSidebar, isLoggingOut]);

  const handleNewChat = useCallback(() => {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    if (activeChat && activeChat.messages.length === 0) {
      setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
      setChatInput("");
      closeSidebar();
      return;
    }
    const nextChat = createEmptyChatSession();
    setActiveChatId(nextChat.id);
    setChatSessions((currentSessions) => [nextChat, ...currentSessions]);
    setChatInput("");
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
  }, [activeChat, closeSidebar, isLoggingOut]);

  const beginMutationFeedback = useCallback((loadingMessage) => {
    const requestId = mutationFeedbackRequestRef.current + 1;
    mutationFeedbackRequestRef.current = requestId;

    if (mutationFeedbackTimeoutRef.current) {
      window.clearTimeout(mutationFeedbackTimeoutRef.current);
      mutationFeedbackTimeoutRef.current = null;
    }

    setMutationFeedback({
      isVisible: true,
      message: loadingMessage,
      tone: "loading",
    });

    function scheduleHide(delay = 1100) {
      mutationFeedbackTimeoutRef.current = window.setTimeout(() => {
        if (mutationFeedbackRequestRef.current !== requestId) return;
        setMutationFeedback((currentFeedback) => ({ ...currentFeedback, isVisible: false }));
        mutationFeedbackTimeoutRef.current = null;
      }, delay);
    }

    return {
      succeed(successMessage) {
        if (mutationFeedbackRequestRef.current !== requestId) return;
        setMutationFeedback({
          isVisible: true,
          message: successMessage,
          tone: "success",
        });
        scheduleHide();
      },
      fail(errorMessage = "Could not save changes") {
        if (mutationFeedbackRequestRef.current !== requestId) return;
        setMutationFeedback({
          isVisible: true,
          message: errorMessage,
          tone: "error",
        });
        scheduleHide(1500);
      },
    };
  }, []);

  const persistChatSession = useCallback(async (session) => {
    if (!user?.id) return;

    try {
      const savedSession = await saveChatSession(user.id, session);
      return savedSession;
    } catch (err) {
      console.error("Save chat error:", err);
      throw err;
    }
  }, [user?.id]);

  const handleChatSubmit = useCallback(() => {
    if (isLoggingOut) return;
    const trimmedInput = chatInput.trim();
    if (!trimmedInput) return;

    const targetId = activeChatId || createUuid();
    const userMessage = {
      id: createId("message"),
      role: "user",
      content: trimmedInput,
      
    };

    setActiveChatId(targetId);
    let nextSessionToPersist = null;
    setChatSessions((currentSessions) => {
      const existingSession = currentSessions.find((s) => s.id === targetId);
      const nextMessages = existingSession
        ? [...existingSession.messages, userMessage, createAssistantPlaceholder()]
        : [userMessage, createAssistantPlaceholder()];
      const nextSession = {
        id: targetId,
        title:
          !existingSession?.title || existingSession.title === "New chat"
            ? trimmedInput
            : existingSession.title,
        updatedAt: Date.now(),
        messages: nextMessages,
      };
      nextSessionToPersist = nextSession;
      const remainingSessions = currentSessions.filter((s) => s.id !== targetId);
      return [nextSession, ...remainingSessions];
    });

    setChatInput("");

    if (nextSessionToPersist) {
      persistChatSession(nextSessionToPersist).catch(() => {});
    }
  }, [activeChat, activeChatId, chatInput, isLoggingOut, persistChatSession]);

  // Called by ChatModule as tokens stream in
  const handleStreamingUpdate = useCallback((messageId, content, streaming) => {
    let nextSessionToPersist = null;
    setChatSessions((currentSessions) =>
      currentSessions.map((session) => {
        if (!session.messages.some((m) => m.id === messageId)) return session;
        const nextSession = {
          ...session,
          messages: session.messages.map((m) => {
            if (m.id !== messageId) return m;
            // null content means the stream was aborted — keep whatever was accumulated
            return {
              ...m,
              content: content !== null ? content : m.content,
              streaming,
            };
          }),
        };
        nextSessionToPersist = nextSession;
        return nextSession;
      })
    );

    if (!streaming && nextSessionToPersist) {
      persistChatSession(nextSessionToPersist).catch(() => {});
    }
  }, [persistChatSession]);

  const handleRecentChatSelect = useCallback((chatId) => {
    if (isLoggingOut) return;
    setHighlightedPostId(null);
    setActiveChatId(chatId);
    setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    closeSidebar();
  }, [closeSidebar, isLoggingOut]);

  const handleDeleteChat = useCallback(async (chatId) => {
    if (isLoggingOut) return;
    const feedback = beginMutationFeedback("Removing chat...");

    const nextActiveChatId = activeChatId === chatId ? null : activeChatId;
    setChatSessions((currentSessions) => currentSessions.filter((session) => session.id !== chatId));
    setActiveChatId(nextActiveChatId);

    if (activeChatId === chatId) {
      setChatInput("");
      setActiveView(DASHBOARD_VIEWS.NEW_CHAT);
    }

    if (!user?.id) {
      feedback.succeed("Chat removed");
      return;
    }

    try {
      await deleteChatSession(user.id, chatId);
      feedback.succeed("Chat removed");
    } catch (err) {
      console.error("Delete chat failed:", err);
      feedback.fail("Could not remove chat");
    }
  }, [activeChatId, beginMutationFeedback, isLoggingOut, user?.id]);

  const handleCreatePost = useCallback(async (content) => {
    if (isLoggingOut) return null;
    const feedback = beginMutationFeedback("Posting topic...");
    await waitForUiFeedback();
    const nextPost = createDiscussionPost({
      authorBio: profile.bio,
      authorImageAlt: profile.imageAlt,
      authorImageSrc: profile.imageSrc,
      authorName: displayName,
      authorUserId: user?.id,
      content,
    });
    setDiscussionPosts((currentPosts) => [nextPost, ...currentPosts]);

    try {
      const saved = await addPost(user?.id, displayName, content);
      const inserted = saved?.[0];
      if (inserted) {
        setDiscussionPosts((currentPosts) =>
          currentPosts.map((post) => (post.id === nextPost.id ? { ...nextPost, id: inserted.id } : post))
        );
      }
      feedback.succeed("Post shared");
    } catch (err) {
      console.error("Failed to save post:", err);
      feedback.fail("Could not post topic");
    }

    return nextPost;
  }, [beginMutationFeedback, displayName, isLoggingOut, profile.bio, profile.imageAlt, profile.imageSrc, user?.id]);

  const handleLikePost = useCallback(async (postId) => {
    if (isLoggingOut) return;
    if (likedPostIds.includes(postId)) return;
    const feedback = beginMutationFeedback("Saving like...");

    setLikedPostIds((ids) => [...ids, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );

    try {
      await likePost(user.id, postId);
      feedback.succeed("Post liked");
    } catch (err) {
      console.error("Like failed:", err);
      feedback.fail("Could not like post");
    }
  }, [beginMutationFeedback, isLoggingOut, likedPostIds, user?.id]);

  const handleSavePost = useCallback(async (postId) => {
    if (isLoggingOut) return false;
    if (savedPostIds.includes(postId)) return false;
    const feedback = beginMutationFeedback("Saving post...");

    await waitForUiFeedback();
    setSavedPostIds((ids) => [...ids, postId]);
    setDiscussionPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, saves: post.saves + 1 } : post
      )
    );

    try {
      await savePostForUser(user.id, postId);
      feedback.succeed("Post saved");
    } catch (err) {
      console.error("Save failed:", err);
      feedback.fail("Could not save post");
    }

    return true;
  }, [beginMutationFeedback, isLoggingOut, savedPostIds, user?.id]);

  const handleCommentPost = useCallback(async (postId, content) => {
    if (isLoggingOut) return false;
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;
    const feedback = beginMutationFeedback("Posting comment...");
    await waitForUiFeedback();
    const nextComment = createComment({
      authorName: displayName,
      authorUserId: user?.id,
      content: trimmedContent,
    });
    try {
      const post = discussionPosts.find((candidatePost) => candidatePost.id === postId);
      const updatedComments = [
        ...(post?.comments || []),
        {
          id: nextComment.id,
          text: trimmedContent,
          user: displayName,
          user_id: user?.id || null,
          createdAt: nextComment.createdAt,
        },
      ];

      await supabaseUpdatePost(postId, { comments: updatedComments });
      setDiscussionPosts((currentPosts) =>
        currentPosts.map((candidatePost) =>
          candidatePost.id === postId
            ? { ...candidatePost, comments: [...candidatePost.comments, nextComment] }
            : candidatePost
        )
      );
    } catch (err) {
      console.error("Comment save failed:", err);
      feedback.fail("Could not post comment");
      return false;
    }

    feedback.succeed("Comment posted");
    return true;
  }, [beginMutationFeedback, discussionPosts, displayName, isLoggingOut, user?.id]);

  const handleUpdatePost = useCallback(async (postId, content) => {
    if (isLoggingOut) return false;

    const trimmedContent = content.trim();
    if (!trimmedContent) return false;
    const post = discussionPosts.find((candidatePost) => candidatePost.id === postId);

    if (!post || post.authorUserId !== user?.id) {
      return false;
    }
    const feedback = beginMutationFeedback("Saving changes...");

    try {
      await supabaseUpdatePost(postId, { content: trimmedContent });
      setDiscussionPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? { ...post, content: trimmedContent } : post
        )
      );
      feedback.succeed("Post updated");
      return true;
    } catch (err) {
      console.error("Update post failed:", err);
      feedback.fail("Could not update post");
      return false;
    }
  }, [beginMutationFeedback, discussionPosts, isLoggingOut, user?.id]);

  const handleDeletePost = useCallback(async (postId) => {
    if (isLoggingOut) return false;
    const post = discussionPosts.find((candidatePost) => candidatePost.id === postId);

    if (!post || post.authorUserId !== user?.id) {
      return false;
    }
    const feedback = beginMutationFeedback("Deleting post...");

    try {
      await deletePost(user.id, postId);
      setDiscussionPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
      setLikedPostIds((currentIds) => currentIds.filter((id) => id !== postId));
      setSavedPostIds((currentIds) => currentIds.filter((id) => id !== postId));
      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.postId !== postId)
      );
      if (highlightedPostId === postId) {
        setHighlightedPostId(null);
      }
      feedback.succeed("Post deleted");
      return true;
    } catch (err) {
      console.error("Delete post failed:", err);
      feedback.fail("Could not delete post");
      return false;
    }
  }, [beginMutationFeedback, discussionPosts, highlightedPostId, isLoggingOut, user?.id]);
  const handleProfileSave = useCallback(async (nextProfile) => {
    if (isLoggingOut) return;
    const feedback = beginMutationFeedback("Saving profile...");
    const trimmedDisplayName = nextProfile.displayName?.trim();

    if (user?.id) {
      console.log("Saving profile:", {
        userId: user.id,
        displayName: trimmedDisplayName,
        bio: nextProfile.bio,
        avatarUrl: nextProfile.imageSrc,
      });
      await updateAccountProfile(user.id, {
        displayName: trimmedDisplayName,
        bio: nextProfile.bio ?? "",
        avatarUrl: nextProfile.imageSrc,
      });
    }

    await waitForUiFeedback();
    setProfile((currentProfile) => ({
      ...currentProfile,
      ...nextProfile,
      bio: nextProfile.bio || "",
      displayName: trimmedDisplayName || currentProfile.displayName,
      imageAlt: nextProfile.imageAlt || currentProfile.imageAlt,
      imageSrc: nextProfile.imageSrc !== undefined ? nextProfile.imageSrc : currentProfile.imageSrc,
    }));
    feedback.succeed("Profile updated");
  }, [beginMutationFeedback, isLoggingOut, user?.id]);

  const handleLogoutRequest = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    closeSidebar();
    closeNotifications();
    await waitForUiFeedback(850);
    await onLogout();
  }, [closeNotifications, closeSidebar, isLoggingOut, onLogout]);

  const handleToggleTheme = useCallback(() => {
    if (isLoggingOut) return;
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, [isLoggingOut]);

  function renderView() {
    if (activeView === DASHBOARD_VIEWS.NEW_CHAT) {
      return (
        <NewChatView
          chatInput={chatInput}
          displayName={displayName}
          messages={currentMessages}
          onChatInputChange={setChatInput}
          onSubmit={handleChatSubmit}
          onStreamingUpdate={handleStreamingUpdate}
        />
      );
    }

    if (activeView === DASHBOARD_VIEWS.DISCUSSIONS) {
      return (
        <DiscussionsView
          currentUserId={user?.id || null}
          focusedPostId={highlightedPostId}
          likedPostIds={likedPostIds}
          posts={discussionPosts}
          savedPostIds={savedPostIds}
          onCommentPost={handleCommentPost}
          onDeletePost={handleDeletePost}
          onLikePost={handleLikePost}
          onSavePost={handleSavePost}
          onUpdatePost={handleUpdatePost}
        />
      );
    }

    return (
      <MySpaceView
        activeTab={mySpaceTab}
        displayName={displayName}
        likedPostIds={likedPostIds}
        posts={myPosts}
        allPosts={discussionPosts}
        profile={profile}
        savedPostIds={savedPostIds}
        userEmail={user?.email || "<USER_EMAIL>"}
        onCreatePost={handleCreatePost}
        onDeletePost={handleDeletePost}
        onTabChange={setMySpaceTab}
      />
    );
  }

  return (
    <div className="dashboard-shell relative min-h-screen overflow-hidden" data-theme={theme}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="dashboard-shell-overlay absolute inset-0" />
        <div className="dashboard-glow absolute left-0 top-0 h-72 w-72 rounded-full blur-3xl" />
        <div className="dashboard-glow absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="dashboard-dot-grid absolute inset-0 bg-dot-grid animate-grid" />
      </div>

      <div
        className={[
          "dashboard-backdrop fixed inset-0 z-30 transition",
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <DashboardSidebar
        activeChatId={activeChatId}
        activeView={activeView}
        isEmptyDraftChat={isEmptyDraftChat}
        isOpen={isSidebarOpen}
        profile={profile}
        recentChats={recentChats}
        theme={theme}
        user={user}
        isLoggingOut={isLoggingOut}
        onClose={closeSidebar}
        onLogout={handleLogoutRequest}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={handleRecentChatSelect}
        onSelectView={openView}
        onToggleTheme={handleToggleTheme}
      />

      <NotificationTray
        isOpen={isNotificationTrayOpen}
        isLoading={isNotificationsLoading}
        notifications={notifications}
        onClose={closeNotifications}
        onNotificationClick={handleNotificationSelect}
      />

      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className={[
          "dashboard-action fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border transition",
          isSidebarOpen ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
        aria-label="Open sidebar"
      >
        <FiMenu />
      </button>

      <div
        className={[
          "fixed right-4 top-4 z-[70] transition duration-200 sm:right-6 sm:top-5",
          mutationFeedback.isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl",
            mutationFeedback.tone === "success"
              ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
            : mutationFeedback.tone === "error"
                ? "border-rose-300/15 bg-rose-400/10 text-rose-100"
                : "dashboard-panel dashboard-title",
          ].join(" ")}
        >
          {mutationFeedback.tone === "loading" ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <div
              className={[
                "h-2.5 w-2.5 rounded-full",
                mutationFeedback.tone === "success" ? "bg-emerald-200" : "bg-rose-200",
              ].join(" ")}
            />
          )}
          <div className="text-sm">{mutationFeedback.message}</div>
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col">
        <DashboardHeader
          activeView={activeView}
          displayName={displayName}
          hasUnreadNotifications={unreadNotificationCount > 0}
          notificationCount={unreadNotificationCount}
          onNotificationsClick={openNotifications}
          onSaveProfile={handleProfileSave}
          profile={profile}
        />

        <main className="flex-1 px-4 pb-4 pt-2 sm:px-6">
          <div
            className={[
              isChatView
                ? "w-full"
                : activeView === DASHBOARD_VIEWS.MY_SPACE
                  ? "mx-auto w-full max-w-6xl"
                  : "mx-auto w-full max-w-6xl",
            ].join(" ")}
          >
            {renderView()}
          </div>
        </main>
      </div>

      {isLoggingOut ? (
        <div className="dashboard-backdrop fixed inset-0 z-[90] flex items-center justify-center backdrop-blur-xl">
          <div className="absolute inset-0">
            <div className="dashboard-shell-overlay absolute inset-0 animate-gradient" />
            <div className="dashboard-glow absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />
            <div className="dashboard-glow absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl" />
            <div className="dashboard-dot-grid absolute inset-0 bg-dot-grid animate-grid" />
          </div>
          <div className="relative flex flex-col items-center gap-4 px-6 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-white" />
            <div className="dashboard-title text-3xl font-semibold tracking-tight sm:text-4xl">Logging out</div>
            <div className="dashboard-copy text-sm">Securing your session and returning to login.</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
