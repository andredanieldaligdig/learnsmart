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

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setDraftProfile((current) => ({
      ...current,
      imageSrc: localPreview,
      imageAlt: file.name,
    }));

    setSaveState("saving");
    setErrorMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error("Not logged in");

      const publicUrl = await uploadAvatar(user.id, file);

      // Build the saved profile with the real public URL
      const savedProfile = {
        ...draftProfile,
        imageSrc: publicUrl,
        imageAlt: file.name,
      };

      // Update local draft so the popover shows the real URL
      setDraftProfile(savedProfile);

      // ✅ Immediately persist to Dashboard state so it shows everywhere
      await onSaveProfile(savedProfile);

      setSaveState("saved");
      window.setTimeout(() => {
        setSaveState((currentState) => (currentState === "saved" ? "idle" : currentState));
      }, 1400);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setErrorMessage("Image upload failed. Try again.");
      setSaveState("idle");
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
              ? "dashboard-action-strong"
              : "dashboard-action",
          ].join(" ")}
        >
          <FiEdit2 className="text-sm" />
          Profile settings
        </button>

        {isOpen ? (
          <div className="dashboard-panel absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-[30px] border p-6 ring-1 ring-white/10 backdrop-blur-[40px]">
            <div className="dashboard-panel absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_32%)] opacity-95" />
            <div className="relative">
              <div>
                <div className="dashboard-muted text-xs uppercase tracking-[0.24em]">Profile settings</div>
                <div className="dashboard-title mt-2 text-lg font-semibold tracking-tight">Update your profile</div>
                <div className="dashboard-copy mt-1 text-sm">These changes reflect across your posts and profile surfaces.</div>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="dashboard-muted text-xs">Name</span>
                  <input
                    type="text"
                    value={draftProfile.displayName}
                    onChange={(event) => handleFieldChange("displayName", event.target.value)}
                    placeholder="Enter your full name"
                    className="dashboard-surface-strong dashboard-input dashboard-title mt-2 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-white/24"
                  />
                </label>

                <label className="block">
                  <span className="dashboard-muted text-xs">Profile image</span>
                  {draftProfile.imageSrc && !draftProfile.imageSrc.startsWith("blob:") ? (
                    <div className="mt-2 mb-2 flex items-center gap-3">
                      <img
                        src={draftProfile.imageSrc}
                        alt={draftProfile.imageAlt}
                        className="h-12 w-12 rounded-2xl border border-white/10 object-cover"
                      />
                      <span className="dashboard-copy text-xs">Current avatar</span>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="dashboard-surface-strong dashboard-copy mt-2 block w-full overflow-auto rounded-xl border px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-black"
                  />
                  <span className="dashboard-muted mt-1 block text-xs">
                    Image uploads automatically save your avatar.
                  </span>
                </label>

                <label className="block">
                  <span className="dashboard-muted text-xs">Bio</span>
                  <textarea
                    value={draftProfile.bio}
                    onChange={(event) => handleFieldChange("bio", event.target.value)}
                    placeholder="Write a short professional bio."
                    rows={4}
                    className="dashboard-surface-strong dashboard-textarea dashboard-title mt-2 w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-white/24"
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
                        : "dashboard-muted",
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
                        ? "dashboard-action-strong cursor-wait"
                        : "dashboard-action-strong",
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
    <header className="dashboard-panel sticky top-0 z-20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="dashboard-muted text-xs uppercase tracking-[0.28em]">LearnSmart</div>
        <div className="flex items-center gap-3">
          {activeView === "my_space" ? (
            <ProfileSettingsPopover profile={profile} onSaveProfile={onSaveProfile} />
          ) : null}

          <button
            type="button"
            onClick={onNotificationsClick}
            className="dashboard-action-strong relative flex h-11 w-11 items-center justify-center rounded-2xl border transition"
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

          <div className="dashboard-muted truncate text-xs">{displayName}</div>
        </div>
      </div>
    </header>
  );
}
