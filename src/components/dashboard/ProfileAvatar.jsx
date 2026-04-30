function getInitials(name) {
  const parts = String(name || "")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return "LS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const SIZE_CLASSES = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-24 w-24 text-2xl",
  xl: "h-32 w-32 text-3xl",
};

export default function ProfileAvatar({ displayName, imageAlt, imageSrc, size = "md" }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={imageAlt || displayName || "Profile image"}
        className={`${sizeClass} rounded-[28px] border border-white/10 object-cover shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}
      />
    );
  }

  return (
    <div
      className={[
        sizeClass,
        "flex items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-white/14 to-white/4 font-semibold tracking-wide text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
      ].join(" ")}
    >
      {getInitials(displayName)}
    </div>
  );
}
