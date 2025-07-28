// check email in allowed admins list (comma separated)
export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = process.env.NEXT_PUBLIC_ALLOWED_ADMINS?.split(",") ?? [];
  return allowed.includes(email);
}