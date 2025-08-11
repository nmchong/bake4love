// check email in allowed admins list from admins table
export async function isAllowedAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    // query the admins table directly
    const response = await fetch('/api/check-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check admin access');
    }
    
    const { isAdmin } = await response.json();
    return isAdmin;
  } catch (error) {
    console.error("Failed to check admin access:", error);
    // fallback to env var
    const allowed = process.env.NEXT_PUBLIC_ALLOWED_ADMINS?.split(",") ?? [];
    return allowed.includes(email);
  }
}