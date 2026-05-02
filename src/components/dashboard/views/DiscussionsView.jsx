import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiEdit2,
  FiHeart,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSave,
  FiSend,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import ProfileAvatar from "../ProfileAvatar.jsx";

function getAuthorKey(post) {
  if (post.authorUserId) return `user:${post.authorUserId}`;
  return `name:${String(post.authorName || "").trim().toLowerCase()}`;
}

function formatPostAge(createdAt) {
  const elapsedMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function isPostAuthorComment(comment, post) {
  if (comment.authorUserId && post.authorUserId) {
    return comment.authorUserId === post.authorUserId;
  }

  return String(comment.authorName || "").trim().toLowerCase() ===
    String(post.authorName || "").trim().toLowerCase();
}

function AuthorBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-sky-400/25 bg-sky-400/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100">
      Author
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="dashboard-surface-strong dashboard-copy rounded-full border px-3 py-1 text-xs">
      <span className="dashboard-title">{value}</span> {label}
    </div>
  );
}

const EMPTY_POSTS = [];

const AuthorPostsPanel = memo(function AuthorPostsPanel({ post, recentPosts, onClose }) {
  const authorBio = post.authorBio?.trim() || "This user has not added a bio yet.";

  return (
    <aside className="dashboard-panel discussion-author-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-[28rem] flex-col px-4 py-4 sm:max-w-[30rem] sm:backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <div className="dashboard-muted text-xs uppercase tracking-[0.28em]">LearnSmart</div>
          <div className="dashboard-title mt-1 text-base font-medium">Profile</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="dashboard-action flex h-9 w-9 items-center justify-center rounded-lg border transition"
          aria-label="Close profile panel"
        >
          <FiX />
        </button>
      </div>

      <div className="dashboard-surface mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border p-5">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            displayName={post.authorName}
            imageAlt={post.authorImageAlt}
            imageSrc={post.authorImageSrc}
            size="sm"
          />
          <div className="min-w-0">
            <div className="dashboard-title truncate text-sm font-semibold">{post.authorName}</div>
            <div className="dashboard-muted text-xs">Author profile</div>
          </div>
        </div>

        <div className="dashboard-surface-strong discussion-author-panel-content mt-4 flex-1 rounded-[24px] border p-4">
          <div className="space-y-5">
            <div>
              <div className="dashboard-muted text-[11px] uppercase tracking-[0.22em]">Bio</div>
              <p className="dashboard-copy mt-3 whitespace-pre-wrap text-sm leading-7">{authorBio}</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="dashboard-muted text-[11px] uppercase tracking-[0.22em]">Recent posts</div>
                <div className="dashboard-surface rounded-full border px-3 py-1 text-[11px] dashboard-copy">
                  {recentPosts.length} shared
                </div>
              </div>
              <div className="mt-3 space-y-3">
                {recentPosts.map((recentPost) => (
                  <div
                    key={recentPost.id}
                    className={[
                      "discussion-author-post-card flex min-h-[11.5rem] flex-col rounded-2xl border px-4 py-4 text-sm",
                      recentPost.id === post.id
                        ? "dashboard-surface-soft dashboard-title"
                        : "dashboard-surface dashboard-copy",
                    ].join(" ")}
                  >
                    <div className="dashboard-muted text-xs">{formatPostAge(recentPost.createdAt)}</div>
                    <div className="mt-3 flex-1 overflow-y-auto pr-1">
                      <p className="whitespace-pre-wrap leading-6">{recentPost.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
});

const DiscussionCard = memo(function DiscussionCard({
  currentUserId,
  hasLiked,
  hasSaved,
  isFocused,
  isSelectedAuthor,
  post,
  rank,
  onCommentPost,
  onDeletePost,
  onLikePost,
  onSavePost,
  onSelectAuthor,
  onUpdatePost,
}) {
  const cardRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editDraft, setEditDraft] = useState(post.content);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [successfulAction, setSuccessfulAction] = useState("");
  const isOwnPost = Boolean(currentUserId) && post.authorUserId === currentUserId;
  const canOpenAuthorPanel = !isOwnPost;

  useEffect(() => {
    setEditDraft(post.content);
  }, [post.content]);

  useEffect(() => {
    if (!isFocused) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isFocused]);

  useEffect(() => {
    if (!isActionsMenuOpen) return;

    function handlePointerDown(event) {
      if (!actionsMenuRef.current?.contains(event.target)) {
        setIsActionsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isActionsMenuOpen]);

  useEffect(() => {
    if (!isDeleteConfirming) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && pendingAction !== "delete") {
        setIsDeleteConfirming(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteConfirming, pendingAction]);

  function flashAction(action) {
    setSuccessfulAction(action);
    window.setTimeout(() => {
      setSuccessfulAction((currentAction) => (currentAction === action ? "" : currentAction));
    }, 1400);
  }

  async function runSaveAction() {
    if (pendingAction || hasSaved) return;

    setPendingAction("save");
    const didSucceed = await onSavePost(post.id);
    setPendingAction("");

    if (didSucceed) {
      flashAction("save");
    }
  }

  async function handleCommentSubmit() {
    const trimmedDraft = commentDraft.trim();

    if (!trimmedDraft || pendingAction === "comment") return;

    setPendingAction("comment");
    const didSucceed = await onCommentPost(post.id, trimmedDraft);
    setPendingAction("");

    if (!didSucceed) return;

    setCommentDraft("");
    setIsCommentOpen(true);
    flashAction("comment");
  }

  async function handleEditSubmit() {
    const trimmedDraft = editDraft.trim();

    if (!trimmedDraft || trimmedDraft === post.content.trim() || pendingAction === "edit") {
      setIsEditing(false);
      setEditDraft(post.content);
      return;
    }

    setPendingAction("edit");
    const didSucceed = await onUpdatePost(post.id, trimmedDraft);
    setPendingAction("");

    if (!didSucceed) return;

    setIsEditing(false);
    flashAction("edit");
  }

  async function handleDelete() {
    if (pendingAction === "delete") return;

    setIsActionsMenuOpen(false);
    setPendingAction("delete");
    const didDelete = await onDeletePost(post.id);
    setPendingAction("");
    if (didDelete) {
      setIsDeleteConfirming(false);
      return;
    }
    setIsDeleteConfirming(true);
  }

  const likeLabel = hasLiked ? "Liked" : "Like";
  const commentButtonLabel = isCommentOpen ? "Hide comments" : "Comments";
  const saveLabel =
    pendingAction === "save"
      ? "Saving..."
      : successfulAction === "save" || hasSaved
        ? "Saved"
        : "Save";

  return (
    <article
      ref={cardRef}
      className={[
        "dashboard-surface rounded-[28px] border p-6 transition duration-300",
        isFocused
          ? "ring-1 ring-white/20"
          : "",
      ].join(" ")}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {canOpenAuthorPanel ? (
              <button
                type="button"
                onClick={() => onSelectAuthor(post)}
                className={[
                  "flex max-w-full items-start gap-3 rounded-2xl px-2 py-1 text-left transition",
                  isSelectedAuthor ? "bg-white/[0.06]" : "hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <ProfileAvatar
                  displayName={post.authorName}
                  imageAlt={post.authorImageAlt}
                  imageSrc={post.authorImageSrc}
                  size="sm"
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                    <div className="dashboard-title truncate text-sm font-semibold">{post.authorName}</div>
                    <FiChevronDown
                      className={[
                        "text-xs text-neutral-500 transition duration-300",
                        isSelectedAuthor ? "rotate-[-90deg]" : "",
                      ].join(" ")}
                    />
                  </div>
                  <div className="dashboard-muted mt-1 text-xs">{formatPostAge(post.createdAt)}</div>
                </div>
              </button>
            ) : (
              <div className="flex items-start gap-3 px-2 py-1">
                <ProfileAvatar
                  displayName={post.authorName}
                  imageAlt={post.authorImageAlt}
                  imageSrc={post.authorImageSrc}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="dashboard-title truncate text-sm font-semibold">{post.authorName}</div>
                    <AuthorBadge />
                  </div>
                  <div className="dashboard-muted mt-1 text-xs">{formatPostAge(post.createdAt)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {rank === 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-300">
                <FiTrendingUp />
                Top liked
              </div>
            ) : null}

            {isOwnPost ? (
              <div ref={actionsMenuRef} className="relative">
                <button
                  type="button"
                  disabled={pendingAction === "delete"}
                  onClick={() => setIsActionsMenuOpen((currentValue) => !currentValue)}
                  className="dashboard-action flex h-10 w-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Post options"
                >
                  <FiMoreHorizontal />
                </button>

                {isActionsMenuOpen ? (
                  <div className="dashboard-panel absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border p-2">
                    <button
                      type="button"
                      disabled={pendingAction === "edit" || pendingAction === "delete"}
                      onClick={() => {
                        setIsEditing((currentValue) => !currentValue);
                        setEditDraft(post.content);
                        setIsActionsMenuOpen(false);
                      }}
                      className="dashboard-action flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiEdit2 />
                      {isEditing ? "Close editor" : "Edit post"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingAction === "delete"}
                      onClick={() => {
                        setIsDeleteConfirming(true);
                        setIsActionsMenuOpen(false);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2 />
                      Delete post
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <div className="dashboard-surface-strong mt-5 rounded-[24px] border p-4">
            <textarea
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              rows={4}
              className="dashboard-textarea dashboard-title w-full resize-none text-sm leading-7 outline-none placeholder:text-neutral-500"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="dashboard-muted text-xs">
                {pendingAction === "edit" ? "Saving changes..." : "Keep it concise and clear."}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDraft(post.content);
                  }}
                  className="dashboard-action inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition"
                >
                  <FiX />
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!editDraft.trim() || pendingAction === "edit"}
                  onClick={handleEditSubmit}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    !editDraft.trim()
                      ? "cursor-not-allowed bg-white/25 text-neutral-500"
                      : pendingAction === "edit"
                        ? "cursor-wait bg-white/80 text-black"
                        : "dashboard-action-strong",
                  ].join(" ")}
                >
                  <FiCheck />
                  {pendingAction === "edit" ? "Saving..." : "Save post"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="dashboard-copy dashboard-line mt-5 whitespace-pre-wrap border-l pl-4 text-[15px] leading-8">
            {post.content}
          </p>
        )}

        <div className="dashboard-line mt-5 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatPill label="likes" value={post.likes} />
            <StatPill label="comments" value={post.comments.length} />
            <StatPill label="saves" value={post.saves} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={hasLiked}
            onClick={() => onLikePost(post.id)}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
              hasLiked
                ? "cursor-not-allowed border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                : "dashboard-action border",
            ].join(" ")}
          >
            <FiHeart />
            {likeLabel}
          </button>

          <button
            type="button"
            onClick={() => setIsCommentOpen((currentValue) => !currentValue)}
            className="dashboard-action inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition"
          >
            <FiMessageCircle />
            {commentButtonLabel}
          </button>

          <button
            type="button"
            disabled={hasSaved || pendingAction === "save"}
            onClick={runSaveAction}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
              successfulAction === "save" || hasSaved
                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                : pendingAction === "save"
                  ? "cursor-wait border-white/10 bg-white/[0.08] text-white"
                  : "dashboard-action border",
            ].join(" ")}
          >
            <FiSave />
            {saveLabel}
          </button>
        </div>

        <div
          className={[
            "grid overflow-hidden transition-all duration-300 ease-out",
            isCommentOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="dashboard-line space-y-4 border-t pt-4">
              {post.comments.length ? (
                <div className="space-y-3">
                  {post.comments.map((comment) => {
                    const authoredByPostOwner = isPostAuthorComment(comment, post);

                    return (
                      <div key={comment.id} className="dashboard-surface-strong rounded-[22px] border px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="dashboard-title text-sm font-semibold">{comment.authorName}</div>
                            {authoredByPostOwner ? <AuthorBadge /> : null}
                          </div>
                          <div className="dashboard-muted text-xs">{formatPostAge(comment.createdAt)}</div>
                        </div>
                        <p className="dashboard-copy mt-2 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="dashboard-surface-strong dashboard-muted rounded-[22px] border border-dashed px-4 py-4 text-sm">
                  No comments yet.
                </div>
              )}

              <div className="dashboard-surface-strong rounded-[24px] border p-3">
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="dashboard-textarea dashboard-title w-full resize-none text-sm leading-6 outline-none placeholder:text-neutral-500"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className={[
                      "text-xs transition",
                      successfulAction === "comment" ? "text-emerald-300" : "dashboard-muted",
                    ].join(" ")}
                  >
                    {pendingAction === "comment"
                      ? "Commenting..."
                      : successfulAction === "comment"
                        ? "Comment posted."
                        : ""}
                  </div>
                  <button
                    type="button"
                    disabled={!commentDraft.trim() || pendingAction === "comment"}
                    onClick={handleCommentSubmit}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                      successfulAction === "comment"
                        ? "bg-emerald-300 text-emerald-950"
                        : pendingAction === "comment"
                          ? "cursor-wait bg-white/80 text-black"
                          : commentDraft.trim()
                            ? "dashboard-action-strong"
                            : "cursor-not-allowed bg-white/30 text-neutral-500",
                    ].join(" ")}
                  >
                    <FiSend />
                    {pendingAction === "comment"
                      ? "Commenting..."
                      : successfulAction === "comment"
                        ? "Posted"
                        : "Post comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDeleteConfirming ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            disabled={pendingAction === "delete"}
            onClick={() => setIsDeleteConfirming(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />
          <div className="relative z-[81] w-full max-w-md rounded-[28px] border border-rose-300/15 bg-neutral-950/96 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:bg-neutral-900/96 sm:backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-[0.24em] text-rose-200/80">Delete post</div>
            <div className="mt-3 text-xl font-semibold tracking-tight text-white">Delete this post permanently?</div>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This action cannot be undone. The post and its discussion will be removed.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                disabled={pendingAction === "delete"}
                onClick={() => setIsDeleteConfirming(false)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiX />
                Cancel
              </button>
              <button
                type="button"
                disabled={pendingAction === "delete"}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-full bg-rose-200 px-4 py-2 text-sm font-medium text-rose-950 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 />
                {pendingAction === "delete" ? "Deleting..." : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
});

const DiscussionsView = memo(function DiscussionsView({
  currentUserId,
  focusedPostId,
  likedPostIds,
  posts,
  savedPostIds,
  onCommentPost,
  onDeletePost,
  onLikePost,
  onSavePost,
  onUpdatePost,
}) {
  const sortedPosts = useMemo(() => {
    return [...posts].sort((left, right) => {
      if (right.likes !== left.likes) return right.likes - left.likes;
      return right.createdAt - left.createdAt;
    });
  }, [posts]);
  const likedPostIdSet = useMemo(() => new Set(likedPostIds), [likedPostIds]);
  const savedPostIdSet = useMemo(() => new Set(savedPostIds), [savedPostIds]);
  const postsByAuthor = useMemo(() => {
    const nextPostsByAuthor = new Map();

    posts.forEach((post) => {
      const authorKey = getAuthorKey(post);
      const currentPosts = nextPostsByAuthor.get(authorKey);

      if (currentPosts) {
        currentPosts.push(post);
        return;
      }

      nextPostsByAuthor.set(authorKey, [post]);
    });

    nextPostsByAuthor.forEach((authorPosts) => {
      authorPosts.sort((left, right) => right.createdAt - left.createdAt);
    });

    return nextPostsByAuthor;
  }, [posts]);
  const [selectedAuthorKey, setSelectedAuthorKey] = useState("");

  useEffect(() => {
    if (!sortedPosts.length) {
      setSelectedAuthorKey("");
      return;
    }

    setSelectedAuthorKey((currentKey) => {
      if (currentKey && sortedPosts.some((post) => getAuthorKey(post) === currentKey)) {
        return currentKey;
      }

      return "";
    });
  }, [sortedPosts]);

  useEffect(() => {
    if (!selectedAuthorKey) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedAuthorKey("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAuthorKey]);

  const selectedAuthorPost = useMemo(() => {
    return sortedPosts.find((post) => getAuthorKey(post) === selectedAuthorKey) || null;
  }, [selectedAuthorKey, sortedPosts]);
  const selectedAuthorPosts = useMemo(() => {
    if (!selectedAuthorKey) return EMPTY_POSTS;
    return postsByAuthor.get(selectedAuthorKey) || EMPTY_POSTS;
  }, [postsByAuthor, selectedAuthorKey]);

  const closeAuthorPanel = useCallback(() => {
    setSelectedAuthorKey("");
  }, []);

  const handleSelectAuthor = useCallback((post) => {
    if (!post || post.authorUserId === currentUserId) return;
    const nextKey = getAuthorKey(post);
    setSelectedAuthorKey((currentKey) => (currentKey === nextKey ? "" : nextKey));
  }, [currentUserId]);

  return (
    <section className="space-y-5">
      {selectedAuthorPost ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 transition-opacity"
            onClick={closeAuthorPanel}
          aria-label="Close profile panel backdrop"
        />
      ) : null}

      {sortedPosts.length ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {sortedPosts.map((post, index) => (
              <DiscussionCard
                currentUserId={currentUserId}
                key={post.id}
                hasLiked={likedPostIdSet.has(post.id)}
                hasSaved={savedPostIdSet.has(post.id)}
                isFocused={focusedPostId === post.id}
                isSelectedAuthor={selectedAuthorKey === getAuthorKey(post)}
                post={post}
                rank={index}
                onCommentPost={onCommentPost}
                onDeletePost={onDeletePost}
                onLikePost={onLikePost}
                onSavePost={onSavePost}
                onSelectAuthor={handleSelectAuthor}
                onUpdatePost={onUpdatePost}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-surface dashboard-copy rounded-[28px] border border-dashed px-5 py-6 text-sm">
          No topics posted yet.
        </div>
      )}

      {selectedAuthorPost ? (
        <AuthorPostsPanel
          post={selectedAuthorPost}
          recentPosts={selectedAuthorPosts.slice(0, 6)}
          onClose={closeAuthorPanel}
        />
      ) : null}
    </section>
  );
});

export default DiscussionsView;
