import { useEffect, useRef, useState } from "react";
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
    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-400">
      <span className="text-white">{value}</span> {label}
    </div>
  );
}

function AuthorPostsPanel({ post, posts }) {
  const recentPosts = posts
    .filter((candidatePost) => {
      return getAuthorKey(candidatePost) === getAuthorKey(post);
    })
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 6);
  const authorBio = post.authorBio?.trim() || "This user has not added a bio yet.";

  return (
    <div className="rounded-[26px] border border-white/10 bg-neutral-950/95 p-4">
      <div>
        <div className="flex items-center gap-3">
          <ProfileAvatar
            displayName={post.authorName}
            imageAlt={post.authorImageAlt}
            imageSrc={post.authorImageSrc}
            size="sm"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{post.authorName}</div>
            <div className="text-xs text-neutral-500">Author profile</div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-neutral-300">{authorBio}</p>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Recent posts</div>
          <div className="mt-3 space-y-2">
            {recentPosts.map((recentPost) => (
              <div
                key={recentPost.id}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm",
                  recentPost.id === post.id
                    ? "border-white/15 bg-white/[0.06] text-white"
                    : "border-white/8 bg-white/[0.03] text-neutral-300",
                ].join(" ")}
              >
                <div className="text-xs text-neutral-500">{formatPostAge(recentPost.createdAt)}</div>
                <p className="mt-2 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap leading-6">{recentPost.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscussionCard({
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

    const shouldDelete = window.confirm("Delete this post?");
    if (!shouldDelete) return;

    setIsActionsMenuOpen(false);
    setPendingAction("delete");
    await onDeletePost(post.id);
    setPendingAction("");
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
        "rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition duration-300",
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
                    <div className="truncate text-sm font-semibold text-white">{post.authorName}</div>
                    <FiChevronDown
                      className={[
                        "text-xs text-neutral-500 transition duration-300",
                        isSelectedAuthor ? "rotate-[-90deg]" : "",
                      ].join(" ")}
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{formatPostAge(post.createdAt)}</div>
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
                    <div className="truncate text-sm font-semibold text-white">{post.authorName}</div>
                    <AuthorBadge />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{formatPostAge(post.createdAt)}</div>
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition hover:border-white/30 hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Post options"
                >
                  <FiMoreHorizontal />
                </button>

                {isActionsMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-white/15 bg-neutral-900 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.42)]">
                    <button
                      type="button"
                      disabled={pendingAction === "edit" || pendingAction === "delete"}
                      onClick={() => {
                        setIsEditing((currentValue) => !currentValue);
                        setEditDraft(post.content);
                        setIsActionsMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiEdit2 />
                      {isEditing ? "Close editor" : "Edit post"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingAction === "delete"}
                      onClick={handleDelete}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2 />
                      {pendingAction === "delete" ? "Deleting..." : "Delete post"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <textarea
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              rows={4}
              className="w-full resize-none bg-transparent text-sm leading-7 text-white outline-none placeholder:text-neutral-500"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-500">
                {pendingAction === "edit" ? "Saving changes..." : "Keep it concise and clear."}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDraft(post.content);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
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
                        : "bg-white text-black hover:bg-neutral-200",
                  ].join(" ")}
                >
                  <FiCheck />
                  {pendingAction === "edit" ? "Saving..." : "Save post"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 whitespace-pre-wrap border-l border-white/10 pl-4 text-[15px] leading-8 text-neutral-100">
            {post.content}
          </p>
        )}

        <div className="mt-5 border-t border-white/10 pt-4">
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
                : "border-white/10 bg-black/20 text-neutral-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
            ].join(" ")}
          >
            <FiHeart />
            {likeLabel}
          </button>

          <button
            type="button"
            onClick={() => setIsCommentOpen((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
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
                  : "border-white/10 bg-black/20 text-neutral-300 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
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
            <div className="space-y-4 border-t border-white/10 pt-4">
              {post.comments.length ? (
                <div className="space-y-3">
                  {post.comments.map((comment) => {
                    const authoredByPostOwner = isPostAuthorComment(comment, post);

                    return (
                      <div key={comment.id} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-semibold text-white">{comment.authorName}</div>
                            {authoredByPostOwner ? <AuthorBadge /> : null}
                          </div>
                          <div className="text-xs text-neutral-500">{formatPostAge(comment.createdAt)}</div>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{comment.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/10 bg-black/10 px-4 py-4 text-sm text-neutral-500">
                  No comments yet.
                </div>
              )}

              <div className="rounded-[24px] border border-white/10 bg-black/20 p-3">
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-neutral-500"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div
                    className={[
                      "text-xs transition",
                      successfulAction === "comment" ? "text-emerald-300" : "text-neutral-500",
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
                            ? "bg-white text-black hover:bg-neutral-200"
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
    </article>
  );
}

export default function DiscussionsView({
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
  const sortedPosts = [...posts].sort((left, right) => {
    if (right.likes !== left.likes) return right.likes - left.likes;
    return right.createdAt - left.createdAt;
  });
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

  const selectedAuthorPost =
    sortedPosts.find((post) => getAuthorKey(post) === selectedAuthorKey) || null;

  function handleSelectAuthor(post) {
    if (!post || post.authorUserId === currentUserId) return;
    const nextKey = getAuthorKey(post);
    setSelectedAuthorKey((currentKey) => (currentKey === nextKey ? "" : nextKey));
  }

  return (
    <section className="space-y-5">
      {sortedPosts.length ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),300px]">
          <div className="space-y-4">
            {sortedPosts.map((post, index) => (
              <DiscussionCard
                currentUserId={currentUserId}
                key={post.id}
                hasLiked={likedPostIds.includes(post.id)}
                hasSaved={savedPostIds.includes(post.id)}
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

          <aside className="xl:sticky xl:top-24 xl:self-start">
            {selectedAuthorPost ? (
              <AuthorPostsPanel post={selectedAuthorPost} posts={sortedPosts} />
            ) : (
              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Author details</div>
                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  Click another user&apos;s profile in a discussion card to see their name, bio, and recent posts here.
                </p>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-neutral-400">
          No topics posted yet.
        </div>
      )}
    </section>
  );
}
