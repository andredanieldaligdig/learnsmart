import { useState } from "react";
import { FiBookmark, FiHeart, FiMessageCircle, FiTrendingUp } from "react-icons/fi";
import ProfileAvatar from "../ProfileAvatar.jsx";

function formatPostAge(createdAt) {
  const elapsedMinutes = Math.max(1, Math.floor((Date.now() - createdAt) / 60000));

  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  return `${Math.floor(elapsedHours / 24)}d ago`;
}

function DiscussionCard({
  hasCommented,
  hasLiked,
  hasSaved,
  post,
  rank,
  onCommentPost,
  onLikePost,
  onSavePost,
}) {
  const [pendingAction, setPendingAction] = useState("");
  const [successfulAction, setSuccessfulAction] = useState("");

  async function runAction(actionType, actionHandler) {
    if (pendingAction || successfulAction === actionType) return;

    setPendingAction(actionType);
    const didSucceed = await actionHandler(post.id);
    setPendingAction("");

    if (!didSucceed) return;

    setSuccessfulAction(actionType);
    window.setTimeout(() => {
      setSuccessfulAction((currentAction) => (currentAction === actionType ? "" : currentAction));
    }, 1400);
  }

  const likeLabel = hasLiked
    ? `${post.likes} ${post.likes === 1 ? "Like" : "Likes"} - Liked`
    : `${post.likes} ${post.likes === 1 ? "Like" : "Likes"}`;
  const commentLabel =
    pendingAction === "comment"
      ? "Commenting..."
      : successfulAction === "comment"
        ? "Success!"
        : hasCommented
          ? `${post.comments} Comments - Added`
          : `${post.comments} Comments`;
  const saveLabel =
    pendingAction === "save"
      ? "Saving..."
      : successfulAction === "save"
        ? "Success!"
        : hasSaved
          ? `${post.saves} Saves - Saved`
          : `${post.saves} Saves`;

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
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
          disabled={hasCommented || pendingAction === "comment"}
          onClick={() => runAction("comment", onCommentPost)}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
            successfulAction === "comment" || hasCommented
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              : pendingAction === "comment"
                ? "cursor-wait border-white/10 bg-white/[0.08] text-white"
                : "border-white/10 bg-black/20 text-neutral-400 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
          ].join(" ")}
        >
          <FiMessageCircle />
          {commentLabel}
        </button>

        <button
          type="button"
          disabled={hasSaved || pendingAction === "save"}
          onClick={() => runAction("save", onSavePost)}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
            successfulAction === "save" || hasSaved
              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
              : pendingAction === "save"
                ? "cursor-wait border-white/10 bg-white/[0.08] text-white"
                : "border-white/10 bg-black/20 text-neutral-400 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
          ].join(" ")}
        >
          <FiBookmark />
          {saveLabel}
        </button>
      </div>
    </article>
  );
}

export default function DiscussionsView({
  commentedPostIds,
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
      <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-neutral-500">Discussions</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Community topics float here once people engage.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
              Posts created from My Space appear here and sort by likes, so the strongest topics naturally rise toward the top.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300">
            {sortedPosts.length} {sortedPosts.length === 1 ? "topic" : "topics"} in discussion
          </div>
        </div>
      </div>

      {sortedPosts.length ? (
        <div className="space-y-4">
          {sortedPosts.map((post, index) => (
            <DiscussionCard
              key={post.id}
              hasCommented={commentedPostIds.includes(post.id)}
              hasLiked={likedPostIds.includes(post.id)}
              hasSaved={savedPostIds.includes(post.id)}
              post={post}
              rank={index}
              onCommentPost={onCommentPost}
              onLikePost={onLikePost}
              onSavePost={onSavePost}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-neutral-400">
          No discussion topics yet. Create one from My Space and it will show up here for the community feed.
        </div>
      )}
    </section>
  );
}
