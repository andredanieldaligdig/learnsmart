const RESET_PASSWORD_COOLDOWN_MS = 60 * 1000;
const STORAGE_KEY_PREFIX = "learnsmart-reset-password-cooldown";

function getStorageKey(email) {
  return `${STORAGE_KEY_PREFIX}:${String(email || "").trim().toLowerCase()}`;
}

export function getResetPasswordCooldownMs() {
  return RESET_PASSWORD_COOLDOWN_MS;
}

export function getResetPasswordRemainingMs(email) {
  if (typeof window === "undefined" || !email?.trim()) return 0;

  try {
    const storedValue = window.localStorage.getItem(getStorageKey(email));
    const expiresAt = Number(storedValue);

    if (!Number.isFinite(expiresAt)) return 0;

    return Math.max(0, expiresAt - Date.now());
  } catch {
    return 0;
  }
}

export function startResetPasswordCooldown(email, cooldownMs = RESET_PASSWORD_COOLDOWN_MS) {
  if (typeof window === "undefined" || !email?.trim()) return;

  try {
    window.localStorage.setItem(
      getStorageKey(email),
      String(Date.now() + cooldownMs)
    );
  } catch {
    // Ignore storage write failures and continue gracefully.
  }
}

export function formatResetPasswordCooldown(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (!minutes) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
