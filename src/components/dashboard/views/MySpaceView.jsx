import { useState } from "react";
import { FiImage, FiSend } from "react-icons/fi";
import ProfileAvatar from "../ProfileAvatar.jsx";
import { MY_SPACE_TABS } from "../dashboardConfig.js";

function CollectionPostCard({ metricLabel, post }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-white">{post.authorName}</div>
        <div className="text-xs text-neutral-500">{metricLabel}</div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{post.content}</p>
    </article>
  );
}

function CollectionPanel({ activeTab, likedPosts, savedPosts }) {
  const renderedCollections = {
    saved: savedPosts.map((post) => (
      <CollectionPostCard key={post.id} metricLabel={`${post.saves} saves`} post={post} />
    )),
    liked: likedPosts.map((post) => (
      <CollectionPostCard key={post.id} metricLabel={`${post.likes} likes`} post={post} />
    )),
  };

  if (renderedCollections[activeTab]?.length) {
    return <div className="space-y-3">{renderedCollections[activeTab]}</div>;
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-neutral-400">
      {activeTab === "liked" ? "No liked posts yet." : "No saved posts yet."}
    </div>
  );
}

function PostPreviewCard({ post }) {
  return (
    <article className="rounded-[26px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <ProfileAvatar
          displayName={post.authorName}
          imageAlt={post.authorImageAlt}
          imageSrc={post.authorImageSrc}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-white">{post.authorName}</div>
            <div className="text-xs text-neutral-500">{post.likes} likes - {post.saves} saves</div>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{post.content}</p>
        </div>
      </div>
    </article>
  );
}

export default function MySpaceView({
  activeTab,
  displayName,
  likedPostIds,
  posts,
  profile,
  savedPostIds,
  userEmail,
  onCreatePost,
  onTabChange,
}) {
  const [postDraft, setPostDraft] = useState("");
  const [postStatus, setPostStatus] = useState("idle");

  const likedPosts = posts.filter((post) => likedPostIds.includes(post.id));
  const savedPosts = posts.filter((post) => savedPostIds.includes(post.id));

  async function handlePostSubmit() {
    const trimmedDraft = postDraft.trim();

    if (!trimmedDraft || postStatus === "posting") return;

    setPostStatus("posting");
    await onCreatePost(trimmedDraft);
    setPostDraft("");
    setPostStatus("success");
    window.setTimeout(() => {
      setPostStatus("idle");
    }, 1400);
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              displayName={displayName}
              imageAlt={profile.imageAlt}
              imageSrc={profile.imageSrc}
              size="lg"
            />
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-white">{displayName}</div>
              <div className="truncate text-sm text-neutral-400">{userEmail}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-neutral-300">
            {profile.bio?.trim() || "No bio added yet."}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
          <div className="flex flex-wrap gap-2">
            {MY_SPACE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm transition",
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "bg-black/20 text-neutral-300 hover:bg-white/[0.08] hover:text-white",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-auto">
            <CollectionPanel
              activeTab={activeTab}
              likedPosts={likedPosts}
              savedPosts={savedPosts}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Post a topic</div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Share a study question, insight, or update.</h2>
            </div>
            <div className="hidden rounded-2xl border border-white/10 bg-black/20 p-3 text-neutral-400 md:block">
              <FiImage />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <ProfileAvatar
              displayName={displayName}
              imageAlt={profile.imageAlt}
              imageSrc={profile.imageSrc}
              size="sm"
            />
            <div className="flex-1 rounded-[24px] border border-white/10 bg-black/20 p-3">
              <textarea
                value={postDraft}
                onChange={(event) => setPostDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    handlePostSubmit();
                  }
                }}
                rows={4}
                placeholder="Share a study question, insight, or topic with the community..."
                className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-neutral-500"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div
                  className={[
                    "text-xs transition",
                    postStatus === "success" ? "text-emerald-300" : "text-neutral-500",
                  ].join(" ")}
                >
                  {postStatus === "posting"
                    ? "Posting..."
                    : postStatus === "success"
                      ? "Success!"
                      : "Your post will appear in Discussions right away."}
                </div>
                <button
                  type="button"
                  onClick={handlePostSubmit}
                  disabled={postStatus === "posting"}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    postStatus === "success"
                      ? "bg-emerald-300 text-emerald-950"
                      : postStatus === "posting"
                        ? "cursor-wait bg-white/80 text-black"
                        : "bg-white text-black hover:bg-neutral-200",
                  ].join(" ")}
                >
                  <FiSend className="text-sm" />
                  {postStatus === "posting" ? "Posting..." : postStatus === "success" ? "Success!" : "Post topic"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
          <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Recent posts</div>
          <div className="mt-4 space-y-3">
            {posts.length ? (
              posts.slice(0, 3).map((post) => <PostPreviewCard key={post.id} post={post} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-neutral-400">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
