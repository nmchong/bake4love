// check email in allowed adminsn list (comma separated)
export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = process.env.ALLOWED_ADMINS?.split(",") ?? [];
  return allowed.includes(email);
}