export const MINIMUM_AGE = 13;

export const UNDERAGE_ACCESS_MESSAGE =
  "Ages below 13 needs parental consent before accessing LearnSmart. Please contact customer support after that consent is completed.";

export const LEGAL_ACCEPTANCE_ERROR =
  "Please agree to the Terms of Service and Privacy Policy to continue.";

function parseDateOfBirth(dateOfBirth) {
  if (!dateOfBirth || typeof dateOfBirth !== "string") return null;

  const [year, month, day] = dateOfBirth.split("-").map(Number);
  if (!year || !month || !day) return null;

  return { year, month, day };
}

export function calculateAge(dateOfBirth, referenceDate = new Date()) {
  const parsed = parseDateOfBirth(dateOfBirth);
  if (!parsed) return null;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();

  let age = currentYear - parsed.year;
  const hasHadBirthday =
    currentMonth > parsed.month || (currentMonth === parsed.month && currentDay >= parsed.day);

  if (!hasHadBirthday) {
    age -= 1;
  }

  return age;
}

export function isUnderMinimumAge(dateOfBirth, minimumAge = MINIMUM_AGE) {
  const age = calculateAge(dateOfBirth);
  if (age === null) return false;
  return age < minimumAge;
}

export function hasApprovedParentalConsent(metadata) {
  return (
    metadata?.parental_consent_received === true ||
    metadata?.parentalConsentReceived === true ||
    metadata?.parental_consent_status === "approved"
  );
}
