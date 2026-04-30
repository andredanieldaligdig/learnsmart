import { FiEdit3, FiMessageSquare, FiUser } from "react-icons/fi";

export const DASHBOARD_VIEWS = {
  NEW_CHAT: "new_chat",
  DISCUSSIONS: "discussions",
  MY_SPACE: "my_space",
};

export const SIDEBAR_ITEMS = [
  {
    id: DASHBOARD_VIEWS.NEW_CHAT,
    label: "New Chat",
    icon: FiEdit3,
  },
  {
    id: DASHBOARD_VIEWS.DISCUSSIONS,
    label: "Discussions",
    icon: FiMessageSquare,
  },
  {
    id: DASHBOARD_VIEWS.MY_SPACE,
    label: "My Space",
    icon: FiUser,
  },
];

export const VIEW_META = {
  [DASHBOARD_VIEWS.NEW_CHAT]: {
    title: "New Chat",
    description: "Chat with LearnSmart",
  },
  [DASHBOARD_VIEWS.DISCUSSIONS]: {
    title: "Discussions",
    description: "Community threads",
  },
  [DASHBOARD_VIEWS.MY_SPACE]: {
    title: "My Space",
    description: "Profile and saved activity",
  },
};

export const MY_SPACE_TABS = [
  { id: "saved", label: "Saved" },
  { id: "liked", label: "Liked" },
  { id: "bookmarked", label: "Bookmarked" },
];

export function normalizeInitialView(view) {
  const allowedViews = new Set(Object.values(DASHBOARD_VIEWS));

  return allowedViews.has(view) ? view : DASHBOARD_VIEWS.NEW_CHAT;
}
