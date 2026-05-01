import { useEffect, useRef, useState } from "react";
import { FiHeart, FiMessageCircle, FiSave, FiSend, FiTrendingUp } from "react-icons/fi";
import ProfileAvatar from "../ProfileAvatar.jsx";

function formatPostAge(createdAt) {
  const elapsedMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function AuthorPostsPanel({ post, posts }) {
  const recentPosts = posts
    .filter((candidatePost) => candidatePost.authorName === post.authorName)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 6);
  const authorBio = post.authorBio?.trim() || "This user has not added a bio yet.";

  return (
    <div className="relative w-[min(88vw,320px)] rounded-[28px] border border-white/10 bg-neutral-950/96 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_42%)] absolute inset-0 rounded-[28px] opacity-90" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            displayName={post.authorName}
            imageAlt={post.authorImageAlt}
            imageSrc={post.authorImageSrc}
            size="sm"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{post.authorName}</div>
            <div className="text-xs text-neutral-500">Author profile</div>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-neutral-300">{authorBio}</p>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Recent posts</div>
          <div className="mt-3 max-h-52 space-y-3 overflow-y-auto pr-1">
            {recentPosts.map((recentPost) => (
              <div
                key={recentPost.id}
                className={[
                  "rounded-2xl border border-white/10 px-3 py-3 text-sm",
                  recentPost.id === post.id ? "bg-white/[0.08] text-white" : "bg-white/[0.03] text-neutral-300",
                ].join(" ")}
              >
                <div className="text-xs text-neutral-500">{formatPostAge(recentPost.createdAt)}</div>
                <p className="mt-2 max-h-24 overflow-hidden whitespace-pre-wrap leading-6">{recentPost.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscussionCard({
  allPosts,
  hasLiked,
  hasSaved,
  isFocused,
  post,
  rank,
  onCommentPost,
  onLikePost,
  onSavePost,
}) {
  const cardRef = useRef(null);
  const authorCardCloseTimeoutRef = useRef(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isAuthorCardOpen, setIsAuthorCardOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [successfulAction, setSuccessfulAction] = useState("");

  useEffect(() => {
    if (!isFocused) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isFocused]);

  useEffect(() => {
    return () => {
      if (authorCardCloseTimeoutRef.current) {
        window.clearTimeout(authorCardCloseTimeoutRef.current);
      }
    };
  }, []);

  function openAuthorCard() {
    if (authorCardCloseTimeoutRef.current) {
      window.clearTimeout(authorCardCloseTimeoutRef.current);
      authorCardCloseTimeoutRef.current = null;
    }

    setIsAuthorCardOpen(true);
  }

  function closeAuthorCardWithDelay() {
    if (authorCardCloseTimeoutRef.current) {
      window.clearTimeout(authorCardCloseTimeoutRef.current);
    }

    authorCardCloseTimeoutRef.current = window.setTimeout(() => {
      setIsAuthorCardOpen(false);
      authorCardCloseTimeoutRef.current = null;
    }, 220);
  }

  async function runSaveAction() {
    if (pendingAction || hasSaved) return;

    setPendingAction("save");
    const didSucceed = await onSavePost(post.id);
    setPendingAction("");

    if (!didSucceed) return;

    setSuccessfulAction("save");
    window.setTimeout(() => {
      setSuccessfulAction((currentAction) => (currentAction === "save" ? "" : currentAction));
    }, 1400);
  }

  async function handleCommentSubmit() {
    const trimmedDraft = commentDraft.trim();

    if (!trimmedDraft || pendingAction === "comment") return;

    setPendingAction("comment");
    const didSucceed = await onCommentPost(post.id, trimmedDraft);
    setPendingAction("");

    if (!didSucceed) return;

    setCommentDraft("");
    setSuccessfulAction("comment");
    window.setTimeout(() => {
      setSuccessfulAction((currentAction) => (currentAction === "comment" ? "" : currentAction));
    }, 1400);
  }

  const likeLabel = hasLiked ? "Liked" : "Like";
  const commentButtonLabel = isCommentOpen ? "Comments" : "Comment";
  const saveLabel =
    pendingAction === "save"
      ? "Saving..."
      : successfulAction === "save"
        ? "Saved"
        : hasSaved
          ? "Saved"
          : "Save";

  return (
    <article
      ref={cardRef}
      className={[
        "rounded-[28px] border bg-white/[0.05] p-5 transition",
        isFocused
          ? "border-white/30 ring-2 ring-white/20"
          : "border-white/10",
      ].join(" ")}
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div
            className="relative"
            onMouseEnter={openAuthorCard}
            onMouseLeave={closeAuthorCardWithDelay}
          >
            <button
              type="button"
              className="flex items-start gap-3 rounded-2xl px-2 py-1 text-left transition hover:bg-white/[0.04]"
            >
              <ProfileAvatar
                displayName={post.authorName}
                imageAlt={post.authorImageAlt}
                imageSrc={post.authorImageSrc}
                size="sm"
              />
              <div>
                <div className="text-sm font-medium text-white">{post.authorName}</div>
                <div className="mt-1 text-xs text-neutral-500">{formatPostAge(post.createdAt)}</div>
              </div>
            </button>

            <div
              className={[
                "pointer-events-none absolute left-0 top-full z-30 pt-3 transition duration-200",
                isAuthorCardOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              ].join(" ")}
            >
              <div className={isAuthorCardOpen ? "pointer-events-auto" : "pointer-events-none"}>
                <AuthorPostsPanel post={post} posts={allPosts} />
              </div>
            </div>
          </div>

          {rank === 0 ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
              <FiTrendingUp />
              Top liked right now
            </div>
          ) : null}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-200">{post.content}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
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
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-neutral-400 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
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
                  : "border-white/10 bg-black/20 text-neutral-400 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
            ].join(" ")}
          >
            <FiSave />
            {saveLabel}
          </button>
        </div>

        {isCommentOpen ? (
          <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
            {post.comments.length ? (
              <div className="space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-black/20 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-white">{comment.authorName}</div>
                      <div className="text-xs text-neutral-500">{formatPostAge(comment.createdAt)}</div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
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
                      ? "Success!"
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
                      ? "Success!"
                      : "Post comment"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function DiscussionsView({
  focusedPostId,
  likedPostIds,
  posts,
  savedPostIds,
  onCommentPost,
  onLikePost,
  onSavePost,
}) {
  const sortedPosts = [...posts].sort((left, right) => {
    if (right.likes !== left.likes) return right.likes - left.likes;
    return right.createdAt - left.createdAt;
  });

  return (
    <section className="space-y-5">
      {sortedPosts.length ? (
        <div className="space-y-4">
          {sortedPosts.map((post, index) => (
            <DiscussionCard
              allPosts={sortedPosts}
              key={post.id}
              hasLiked={likedPostIds.includes(post.id)}
              hasSaved={savedPostIds.includes(post.id)}
              isFocused={focusedPostId === post.id}
              post={post}
              rank={index}
              onCommentPost={onCommentPost}
              onLikePost={onLikePost}
              onSavePost={onSavePost}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-6 text-sm text-neutral-400">
          No topics posted yet.
        </div>
      )}
    </section>
  );
}
