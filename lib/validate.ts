export function validateUsername(username: string): string | null {
  const u = username.trim();
  if (u.length < 3) return "Username must be at least 3 characters.";
  if (u.length > 24) return `Username must be 24 characters or fewer — yours is ${u.length}.`;
  const invalid = [...new Set(u.split("").filter((c) => !/[a-zA-Z0-9_]/.test(c)))];
  if (invalid.length > 0) {
    const list = invalid.map((c) => `"${c === " " ? "space" : c}"`).join(", ");
    return `Usernames can only use letters, numbers, and underscores — not allowed: ${list}.`;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 100) return "Password must be under 100 characters.";
  return null;
}
