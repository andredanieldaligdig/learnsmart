import { useEffect, useRef, useState } from "react";
import { FiBell, FiEdit2 } from "react-icons/fi";
import { supabase, uploadAvatar } from "../../../supabase.js";

function ProfileSettingsPopover({ profile, onSaveProfile }) {
  const popoverRef = useRef(null);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDraftProfile(profile);
      setErrorMessage("");
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (popoverRef.current?.contains(event.target)) return;
      setIsOpen(false);
      setErrorMessage("");
      setSaveState("idle");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  async function handleSave() {
    if (saveState === "saving") return;
    setErrorMessage("");
    setSaveState("saving");
    try {
      await onSaveProfile(draftProfile);
      setSaveState("saved");
      window.setTimeout(() => {
        setSaveState((currentState) => (currentState === "saved" ? "idle" : currentState));
      }, 1400);
    } catch (error) {
      setSaveState("idle");
      setErrorMessage(error?.message || "Could not save profile settings.");
    }
  }

  function handleFieldChange(field, value) {
    setDraftProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setDraftProfile((current) => ({
      ...current,
      imageSrc: localPreview,
      imageAlt: file.name,
    }));

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not logged in");

      const publicUrl = await uploadAvatar(user.id, file);

      setDraftProfile((current) => ({
        ...current,
        imageSrc: publicUrl,
        imageAlt: file.name,
      }));
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setErrorMessage("Image upload failed. Try again.");
    }
  }

  const saveLabel =
    saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : "Save";

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-[60] bg-neutral-950/45 backdrop-blur-xl backdrop-saturate-150" />
      ) : null}

      <div ref={popoverRef} className="relative z-[70]">
        <button
          type="button"
          onClick={() => {
            setDraftProfile(profile);
            setErrorMessage("");
            setIsOpen((currentValue) => !currentValue);
            setSaveState("idle");
          }}
          className={[
            "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm transition",
            isOpen
              ? "border-white/20 bg-white text-black"
              : "border-white/10 bg-white/[0.05] text-neutral-200 hover:bg-white/[0.1] hover:text-white",
          ].join(" ")}
        >
          <FiEdit2 className="text-sm" />
          Profile settings
        </button>

        {isOpen ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-[30px] border border-white/14 bg-neutral-950 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.72)] ring-1 ring-white/10 backdrop-blur-[40px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,22,0.995)_0%,rgba(8,8,10,1)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_32%)] opacity-95" />
            <div className="relative">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-neutral-500">Profile settings</div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-white">Update your profile</div>
                <div className="mt-1 text-sm text-neutral-400">These changes reflect across your posts and profile surfaces.</div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs text-neutral-500">Name</span>
                  <input
                    type="text"
                    value={draftProfile.displayName}
                    onChange={(event) => handleFieldChange("displayName", event.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-white/12 bg-black/55 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/24 placeholder:text-neutral-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-neutral-500">Profile image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2 block w-full overflow-auto rounded-xl border border-white/12 bg-black/55 px-3 py-2.5 text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-black"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-neutral-500">Bio</span>
                  <textarea
                    value={draftProfile.bio}
                    onChange={(event) => handleFieldChange("bio", event.target.value)}
                    placeholder="Write a short professional bio."
                    rows={4}
                    className="mt-2 w-full resize-y rounded-xl border border-white/12 bg-black/55 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/24 placeholder:text-neutral-500"
                  />
                </label>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div
                  className={[
                    "text-xs transition",
                    errorMessage
                      ? "text-rose-300"
                      : saveState === "saved"
                        ? "text-emerald-300"
                        : "text-neutral-500",
                  ].join(" ")}
                >
                  {errorMessage
                    ? errorMessage
                    : saveState === "saving"
                      ? "Saving..."
                      : saveState === "saved"
                        ? "Saved!"
                        : "Save your profile details to update posts and profile surfaces."}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className={[
                    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
                    saveState === "saved"
                      ? "bg-emerald-300 text-emerald-950"
                      : saveState === "saving"
                        ? "cursor-wait bg-white/80 text-black"
                        : "bg-white text-black hover:bg-neutral-200",
                  ].join(" ")}
                >
                  {saveLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function DashboardHeader({
  activeView,
  displayName,
  hasUnreadNotifications,
  notificationCount,
  onNotificationsClick,
  onSaveProfile,
  profile,
}) {
  return (
    <header className="sticky top-0 z-20 bg-neutral-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-xs uppercase tracking-[0.28em] text-neutral-500">LearnSmart</div>
        <div className="flex items-center gap-3">
          {activeView === "my_space" ? (
            <ProfileSettingsPopover profile={profile} onSaveProfile={onSaveProfile} />
          ) : null}

          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-black/60 bg-white text-black transition hover:bg-neutral-100"
            aria-label="Open notifications"
          >
            <FiBell className="text-lg" />
            {hasUnreadNotifications ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)]" />
            ) : null}
            {notificationCount ? (
              <span
                className={[
                  "absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border text-[10px] font-semibold",
                  hasUnreadNotifications
                    ? "border-white bg-black text-white"
                    : "border-black/10 bg-neutral-200 text-black",
                ].join(" ")}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>

          <div className="truncate text-xs text-neutral-500">{displayName}</div>
        </div>
      </div>
    </header>
  );
}